const pool = require('../db/pool');
const { logAction } = require('../utils/logger'); 
const { generateHash, verifyIntegrity } = require('../utils/integrity');

const getSessionHistory = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
            s.session_id, 
            s.program_name, 
            s.session_name, 
            s.hours_to_earn, 
            s.session_date, 
            s.officer_in_charge,
            COUNT(a.pdl_id)::int AS attendee_count
        FROM session_tbl s
        LEFT JOIN attendance_tbl a ON s.session_id = a.session_id
        GROUP BY s.session_id
        ORDER BY s.session_date DESC, s.session_id DESC`
        );

        res.status(200).json(result.rows);
    } catch (err) {
        console.error("❌ History Fetch Error:", err.message);
        res.status(500).json({ error: "Failed to retrieve session history from the Judicial Ledger." });
    }
};



const repairAttendanceIntegrity = async (req, res) => {
    const { session_id, pdl_id, corrected_hours, paper_log_ref } = req.body;
    const client = await pool.connect();
    
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const currentUserId = req.user ? req.user.id : 1; 

    try {
        await client.query('BEGIN');

        const now = new Date();
        const timestampStr = now.toISOString();

        const recoveryHash = generateHash('ATTENDANCE', {
            pdl_id: pdl_id,
            timestamp: timestampStr,
            hours: parseFloat(corrected_hours)
        });

        // 🎯 FIX: Tinanggal ang COALESCE at || para hindi mag-duplicate ang text
        const repairTag = `REPAIRED: Verified via Paper Log [Ref: ${paper_log_ref}]`;

        await client.query(
            `UPDATE attendance_tbl 
             SET hours_attended = $1, 
                 timestamp_in = $2, 
                 row_hash = $3,
                 remarks = $4  -- 👈 Direkta nang o-overwrite dito
             WHERE session_id = $5 AND pdl_id = $6`,
            [parseFloat(corrected_hours), now, recoveryHash, repairTag, session_id, pdl_id]
        );

        await logAction(client, {
            userId: currentUserId,
            action: 'INTEGRITY_REPAIR',
            tableName: 'attendance_tbl',
            recordId: session_id,
            pdlId: pdl_id,
            details: {
                message: "A tampered record was manually re-sealed using physical log evidence.",
                corrected_hours: corrected_hours,
                paper_log_reference: paper_log_ref,
                new_hash: recoveryHash.slice(0, 8) + "..."
            },
            ipAddress: clientIp
        });

        await client.query('COMMIT');

        console.log(`
            --- 🛡️ INTEGRITY REPAIR SUCCESS ---
            PDL ID: ${pdl_id}
            Session ID: ${session_id}
            Remarks Overwritten: "${repairTag}"
            -----------------------------------
        `);

        res.status(200).json({ success: true, message: "Record successfully re-sealed." });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("❌ INTEGRITY REPAIR FAILED:", err.message);
        res.status(500).json({ error: "Failed to repair record integrity." });
    } finally {
        client.release();
    }
};
// 🟢 START SESSION
const startSession = async (req, res) => {
    const { program_name, session_name, hours_to_earn, session_date, officer_in_charge } = req.body;
    const client = await pool.connect();

    // 🛡️ Metadata for Audit Trail
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const currentUserId = req.user ? req.user.id : 1; 

    try {
        await client.query('BEGIN');

        // --- 🛡️ STEP 1: INITIALIZE SESSION ---
        const result = await client.query(
            `INSERT INTO session_tbl (program_name, session_name, hours_to_earn, session_date, officer_in_charge) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [program_name, session_name, parseFloat(hours_to_earn), session_date, officer_in_charge]
        );
        
        const newSession = result.rows[0];

        // --- 🛡️ STEP 2: LOG THE ACTION ---
        await logAction(client, {
            userId: currentUserId,
            action: 'START_PROGRAM_SESSION',
            tableName: 'session_tbl',
            recordId: newSession.session_id, // 🎯 The PK of the new session
            pdlId: null,                    // 🎯 Left null because sessions are group-level, not per-PDL yet
            details: {
                message: `Initialized new session for ${program_name}: ${session_name}`,
                hours_granted: hours_to_earn,
                officer_assigned: officer_in_charge,
                // 📸 Record the initial settings
                session_data: newSession 
            },
            ipAddress: clientIp
        });

        await client.query('COMMIT');
        res.status(201).json(newSession);

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Session Init Error:", err.message);
        res.status(500).json({ error: "Database error during session initialization." });
    } finally {
        client.release();
    }
};

const logAttendance = async (req, res) => {
    const { session_id, rfid_number, hours_to_earn, pdl_id } = req.body;

    try {
        let pdl;

        // 🎯 Path A/B: Get PDL info including their Lock Status
        if (pdl_id) {
            const pdlResult = await pool.query(
                "SELECT pdl_id, first_name, last_name, pdl_picture, is_locked_for_gcta FROM pdl_tbl WHERE pdl_id = $1",
                [pdl_id]
            );
            pdl = pdlResult.rows[0];
        } else {
            const pdlResult = await pool.query(
                "SELECT pdl_id, first_name, last_name, pdl_picture, is_locked_for_gcta FROM pdl_tbl WHERE rfid_number = $1",
                [rfid_number]
            );
            pdl = pdlResult.rows[0];
        }

        // 1. Identify PDL
        if (!pdl) {
            return res.status(404).json({ error: "PDL record not found. Please verify ID or RFID." });
        }

        // 🚫 1.5 DISCIPLINARY LOCK CHECK
        // If the PDL is locked due to a violation, they cannot log attendance for hours.
        if (pdl.is_locked_for_gcta) {
            return res.status(403).json({ 
                error: "Access Denied: This PDL is currently barred from earning credits due to a disciplinary record." 
            });
        }

        // 2. 🛡️ DOUBLE ENTRY CHECK
        const duplicateCheck = await pool.query(
            "SELECT * FROM attendance_tbl WHERE session_id = $1 AND pdl_id = $2",
            [session_id, pdl.pdl_id]
        );

        if (duplicateCheck.rows.length > 0) {
            return res.status(409).json({ error: "PDL already scanned for this session." });
        }
        const now = new Date();
        const timestampStr = now.toISOString(); // Standardized format for hashing

        const attendanceHash = generateHash('ATTENDANCE', {
            pdl_id: pdl.pdl_id,
            timestamp: timestampStr,
            hours: hours_to_earn
        });

        // 3. Log into attendance_tbl
        await pool.query(
            `INSERT INTO attendance_tbl (pdl_id, session_id, hours_attended, timestamp_in, row_hash, remarks) 
            VALUES ($1, $2, $3, $4, $5, $6)`,
            [pdl.pdl_id, session_id, hours_to_earn, now, attendanceHash, 'Original System Log'] // 📝 Just a simple tag
        );

        res.status(200).json(pdl);

    } catch (err) {
        console.error("Attendance Log Error:", err.message);
        res.status(500).json({ error: "Server error during attendance processing." });
    }
};


const removeAttendance = async (req, res) => {
    const { session_id, pdl_id } = req.params;
    const client = await pool.connect();

    // 🛡️ Metadata for Audit Trail
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const currentUserId = req.user ? req.user.id : 1;

    try {
        await client.query('BEGIN');

        // --- 🛡️ STEP 1: SNAPSHOT "BEFORE" ---
        // Fetch the record so we know what we are deleting
        const fetchRecord = await client.query(
            "SELECT * FROM attendance_tbl WHERE session_id = $1 AND pdl_id = $2",
            [session_id, pdl_id]
        );
        const oldData = fetchRecord.rows[0];

        if (!oldData) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: "Attendance record not found." });
        }

        // --- 🛡️ STEP 2: DELETE THE RECORD ---
        const result = await client.query(
            "DELETE FROM attendance_tbl WHERE session_id = $1 AND pdl_id = $2",
            [session_id, pdl_id]
        );

        // --- 🛡️ STEP 3: LOG THE REMOVAL ---
        await logAction(client, {
            userId: currentUserId,
            action: 'REMOVE_ATTENDEE',
            tableName: 'attendance_tbl',
            recordId: session_id, // Using session_id as the anchor
            pdlId: pdl_id,        // 🎯 Tag the specific PDL being removed
            details: {
                message: `PDL was removed from session attendance.`,
                reason: "Incorrect RFID tap / Manual correction",
                // 📸 Snapshot of the deleted record
                deleted_record: oldData 
            },
            ipAddress: clientIp
        });

        await client.query('COMMIT');
        res.status(200).json({ message: "PDL removed from session successfully." });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Remove Attendance Error:", err.message);
        res.status(500).json({ error: "Server error while removing attendee." });
    } finally {
        client.release();
    }
};




// 🔴 FINALIZE SESSION (Sync to PDL Ledger)
const finalizeSession = async (req, res) => {
    const { session_id } = req.params;
    const client = await pool.connect();

    // 🛡️ Metadata for Audit Trail
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const currentUserId = req.user ? req.user.id : 1;

    try {
        await client.query('BEGIN');

        // --- 🛡️ STEP 1: FETCH SESSION DATA (For the Log) ---
        const sessionResult = await client.query(
            "SELECT * FROM session_tbl WHERE session_id = $1",
            [session_id]
        );
        const sessionData = sessionResult.rows[0];

        if (!sessionData) {
            throw new Error("Session not found.");
        }

        // --- 🛡️ STEP 2: VERIFY LOGS EXIST ---
        const checkLogs = await client.query(
            "SELECT COUNT(*) FROM attendance_tbl WHERE session_id = $1 AND status = 'Active'",
            [session_id]
        );

        const attendeeCount = parseInt(checkLogs.rows[0].count);

        if (attendeeCount === 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: "Cannot finalize an empty session. Discard it instead." });
        }

        // --- 🛡️ STEP 3: LOG THE FINALIZATION ACTION ---
        // Even if we don't change the session table, we log that the Warden "Locked" it.
        await logAction(client, {
            userId: currentUserId,
            action: 'FINALIZE_PROGRAM_SESSION',
            tableName: 'session_tbl',
            recordId: session_id,
            pdlId: null, 
            details: {
                message: `Warden finalized session: ${sessionData.session_name}`,
                attendee_count: attendeeCount,
                program_name: sessionData.program_name,
                original_data: sessionData // 📸 Snapshot of the session being closed
            },
            ipAddress: clientIp
        });

        await client.query('COMMIT');
        
        res.status(200).json({ 
            success: true,
            message: "Session attendance locked. Credits will be calculated at month-end." 
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("❌ Finalize Error:", err.message);
        res.status(500).json({ error: "Failed to finalize session logs." });
    } finally {
        client.release();
    }
};

// 🗑️ CANCEL SESSION (Discard)
const cancelSession = async (req, res) => {
    const { session_id } = req.params;
    const client = await pool.connect();

    // 🛡️ Metadata for Audit Trail
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const currentUserId = req.user ? req.user.id : 1;

    try {
        await client.query('BEGIN');

        // --- 🛡️ STEP 1: SNAPSHOT "BEFORE" ---
        // Since we are about to DELETE, we need to save the data for the log now.
        const sessionResult = await client.query(
            "SELECT * FROM session_tbl WHERE session_id = $1",
            [session_id]
        );
        const sessionData = sessionResult.rows[0];

        if (!sessionData) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: "Session not found." });
        }

        // Count how many attendance logs are about to be wiped
        const checkLogs = await client.query(
            "SELECT COUNT(*) FROM attendance_tbl WHERE session_id = $1",
            [session_id]
        );
        const logsWiped = parseInt(checkLogs.rows[0].count);

        // --- 🛡️ STEP 2: THE WIPEOUT ---
        // Delete logs first (Foreign Key safety)
        await client.query("DELETE FROM attendance_tbl WHERE session_id = $1", [session_id]);
        
        // Delete the parent session
        await client.query("DELETE FROM session_tbl WHERE session_id = $1", [session_id]);

        // --- 🛡️ STEP 3: THE AUDIT "RECEIPT" ---
        await logAction(client, {
            userId: currentUserId,
            action: 'CANCEL_PROGRAM_SESSION',
            tableName: 'session_tbl',
            recordId: session_id,
            pdlId: null, 
            details: {
                message: `Session "${sessionData.session_name}" was discarded.`,
                reason: "Manual cancellation (Misclick/Error)",
                attendance_records_deleted: logsWiped,
                // 📸 This is the only remaining record of the session!
                deleted_snapshot: sessionData 
            },
            ipAddress: clientIp
        });

        await client.query('COMMIT');
        res.status(200).json({ message: "Session and logs discarded. Action logged." });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("❌ Cancel Error:", err.message);
        res.status(500).json({ error: "Failed to discard session." });
    } finally {
        client.release();
    }
};

const reloadSession = async (req, res) => {
    const { session_id } = req.params;
    const client = await pool.connect();

    // 🛡️ Metadata for Audit Trail
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const currentUserId = req.user ? req.user.id : 1;

    console.log("🔄 Reload triggered for session:", session_id);

    try {
        await client.query('BEGIN');

        // --- 🛡️ STEP 1: SNAPSHOT "BEFORE" ---
        const sessionResult = await client.query(
            "SELECT * FROM session_tbl WHERE session_id = $1",
            [session_id]
        );
        const sessionData = sessionResult.rows[0];

        if (!sessionData) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: "Session not found." });
        }

        // Count logs before wiping them
        const checkLogs = await client.query(
            "SELECT COUNT(*) FROM attendance_tbl WHERE session_id = $1",
            [session_id]
        );
        const logsWiped = parseInt(checkLogs.rows[0].count);

        // --- 🛡️ STEP 2: THE WIPEOUT ---
        await client.query("DELETE FROM attendance_tbl WHERE session_id = $1", [session_id]);
        const deleteResult = await client.query("DELETE FROM session_tbl WHERE session_id = $1", [session_id]);

        // --- 🛡️ STEP 3: THE AUDIT LOG ---
        await logAction(client, {
            userId: currentUserId,
            action: 'RELOAD_DISCARD_SESSION', // 🎯 Specific label for reloads
            tableName: 'session_tbl',
            recordId: session_id,
            pdlId: null,
            details: {
                message: `Session "${sessionData.session_name}" was discarded via page reload/reset.`,
                attendance_records_removed: logsWiped,
                // 📸 Snapshot of what was lost
                deleted_snapshot: sessionData 
            },
            ipAddress: clientIp
        });

        await client.query('COMMIT');
        res.status(200).json({ message: "Session and logs discarded. Action logged." });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("❌ Reload Error:", err.message);
        res.status(500).json({ error: "Failed to reset session data." });
    } finally {
        client.release();
    }
};

const searchPdls = async (req, res) => {
    const { term } = req.query;

    try {
        // Search by First Name, Last Name, or PDL ID
        const result = await pool.query(
            `SELECT pdl_id, first_name, last_name, pdl_picture 
            FROM pdl_tbl 
            WHERE (first_name ILIKE $1 OR last_name ILIKE $1 OR CAST(pdl_id AS TEXT) ILIKE $1)
            AND pdl_status != 'Released' 
            LIMIT 10`,
            [`%${term}%`]
        );

        res.status(200).json(result.rows);
    } catch (err) {
        console.error("❌ Search Error:", err.message);
        res.status(500).json({ error: "Failed to search PDL records." });
    }
};

const getSessionDetails = async (req, res) => {
    const { id } = req.params;

    try {
        const sessionInfo = await pool.query(
            "SELECT * FROM session_tbl WHERE session_id = $1",
            [id]
        );

        if (sessionInfo.rows.length === 0) {
            return res.status(404).json({ error: "Session not found." });
        }

        // 🎯 UPDATED QUERY: We now fetch row_hash and timestamp_in
        const attendees = await pool.query(
            `SELECT 
                a.pdl_id, 
                p.first_name, 
                p.last_name, 
                p.pdl_picture, 
                a.hours_attended,
                a.row_hash,
                a.timestamp_in 
             FROM attendance_tbl a
             JOIN pdl_tbl p ON a.pdl_id = p.pdl_id
             WHERE a.session_id = $1
             ORDER BY p.last_name ASC`,
            [id]
        );

        // 🕵️ THE AUDIT LAYER: Check every single attendee for tampering
        const auditedAttendees = attendees.rows.map(row => {
            const dataToVerify = {
                pdl_id: row.pdl_id,
                timestamp: row.timestamp_in ? new Date(row.timestamp_in).toISOString() : "",
                hours: row.hours_attended
            };

            // If row_hash doesn't match the data, it's tampered!
            const isIntegral = row.row_hash ? verifyIntegrity('ATTENDANCE', row.row_hash, dataToVerify) : false;

            return {
                ...row,
                is_tampered: !isIntegral // 🚩 True if the seal is broken
            };
        });

        res.status(200).json({
            session: sessionInfo.rows[0],
            attendees: auditedAttendees // 🚀 Send the protected list
        });

    } catch (err) {
        console.error("❌ Detail Fetch Error:", err.message);
        res.status(500).json({ error: "Failed to retrieve session details." });
    }
};


const calculateReleaseDate = (committalDate, years, months, days, totalCredits) => {
    // 1. Create date using UTC to avoid timezone shifts
    const d = new Date(committalDate);
    let release = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    
    // 2. Add Sentence Duration (Calendar-based)
    release.setUTCFullYear(release.getUTCFullYear() + parseInt(years || 0));
    release.setUTCMonth(release.getUTCMonth() + parseInt(months || 0));
    release.setUTCDate(release.getUTCDate() + parseInt(days || 0));

    // 3. Apply the Inclusive Day Rule (-1)
    // Jan 26 is Day 1, so a 1-day sentence ends on Jan 26, not Jan 27.
    release.setUTCDate(release.getUTCDate() - 1);

    // 4. Subtract the Credits (GCTA + TASTM)
    release.setUTCDate(release.getUTCDate() - parseInt(totalCredits || 0));

    // 5. Return as YYYY-MM-DD
    return release.toISOString().split('T')[0]; 
};



const silentGctaSync = async (req, res) => {
    const client = await pool.connect();
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const currentUserId = req.user ? req.user.id : 1;

    try {
        await client.query('BEGIN');
        
        // 🕒 Temporal Normalization
        const now = new Date(2026, 6); // June 2026 (based on your test code)
        const monthYear = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthYearStr = monthYear.toISOString().slice(0, 7); // "2026-06"

        console.log(`--- 🚀 Starting GCTA Monthly Sync: ${now.toDateString()} ---`);

        // 🎯 STAGE 1: THE AUTO-UNLOCK (Remains the same)
        const unlockResult = await client.query(`
            UPDATE pdl_tbl SET is_locked_for_gcta = false 
            WHERE is_locked_for_gcta = true 
            AND pdl_status NOT IN ('Released', 'Escaped', 'Deceased')
            AND pdl_id IN (
                SELECT pdl_id FROM incident_tbl 
                GROUP BY pdl_id HAVING MAX(penalty_end_date)::DATE <= CURRENT_DATE
            )
        `);

        // 🎯 STAGE 2: IDENTIFY ELIGIBLE PDLs (Changed from INSERT to SELECT)
        // We find who needs GCTA first so we can hash them in the loop
        const eligiblePdls = await client.query(`
            SELECT pdl_id FROM pdl_tbl 
            WHERE pdl_status NOT IN ('Released', 'Escaped', 'Deceased')
            AND is_locked_for_gcta = false
            AND (
                (is_legally_disqualified = false AND date_admitted_bjmp <= $1::DATE - INTERVAL '1 month')
                OR 
                (is_legally_disqualified = true AND date_of_final_judgment IS NOT NULL AND date_of_final_judgment <= $1::DATE - INTERVAL '1 month')
            )
            AND pdl_id NOT IN (
                SELECT pdl_id FROM gcta_days_log 
                WHERE DATE_TRUNC('month', month_year) = DATE_TRUNC('month', $1::DATE)
                AND (remarks ILIKE 'Automated TASTM%' OR remarks ILIKE 'Automated GCTA%' OR remarks ILIKE '%Voided%')
            )
        `, [now]);

        console.log(` └─ 🛡️  Found ${eligiblePdls.rowCount} eligible PDLs for GCTA.`);

        const affectedIds = [];

        // 🎯 STAGE 3: THE SECURE LOOP (Grant + Hash + Recalculate)
        for (let row of eligiblePdls.rows) {
            const pdlId = row.pdl_id;

            // 1. Generate the Integrity Seal for GCTA
            const gctaHash = generateHash('GCTA', {
                pdl_id: pdlId,
                month: monthYearStr,
                days: 20 // Standard GCTA grant
            });

            // 2. Insert Secure GCTA Record
            await client.query(`
                INSERT INTO gcta_days_log (pdl_id, month_year, days_earned, date_granted, status, remarks, row_hash)
                VALUES ($1, $2, 20, $3, 'Active', 'Automated GCTA', $4)
            `, [pdlId, monthYear, now, gctaHash]);

            // 3. Fetch PDL Data for Recalculation
            const pdlData = await client.query(
                `SELECT date_commited_pnp, date_admitted_bjmp, date_of_final_judgment, 
                        is_legally_disqualified, sentence_years, sentence_months, sentence_days 
                 FROM pdl_tbl WHERE pdl_id = $1`, [pdlId]
            );

            if (pdlData.rows.length > 0) {
                const p = pdlData.rows[0];
                const anchorDate = p.is_legally_disqualified ? p.date_of_final_judgment : p.date_admitted_bjmp;

                // Sum all Active Credits (This ensures the new hash is included in the sum)
                const sums = await client.query(
                    `SELECT 
                        (SELECT COALESCE(SUM(days_earned), 0) FROM gcta_days_log 
                         WHERE pdl_id = $1 AND status = 'Active' AND month_year >= $2) AS gcta_sum,
                        (SELECT COALESCE(SUM(days_earned), 0) FROM tastm_days_log 
                         WHERE pdl_id = $1 AND status = 'Active' AND month_year >= $2) AS tastm_sum`, 
                    [pdlId, anchorDate]
                );
                
                const totalCredits = (parseInt(sums.rows[0].gcta_sum) || 0) + (parseInt(sums.rows[0].tastm_sum) || 0);

                // Recalculate Release Date
                const newReleaseDate = calculateReleaseDate(
                    p.date_commited_pnp, p.sentence_years, p.sentence_months, p.sentence_days, totalCredits
                );

                // Update PDL Table
                await client.query(
                    `UPDATE pdl_tbl SET total_timeallowance_earned = $1, expected_releasedate = $2 WHERE pdl_id = $3`, 
                    [totalCredits, newReleaseDate, pdlId]
                );

                affectedIds.push(pdlId);
                console.log(` └─ ✅ PDL ${pdlId}: Granted 20 days. New Release: ${new Date(newReleaseDate).toLocaleDateString()}`);
            }
        }

        // 🎯 STAGE 4: AUDIT LOGGING
        if (affectedIds.length > 0) {
            await logAction(client, {
                userId: currentUserId,
                action: 'SYSTEM_GCTA_SYNC',
                tableName: 'gcta_days_log',
                details: {
                    message: "Automated GCTA synchronization performed with integrity hashing.",
                    sync_month: monthYearStr,
                    unlocked_count: unlockResult.rowCount,
                    credits_granted_to: affectedIds.length,
                    affected_pdl_ids: affectedIds
                },
                ipAddress: clientIp
            });
        }

        await client.query('COMMIT');
        res.status(200).json({ success: true, granted: affectedIds.length });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error(`❌ GCTA SYNC FATAL ERROR:`, err.message);
        res.status(500).json({ error: "Sync failed", details: err.message });
    } finally {
        client.release();
    }
};

const silentTastmSync = async (req, res) => {
    const client = await pool.connect();
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const currentUserId = req.user ? req.user.id : 1;
    const affectedPdlIds = []; 

    try {
        await client.query('BEGIN');

        const now = new Date(); 
        const monthYear = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthYearStr = monthYear.toISOString().slice(0, 7);
        const lockResult = await client.query(`SELECT pg_try_advisory_xact_lock(123456789) AS acquired`);
        if (!lockResult.rows[0].acquired) {
            return res.status(409).json({ message: "Sync already in progress." });
        }

        const pdls = await client.query(`
            SELECT pdl_id, pdl_status, is_legally_disqualified, date_of_final_judgment 
            FROM pdl_tbl 
            WHERE pdl_status NOT IN ('Released', 'Escaped', 'Deceased')
            AND is_locked_for_gcta = false
        `);

        for (let p of pdls.rows) {
            const pdlId = p.pdl_id;
            const isDQ = p.is_legally_disqualified;
            const judgmentDate = p.date_of_final_judgment ? new Date(p.date_of_final_judgment) : null;
            
            console.log(`\n[PDL ${pdlId}] ---------------------------------`);

            const msecManualOverride = await client.query(`
                SELECT tastm_log_id 
                FROM tastm_days_log 
                WHERE pdl_id = $1 
                AND DATE_TRUNC('month', month_year AT TIME ZONE 'Asia/Manila') 
                    = DATE_TRUNC('month', $2::DATE AT TIME ZONE 'Asia/Manila')
                AND remarks ILIKE '%MSEC DQ: TASTM Voided%' -- 🎯 THE ONLY TARGET
                LIMIT 1
            `, [pdlId, now]);

            if (msecManualOverride.rows.length > 0) {
                console.log(`  └─ 🛑 MSEC OVERRIDE: Skipping PDL ${pdlId} due to disciplinary record.`);
                continue; // 🚀 Skip to next PDL
            }

            // 🔍 1. FIND THE ANCHOR (The "Save Point")
            // 🎯 THE FIX: We must search for Migration records even if they are 'Inactive'.
            // If we don't, and we already locked the migration, the script finds NO anchor, 
            // sets carryOver to 0, and wipes the current month's progress.
            const anchorResult = await client.query(`
                SELECT tastm_log_id, total_hours_accumulated, days_earned, remarks, status 
                FROM tastm_days_log 
                WHERE pdl_id = $1 
                AND (
                    remarks ILIKE 'Migration%' 
                    AND remarks NOT ILIKE '%VOIDED%' 
                    AND status != 'Voided'
                    OR 
                    (
                        remarks ILIKE 'Automated TASTM%' 
                        AND status = 'Active' 
                        AND month_year < DATE_TRUNC('month', $2::DATE AT TIME ZONE 'Asia/Manila')
                    )
                )
                ORDER BY month_year DESC, tastm_log_id DESC LIMIT 1
            `, [pdlId, now]);
            
            let carryOver = 0;
            let migrationToLockId = null;

            if (anchorResult.rows.length > 0) {
                const anchor = anchorResult.rows[0];
                const isMigration = anchor.remarks.includes('Migration');

                // 🎯 THE JUDGMENT CHECKER (Part A):
                // We ONLY wipe migration hours if they are DQ'd AND have NO judgment date (Detention).
                // If they have a judgmentDate, the migration record represents "Sentenced" starting hours.
                if (isDQ && isMigration && judgmentDate === null) {
                    carryOver = 0; 
                    console.log(`  └─ 🛡️  Migration hours ignored (Still in DQ Detention Phase)`);
                } else if (isMigration) {
                    carryOver = parseFloat(anchor.total_hours_accumulated) || 0;
                    console.log(`  └─ ✅ Migration hours used: ${carryOver} hrs`);
                } else {
                    // For existing Automated logs, only carry over if the 60hr milestone wasn't hit
                    carryOver = parseInt(anchor.days_earned) === 0 ? (parseFloat(anchor.total_hours_accumulated) || 0) : 0;
                }

                // Prepare to lock Migration row once it's been handshaked into the system
                if (isMigration && anchor.status === 'Active' && !anchor.remarks.includes('Locked')) {
                    migrationToLockId = anchor.tastm_log_id;
                }
            }

            // 🔍 2. SUM CURRENT MONTH ATTENDANCE
            const attendanceRecords = await client.query(`
                    SELECT hours_attended, row_hash, timestamp_in 
                    FROM attendance_tbl 
                    WHERE pdl_id = $1 AND status = 'Active' 
                    AND DATE_TRUNC('month', timestamp_in AT TIME ZONE 'Asia/Manila') 
                        = DATE_TRUNC('month', $4::DATE AT TIME ZONE 'Asia/Manila') 
                    AND (
                        $2::BOOLEAN = false 
                        OR $3::TIMESTAMP IS NULL 
                        OR timestamp_in >= $3::TIMESTAMP
                    )
                `, [pdlId, isDQ, judgmentDate, now]);

                let thisMonthAttendance = 0;
                let hasTamperedRecords = false;

                // 🕵️ THE GATEKEEPER LOOP: Auditing the evidence row-by-row
                for (let record of attendanceRecords.rows) {
                    // We normalize the data exactly how generateHash expects it
                    const dataToVerify = {
                        pdl_id: pdlId,
                        timestamp: new Date(record.timestamp_in).toISOString(),
                        hours: record.hours_attended
                    };

                    // 🛡️ VERIFY THE SEAL
                    const isIntegral = record.row_hash ? verifyIntegrity('ATTENDANCE', record.row_hash, dataToVerify) : false;

                    if (isIntegral) {
                        // Only add hours if the cryptographic seal is UNBROKEN
                        thisMonthAttendance += parseFloat(record.hours_attended);
                    } else {
                        // 🚩 RED ALERT: This record has been tampered with or is missing a seal
                        hasTamperedRecords = true;
                        console.error(`🚨 INTEGRITY BREACH: PDL ${pdlId} has a tampered attendance record. Excluding from TASTM calculation.`);
                    }
                }

                // 🧮 FINAL CALCULATION
                let totalToEvaluate = carryOver + thisMonthAttendance;

                if (hasTamperedRecords) {
                    console.log(` ⚠️  Warning: Total for PDL ${pdlId} only reflects verified hours.`);
                }

                console.log(`  └─ 🧮 ${carryOver} (Carry) + ${thisMonthAttendance} (Verified Attendance) = ${totalToEvaluate} Total`);
            const existingThisMonth = await client.query(`
                SELECT tastm_log_id, total_hours_accumulated, days_earned, status, remarks
                FROM tastm_days_log 
                WHERE pdl_id = $1 
                AND remarks ILIKE 'Automated TASTM%'
                AND DATE_TRUNC('month', month_year AT TIME ZONE 'Asia/Manila') 
                    = DATE_TRUNC('month', $2::DATE AT TIME ZONE 'Asia/Manila')
                ORDER BY tastm_log_id DESC LIMIT 1
            `, [pdlId, now]);

            let daysToGrant = totalToEvaluate >= 60 ? 15 : 0;
            
            const rowHash = generateHash('TASTM', {
                pdl_id: pdlId,
                month: monthYearStr,
                hours: totalToEvaluate,
                days: daysToGrant
            });
            
            if (existingThisMonth.rows.length > 0) {
                const existingRow = existingThisMonth.rows[0];
                const hoursChanged = parseFloat(existingRow.total_hours_accumulated) !== totalToEvaluate;
                const daysChanged = parseInt(existingRow.days_earned) !== daysToGrant;

                if (hoursChanged || daysChanged) {
                    await client.query(`
                        UPDATE tastm_days_log SET 
                            total_hours_accumulated = $1, 
                            days_earned = $2, 
                            row_hash = $3,
                            status = 'Active', 
                            remarks = CASE WHEN remarks ILIKE '%Restored%' THEN remarks ELSE 'Automated TASTM' END, 
                            date_granted = NOW()
                        WHERE tastm_log_id = $4`,
                        [totalToEvaluate, daysToGrant, rowHash, existingRow.tastm_log_id]
                    );
                    affectedPdlIds.push(pdlId); 
                    console.log(`  └─ ✅ Updated Month Record`);
                }
            } else if (totalToEvaluate > 0) {
                await client.query(`
                    INSERT INTO tastm_days_log (pdl_id, month_year, total_hours_accumulated, days_earned, status, remarks, row_hash, date_granted)
                    VALUES ($1, $2, $3, $4, 'Active', 'Automated TASTM', $5, NOW())`,
                    [pdlId, monthYear, totalToEvaluate, daysToGrant, rowHash]
                );
                affectedPdlIds.push(pdlId);
                console.log(`  └─ ✨ Created New Month Record`);
            }

            if (migrationToLockId) {
                await client.query(`UPDATE tastm_days_log SET remarks = remarks || ' - Locked', status = 'Inactive' WHERE tastm_log_id = $1`, [migrationToLockId]);
            }
        }

        if (affectedPdlIds.length > 0) {
            await logAction(client, {
                userId: currentUserId,
                action: 'SYSTEM_TASTM_SYNC',
                tableName: 'tastm_days_log',
                details: { message: "Automated TASTM sync completed.", affected_count: affectedPdlIds.length, pdls: affectedPdlIds },
                ipAddress: clientIp
            });
        }

        await client.query('COMMIT');
        res.status(200).json({ success: true, message: "Sync Complete." });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("❌ SYNC FATAL ERROR:", err.message);
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
};

// ✍️ UPDATE INDIVIDUAL ATTENDANCE HOURS (The Overtime Fix)
const updateAttendanceHours = async (req, res) => {
    const { session_id, pdl_id, new_hours } = req.body;
    const client = await pool.connect();

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const currentUserId = req.user ? req.user.id : 1;

    try {
        await client.query('BEGIN');

        // --- 🛡️ STEP 1: SNAPSHOT "BEFORE" ---
        const fetchOld = await client.query(
            "SELECT * FROM attendance_tbl WHERE session_id = $1 AND pdl_id = $2",
            [session_id, pdl_id]
        );
        const oldData = fetchOld.rows[0];

        if (!oldData) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: "Attendance record not found." });
        }

        // --- 🎯 STEP 2: GENERATE THE NEW INTEGRITY SEAL ---
        const now = new Date();
        const timestampStr = now.toISOString();

        const newRowHash = generateHash('ATTENDANCE', {
            pdl_id: pdl_id,
            timestamp: timestampStr,
            hours: parseFloat(new_hours)
        });

        // 🤖 System-generated audit tag
        const systemRemark = ` | MANUALLY ADJUSTED: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;

        // --- 🛡️ STEP 3: RUN THE SECURE UPDATE WITH REMARKS ---
        const result = await client.query(
            `UPDATE attendance_tbl 
            SET hours_attended = $1, 
                timestamp_in = $2, 
                row_hash = $3,
                remarks = COALESCE(remarks, '') || $4 
            WHERE session_id = $5 AND pdl_id = $6
            RETURNING *`,
            [parseFloat(new_hours), now, newRowHash, systemRemark, session_id, pdl_id]
        );

        const newData = result.rows[0];

        // --- 🛡️ STEP 4: LOG THE CHANGE TO AUDIT_LOGS ---
        await logAction(client, {
            userId: currentUserId,
            action: 'UPDATE_ATTENDANCE_HOURS',
            tableName: 'attendance_tbl',
            recordId: session_id, 
            pdlId: pdl_id,
            details: {
                message: `Attendance hours manually adjusted. New hash generated.`,
                old_hours: oldData.hours_attended,
                new_hours: newData.hours_attended,
                integrity_seal: newRowHash.slice(0, 8) + "...",
                remark_added: systemRemark,
                before: oldData,
                after: newData
            },
            ipAddress: clientIp
        });

        await client.query('COMMIT');
        console.log(`  └─ 🔒 Integrity Re-sealed & Tagged for PDL ${pdl_id}`);
        res.status(200).json({ message: "Hours updated and re-sealed successfully!", record: newData });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("❌ Update Hours Error:", err.message);
        res.status(500).json({ error: "Database error while updating hours." });
    } finally {
        client.release();
    }
};



const getMonthlyEvaluation = async (req, res) => {
    const { month } = req.query; 

    console.log("\n--- ⚖️ MSEC DEBUG START ---");
    console.log("📅 Targeted Month-Year:", month);

    try {
        const query = `
            WITH MonthlyGCTA AS (
                SELECT 
                    pdl_id, 
                    SUM(CASE WHEN status = 'Active' THEN days_earned ELSE 0 END) as total_gcta,
                    COUNT(*) FILTER (WHERE remarks ILIKE 'MSEC DQ%') as dq_count
                FROM gcta_days_log
                WHERE TO_CHAR(month_year, 'YYYY-MM') = $1
                AND remarks NOT ILIKE '%Migration%' 
                AND (status = 'Active' OR remarks ILIKE 'MSEC DQ%')
                GROUP BY pdl_id
            ),
            MonthlyTASTM AS (
                SELECT 
                    pdl_id, 
                    SUM(CASE WHEN status = 'Active' THEN days_earned ELSE 0 END) as total_tastm,
                    COUNT(*) FILTER (WHERE remarks ILIKE 'MSEC DQ%') as dq_count
                FROM tastm_days_log
                WHERE TO_CHAR(month_year, 'YYYY-MM') = $1
                AND remarks NOT ILIKE '%Migration%'
                AND (status = 'Active' OR remarks ILIKE 'MSEC DQ%')
                GROUP BY pdl_id
            )
            SELECT 
                p.pdl_id, 
                p.first_name, 
                p.last_name, 
                p.pdl_picture,
                COALESCE(mg.total_gcta, 0) as monthly_gcta,
                COALESCE(mt.total_tastm, 0) as monthly_tastm,
                -- 🎯 NEW: Separate status flags
                CASE WHEN COALESCE(mg.dq_count, 0) > 0 THEN 'Voided' ELSE 'Active' END as gcta_status,
                CASE WHEN COALESCE(mt.dq_count, 0) > 0 THEN 'Voided' ELSE 'Active' END as tastm_status
            FROM pdl_tbl p
            LEFT JOIN MonthlyGCTA mg ON p.pdl_id = mg.pdl_id
            LEFT JOIN MonthlyTASTM mt ON p.pdl_id = mt.pdl_id
            WHERE mg.pdl_id IS NOT NULL OR mt.pdl_id IS NOT NULL
            ORDER BY p.last_name ASC;
        `;

        const result = await pool.query(query, [month]);

        // 📝 Console Logging the Results
        console.log(`✅ Query Successful. Rows found: ${result.rows.length}`);
        if (result.rows.length > 0) {
            console.table(result.rows.map(row => ({
                ID: row.pdl_id,
                Name: `${row.last_name}, ${row.first_name}`,
                GCTA: row.monthly_gcta,
                TASTM: row.monthly_tastm,
                // 🎯 Update these keys to match your new SQL columns!
                G_Status: row.gcta_status, 
                T_Status: row.tastm_status 
            })));
        } else {
            console.log("⚠️ No matching PDL records found for this month.");
        }
        console.log("--- ⚖️ MSEC DEBUG END ---\n");

        res.status(200).json(result.rows);
    } catch (err) {
        console.error("❌ MSEC Load Error:", err.message);
        res.status(500).json({ error: "Failed to load MSEC list." });
    }
};

// 🚫 THE DISQUALIFY HAMMER (With MSEC Tag)
const disqualifyPdlMonthly = async (req, res) => {
    const { pdl_id, month_year, target } = req.body; 
    const client = await pool.connect();
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const currentUserId = req.user ? req.user.id : 1;
    try {
        await client.query('BEGIN');

        // 🛡️ 1. GCTA SHIELD: Only void if target is GCTA or BOTH
        if (target === "GCTA" || target === "BOTH") {
            await client.query(`
                UPDATE gcta_days_log 
                SET status = 'Voided', 
                    remarks = 'MSEC DQ: GCTA Voided for ' || $2
                WHERE pdl_id = $1 
                  AND TO_CHAR(month_year, 'YYYY-MM') = $2
                  AND remarks NOT ILIKE '%Migration%'; -- 🛡️ PROTECT MIGRATION
            `, [pdl_id, month_year]);
        }

        // 🛡️ 2. TASTM SHIELD: Only void if target is TASTM or BOTH
        if (target === "TASTM" || target === "BOTH") {
            // Void Summary
            await client.query(`
                UPDATE tastm_days_log 
                SET status = 'Voided', 
                    remarks = 'MSEC DQ: TASTM Voided for ' || $2
                WHERE pdl_id = $1 
                  AND TO_CHAR(month_year, 'YYYY-MM') = $2
                  AND remarks NOT ILIKE '%Migration%'; -- 🛡️ PROTECT MIGRATION
            `, [pdl_id, month_year]);

            // Void Source Attendance (No 'remarks' column fix)
            // 🎯 NEW LOGIC: We look for ANY attendance rows where the session matches April,
            // OR where the internal timestamp (column 5 in your snippet) matches April.
            await client.query(`
                UPDATE attendance_tbl
                SET status = 'Voided'
                WHERE pdl_id = $1 
                  AND (
                    session_id IN (SELECT session_id FROM session_tbl WHERE TO_CHAR(session_date, 'YYYY-MM') = $2)
                    -- 🚑 BACKUP: In case the session table is wrong, check the attendance date string directly
                    -- Replace 'date_logged' with your column 5 name (e.g., date_logged or created_at)
                    OR TO_CHAR(CAST(timestamp_in AS TIMESTAMP), 'YYYY-MM') = $2
                  );
            `, [pdl_id, month_year]);
        }
        await logAction(client, {
            userId: currentUserId,
            action: 'MSEC_VOID_CREDITS',
            tableName: 'multiple_credit_logs', // Indicates impact across tables
            recordId: pdl_id, 
            pdlId: pdl_id,
            details: {
                message: `MSEC officially VOIDED ${target} credits for the period of ${month_year}.`,
                target_voided: target,
                month_affected: month_year,
                status_change: "Active -> Voided"
            },
            ipAddress: clientIp
        });
        await client.query('COMMIT');
        res.status(200).json({ message: `Success: ${target} voided.` });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("MSEC DQ Error:", err.message);
        res.status(500).json({ error: "Disqualification failed." });
    } finally {
        client.release();
    }
};

// ✅ THE RESTORE BUTTON (Targets ONLY MSEC Tags)
const reenablePdlMonthly = async (req, res) => {
    const { pdl_id, month_year, target } = req.body; // month_year expected as 'YYYY-MM'
    const client = await pool.connect();
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const currentUserId = req.user ? req.user.id : 1;

    try {
        await client.query('BEGIN');

        // 🎯 1. Restore GCTA log entry
        if (target === 'GCTA' || target === 'BOTH') {
            await client.query(`
                UPDATE gcta_days_log 
                SET status = 'Active', 
                    remarks = 'Automated GCTA (Restored by MSEC)'
                WHERE pdl_id = $1 
                AND TO_CHAR(month_year, 'YYYY-MM') = $2 
                AND status = 'Voided' 
                AND remarks ILIKE 'MSEC DQ%'
            `, [pdl_id, month_year]);
        }

        // 🎯 2. Restore TASTM log entry
        if (target === 'TASTM' || target === 'BOTH') {
            await client.query(`
                UPDATE tastm_days_log 
                SET status = 'Active', 
                    remarks = 'Automated TASTM (Restored by MSEC)'
                WHERE pdl_id = $1 
                AND TO_CHAR(month_year, 'YYYY-MM') = $2 
                AND status = 'Voided' 
                AND remarks ILIKE 'MSEC DQ%'
            `, [pdl_id, month_year]);
        }

        // 🎯 3. REACTIVATE ATTENDANCE ROWS (The Missing Piece)
        // We only do this for TASTM or BOTH since GCTA is conduct-based, 
        // but TASTM strictly relies on these hours to stay Active.
        if (target === 'TASTM' || target === 'BOTH') {
            const attendanceRestore = await client.query(`
                UPDATE attendance_tbl 
                SET status = 'Active'
                WHERE pdl_id = $1 
                AND TO_CHAR(timestamp_in, 'YYYY-MM') = $2
                AND status = 'Voided'
            `, [pdl_id, month_year]);
            
            console.log(`  └─ ✅ Reactivated ${attendanceRestore.rowCount} attendance records for ${month_year}`);
        }

        await logAction(client, {
            userId: currentUserId,
            action: 'MSEC_RESTORE_CREDITS',
            tableName: 'multiple_tables',
            recordId: pdl_id, 
            pdlId: pdl_id,
            details: {
                message: `MSEC RESTORED ${target} and reactivated attendance for ${month_year}.`,
                target_restored: target,
                month_affected: month_year,
                status_change: "Voided -> Active"
            },
            ipAddress: clientIp
        });

        await client.query('COMMIT');
        res.status(200).json({ 
            success: true, 
            message: `Successfully restored ${target} and reactivated attendance for ${month_year}` 
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Restore Error:", err.message);
        res.status(500).json({ error: err.message });
    } finally { 
        client.release(); 
    }
};
const getTamperedRecords = async (req, res) => {
    const { type } = req.query; 
    
    try {
        let query = "";
        let tamperedRecords = [];

        if (type === 'attendance') {
            query = `
                SELECT 
                    a.attendance_id, a.session_id, a.pdl_id, a.hours_attended, a.row_hash, a.timestamp_in,
                    p.first_name, p.last_name, s.session_name
                FROM attendance_tbl a
                JOIN pdl_tbl p ON a.pdl_id = p.pdl_id
                JOIN session_tbl s ON a.session_id = s.session_id
                WHERE a.status = 'Active'
            `;
            const result = await pool.query(query);

            for (let row of result.rows) {
                const dataToVerify = {
                    pdl_id: row.pdl_id,
                    timestamp: row.timestamp_in ? new Date(row.timestamp_in).toISOString() : "",
                    hours: row.hours_attended
                };

                const isIntegral = row.row_hash ? verifyIntegrity('ATTENDANCE', row.row_hash, dataToVerify) : false;
                
                if (!isIntegral) {
                    tamperedRecords.push(row);
                }
            }

        } else if (type === 'tastm' || type === 'gcta') {
    const tableName = type === 'tastm' ? 'tastm_days_log' : 'gcta_days_log';
    const idColumn = `${type}_log_id`;

    // 🎯 FIX 1: Choose columns based on the table schema
    // TASTM needs total_hours_accumulated, GCTA does not.
    const extraColumns = type === 'tastm' ? 'l.total_hours_accumulated,' : '';

    const filterCondition = type === 'tastm' 
        ? "l.status = 'Active' AND l.days_earned > 0" 
        : "l.status = 'Active'";

    query = `
        SELECT 
            l.${idColumn} AS log_id, 
            l.pdl_id, 
            l.days_earned, 
            ${extraColumns} -- 👈 This only injects the column if it exists!
            l.month_year,               
            l.row_hash, 
            l.date_granted,
            p.first_name, p.last_name
        FROM ${tableName} l
        JOIN pdl_tbl p ON l.pdl_id = p.pdl_id
        WHERE ${filterCondition}
    `;
    
    const result = await pool.query(query);

    for (let row of result.rows) {
        // 🎯 FIX 2: Replicate the Sync's UTC Date shift
        const dbDate = new Date(row.month_year);
        const syncMirrorDate = new Date(dbDate.getFullYear(), dbDate.getMonth(), 1);
        const monthStr = syncMirrorDate.toISOString().slice(0, 7); 

        // 🎯 FIX 3: Context-Specific Hashing Recipes
        let dataToVerify = {};

        if (type === 'tastm') {
            // TASTM Recipe: ID + Month + Hours + Days
            dataToVerify = {
                pdl_id: row.pdl_id,
                month: monthStr,
                hours: Number(row.total_hours_accumulated), 
                days: Number(row.days_earned)
            };
        } else {
            // GCTA Recipe: ID + Month + Days (No Hours!)
            dataToVerify = {
                pdl_id: row.pdl_id,
                month: monthStr,
                days: Number(row.days_earned)
            };
        }

        // 🛡️ Perform the forensic check
        const isIntegral = row.row_hash 
            ? verifyIntegrity(type.toUpperCase(), row.row_hash, dataToVerify) 
            : false;
        
        if (!isIntegral) {
            tamperedRecords.push({
                ...row,
                type: type,
                display_date: row.month_year
            });
        }
    }
}

        res.status(200).json(tamperedRecords);

    } catch (err) {
        console.error("❌ Audit Scan Error:", err.message);
        res.status(500).json({ error: "Failed to perform integrity audit scan." });
    }
};


const repairCreditIntegrity = async (req, res) => {
    // 🎯 Match the payload from your handleRepair frontend
    const { record_id, pdl_id, corrected_value, paper_log_ref, credit_type } = req.body;
    const client = await pool.connect();

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const currentUserId = req.user ? req.user.id : 1;

    try {
        await client.query('BEGIN');

        // 1. Fetch the existing record to get the month_year
        const tableName = credit_type === 'tastm' ? 'tastm_days_log' : 'gcta_days_log';
        const idColumn = `${credit_type}_log_id`;
        
        const recordRes = await client.query(
            `SELECT month_year, days_earned FROM ${tableName} WHERE ${idColumn} = $1`, 
            [record_id]
        );

        if (recordRes.rows.length === 0) {
            throw new Error("Record not found.");
        }

        const dbRow = recordRes.rows[0];

        // 2. Mirror the Sync's Date Logic (UTC Normalization)
        // This ensures the hash month matches what was generated during Sync
        const dbDate = new Date(dbRow.month_year);
        const syncMirrorDate = new Date(dbDate.getFullYear(), dbDate.getMonth(), 1);
        const monthStr = syncMirrorDate.toISOString().slice(0, 7); // e.g. "2026-04"

       let daysToGrant = 0;
        let finalHash = "";
        let updateQuery = "";
        let queryParams = [];
        let repairTag = ""; // 🎯 Define the tag here

        // 3. Business Logic Enforcement
        if (credit_type === 'tastm') {
            const hours = Number(corrected_value);
            daysToGrant = hours >= 60 ? 15 : 0;
            
            // 🎯 KEEP THE ANCHOR: Sync looks for "Automated TASTM"
            repairTag = `Automated TASTM (REPAIRED: Ref [${paper_log_ref}])`;

            finalHash = generateHash('TASTM', {
                pdl_id: pdl_id,
                month: monthStr,
                hours: hours,
                days: daysToGrant
            });

            updateQuery = `
                UPDATE tastm_days_log SET 
                    total_hours_accumulated = $1, 
                    days_earned = $2, 
                    row_hash = $3, 
                    remarks = $4,
                    date_granted = NOW() 
                WHERE tastm_log_id = $5`;
            queryParams = [hours, daysToGrant, finalHash, repairTag, record_id];

        } else if (credit_type === 'gcta') {
            daysToGrant = 20;
            
            // 🎯 KEEP THE ANCHOR: Consistent naming for GCTA
            repairTag = `Automated GCTA (REPAIRED: Ref [${paper_log_ref}])`;

            finalHash = generateHash('GCTA', {
                pdl_id: pdl_id,
                month: monthStr,
                days: daysToGrant
            });

            updateQuery = `
                UPDATE gcta_days_log SET 
                    days_earned = $1, 
                    row_hash = $2, 
                    remarks = $3,
                    date_granted = NOW() 
                WHERE gcta_log_id = $4`;
            queryParams = [daysToGrant, finalHash, repairTag, record_id];
        }
        // 4. Apply the Repair
        await client.query(updateQuery, queryParams);

        // 5. Log the High-Priority Security Action
        await logAction(client, {
            userId: currentUserId,
            action: 'CREDIT_INTEGRITY_REPAIR',
            tableName: tableName,
            recordId: record_id,
            pdlId: pdl_id,
            details: {
                message: `Manual re-seal for ${credit_type.toUpperCase()}`,
                correction: `${dbRow.days_earned} -> ${daysToGrant} days`,
                reference: paper_log_ref,
                new_hash: finalHash.slice(0, 10) + "..."
            },
            ipAddress: clientIp
        });

        await client.query('COMMIT');

        // 🎯 Success Log for Terminal
        console.log(`
            --- 🛡️ ${credit_type.toUpperCase()} REPAIR SUCCESS ---
            PDL ID: ${pdl_id}
            Period: ${monthStr}
            Result: ${daysToGrant} Days
            Hash: ${finalHash.slice(0, 15)}...
            ---------------------------------------
        `);

        res.status(200).json({ success: true, message: "Integrity restored and record re-sealed." });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("❌ REPAIR ERROR:", err.message);
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
};


const getRestoredRecords = async (req, res) => {
    const { type } = req.query; 
    
    try {
        const tableName = type === 'attendance' ? 'attendance_tbl' : 
                         type === 'tastm' ? 'tastm_days_log' : 'gcta_days_log';
        
        const idColumn = type === 'attendance' ? 'attendance_id' : 
                        type === 'tastm' ? 'tastm_log_id' : 'gcta_log_id';
        
        const repairAction = type === 'attendance' ? 'INTEGRITY_REPAIR' : 'CREDIT_INTEGRITY_REPAIR';

        const query = `
            SELECT 
                t.*, 
                p.first_name, p.last_name,
                -- 🎯 Focus on the Full Name of the officer
                COALESCE(u.fullname, u.username, 'System Admin') AS restored_by_name, 
                al.timestamp AS restoration_date,
                -- 🎯 Dynamic Session Name logic
                ${type === 'attendance' ? 's.session_name' : "t.month_year::TEXT AS session_name"} 
            FROM ${tableName} t
            JOIN pdl_tbl p ON t.pdl_id = p.pdl_id
            -- 🕵️ Conditionally JOIN session_tbl for Attendance
            ${type === 'attendance' ? 'LEFT JOIN session_tbl s ON t.session_id = s.session_id' : ''}
            -- 🛡️ THE FIX: Switch to INNER JOIN. No log = No entry in this list. No more 1970!
            JOIN (
                SELECT DISTINCT ON (record_id) record_id, user_id, timestamp 
                FROM audit_log_tbl 
                WHERE action_type = $1 AND table_name = $2
                ORDER BY record_id, timestamp DESC
            ) al ON al.record_id::TEXT = t.${idColumn}::TEXT 
            -- 🕵️ JOIN with usetbl
            LEFT JOIN usertbl u ON al.user_id = u.userid
            WHERE t.remarks ILIKE '%REPAIRED%'
            ORDER BY al.timestamp DESC
        `;

        const result = await pool.query(query, [repairAction, tableName]);
        
        const formatted = result.rows.map(row => ({
            ...row,
            id: row[idColumn],
            // Formatting for the frontend date cell
            display_date: type === 'attendance' ? row.timestamp_in : row.date_granted
        }));

        res.status(200).json(formatted);
    } catch (err) {
        console.error("❌ Restoration Fetch Error:", err.message);
        res.status(500).json({ error: "Failed to fetch repair history." });
    }
};

module.exports = { startSession, logAttendance, finalizeSession, cancelSession , 
    getSessionHistory, searchPdls, updateAttendanceHours, getSessionDetails, removeAttendance, 
    reloadSession, silentGctaSync, silentTastmSync, getMonthlyEvaluation, disqualifyPdlMonthly, 
    reenablePdlMonthly,repairAttendanceIntegrity, getTamperedRecords, repairCreditIntegrity,
    getRestoredRecords};