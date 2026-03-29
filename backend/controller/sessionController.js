const pool = require('../db/pool');



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


// 🟢 START SESSION
const startSession = async (req, res) => {
    const { program_name, session_name, hours_to_earn, session_date, officer_in_charge } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO session_tbl (program_name, session_name, hours_to_earn, session_date, officer_in_charge) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [program_name, session_name, parseFloat(hours_to_earn), session_date, officer_in_charge]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Session Init Error:", err.message);
        res.status(500).json({ error: "Database error during session initialization." });
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

        // 3. Log into attendance_tbl
        await pool.query(
            `INSERT INTO attendance_tbl (pdl_id, session_id, hours_attended, timestamp_in) 
             VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`,
            [pdl.pdl_id, session_id, hours_to_earn]
        );

        res.status(200).json(pdl);

    } catch (err) {
        console.error("Attendance Log Error:", err.message);
        res.status(500).json({ error: "Server error during attendance processing." });
    }
};


const removeAttendance = async (req, res) => {
    // We get these from the URL params: /api/attendance/12/26
    const { session_id, pdl_id } = req.params;

    try {
        const result = await pool.query(
            "DELETE FROM attendance_tbl WHERE session_id = $1 AND pdl_id = $2",
            [session_id, pdl_id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Attendance record not found." });
        }

        res.status(200).json({ message: "PDL removed from session successfully." });
    } catch (err) {
        console.error("Remove Attendance Error:", err.message);
        res.status(500).json({ error: "Server error while removing attendee." });
    }
};




// 🔴 FINALIZE SESSION (Sync to PDL Ledger)
const finalizeSession = async (req, res) => {
    const { session_id } = req.params;

    try {
        // 1. Verify the session actually has logs before "ending" it
        const checkLogs = await pool.query(
            "SELECT COUNT(*) FROM attendance_tbl WHERE session_id = $1",
            [session_id]
        );

        if (parseInt(checkLogs.rows[0].count) === 0) {
            return res.status(400).json({ error: "Cannot finalize an empty session. Discard it instead." });
        }


        res.status(200).json({ 
            message: "Session attendance locked. Credits will be calculated at month-end." 
        });
    } catch (err) {
        console.error("❌ Finalize Error:", err.message);
        res.status(500).json({ error: "Failed to finalize session logs." });
    }
};

// 🗑️ CANCEL SESSION (Discard)
const cancelSession = async (req, res) => {
    const { session_id } = req.params;
    try {
        // 1. Delete children (Attendance Logs)
        await pool.query("DELETE FROM attendance_tbl WHERE session_id = $1", [session_id]);
        
        // 2. Delete parent (Session)
        const result = await pool.query("DELETE FROM session_tbl WHERE session_id = $1", [session_id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Session not found." });
        }

        res.status(200).json({ message: "Session and logs discarded." });
    } catch (err) {
        console.error("❌ Cancel Error:", err.message);
        res.status(500).json({ error: err.message });
    }
};

const reloadSession = async (req, res) => {
    const { session_id } = req.params;
    console.log("🔄 Reload triggered for session:", session_id);

    try {
        // 1. Delete children (Attendance Logs)
        await pool.query("DELETE FROM attendance_tbl WHERE session_id = $1", [session_id]);
        
        // 2. Delete parent (Session)
        const result = await pool.query("DELETE FROM session_tbl WHERE session_id = $1", [session_id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Session not found." });
        }

        res.status(200).json({ message: "Session and logs discarded." });
    } catch (err) {
        console.error("❌ Reload Error:", err.message);
        res.status(500).json({ error: err.message });
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
        // 1. Get Session Metadata (Name, Date, etc.)
        const sessionInfo = await pool.query(
            "SELECT * FROM session_tbl WHERE session_id = $1",
            [id]
        );

        if (sessionInfo.rows.length === 0) {
            return res.status(404).json({ error: "Session not found." });
        }

        // 2. Get All Attendees for this session (Joined with PDL Info)
        const attendees = await pool.query(
            `SELECT 
                a.pdl_id, 
                p.first_name, 
                p.last_name, 
                p.pdl_picture, 
                a.hours_attended 
             FROM attendance_tbl a
             JOIN pdl_tbl p ON a.pdl_id = p.pdl_id
             WHERE a.session_id = $1
             ORDER BY p.last_name ASC`,
            [id]
        );

        // Send both back in one response
        res.status(200).json({
            session: sessionInfo.rows[0],
            attendees: attendees.rows
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
    try {
        await client.query('BEGIN');
        const now = new Date(); // 🕒 Current Sync Time

        console.log(`--- 🚀 Starting GCTA Monthly Sync: ${now.toDateString()} ---`);

        // 🎯 STAGE 1: THE AUTO-UNLOCK
        const unlockResult = await client.query(`
            UPDATE pdl_tbl SET is_locked_for_gcta = false 
            WHERE is_locked_for_gcta = true 
            AND pdl_status NOT IN ('Released', 'Escaped', 'Deceased')
            AND pdl_id IN (
                SELECT pdl_id FROM incident_tbl 
                GROUP BY pdl_id HAVING MAX(penalty_end_date)::DATE <= CURRENT_DATE
            )
        `);
        if (unlockResult.rowCount > 0) {
            console.log(`  └─ 🔓 Unlocked: ${unlockResult.rowCount} PDLs (Disciplinary penalty ended)`);
        }

        // 🎯 STAGE 2: THE AUTO-GRANT (With Legal Gatekeeper)
        console.log(`  └─ 🛡️  Running Gatekeeper: Checking eligibility...`);
        // 🎯 STAGE 2: THE AUTO-GRANT (FIXED)
        
                // 🎯 STAGE 2: THE AUTO-GRANT (FIXED DUPLICATION)
        const grantResult = await client.query(`
            INSERT INTO gcta_days_log (pdl_id, month_year, days_earned, date_granted, status, remarks)
            SELECT pdl_id, DATE_TRUNC('month', $1::DATE), 20, $1::DATE, 'Active', 'Automated GCTA'
            FROM pdl_tbl 
            WHERE pdl_status NOT IN ('Released', 'Escaped', 'Deceased')
            AND is_locked_for_gcta = false
            -- 🛡️ THE GATEKEEPER CHECK:
            AND (
                (is_legally_disqualified = false AND date_admitted_bjmp <= $1::DATE - INTERVAL '1 month')
                OR 
                (is_legally_disqualified = true AND date_of_final_judgment IS NOT NULL AND date_of_final_judgment <= $1::DATE - INTERVAL '1 month')
            )
            AND pdl_id NOT IN (
                SELECT pdl_id FROM gcta_days_log 
                WHERE DATE_TRUNC('month', month_year) = DATE_TRUNC('month', $1::DATE)
                AND remarks ILIKE 'Automated GCTA%' -- 🎯 FIXED: Now it catches its own footprints!
            )
            RETURNING pdl_id;
        `, [now]);

        console.log(`  └─ ✨ Granted GCTA to: ${grantResult.rowCount} PDLs`);

        // 🎯 STAGE 3: THE UPSERT (Release Date Recalculation)
        if (grantResult.rows.length > 0) {
            for (let row of grantResult.rows) {
                const pdlId = row.pdl_id;

                const pdlData = await client.query(
                    `SELECT date_commited_pnp, date_admitted_bjmp, date_of_final_judgment, 
                            is_legally_disqualified, sentence_years, sentence_months, sentence_days 
                     FROM pdl_tbl 
                     WHERE pdl_id = $1 
                     AND date_commited_pnp IS NOT NULL 
                     AND pdl_status NOT IN ('Released', 'Escaped', 'Deceased')`,
                    [pdlId]
                );

                if (pdlData.rows.length === 0) {
                    console.log(`[PDL ${pdlId}] ⚠️ Skip: Missing PNP date or released.`);
                    continue; 
                }
                const p = pdlData.rows[0];

                console.log(`\n[PDL ${pdlId}] ---------------------------------`);

                // ⚓ THE ANCHOR: Where do we start counting from?
                const anchorDate = p.is_legally_disqualified ? p.date_of_final_judgment : p.date_admitted_bjmp;
                const anchorType = p.is_legally_disqualified ? "Final Judgment (DQ PDL)" : "BJMP Admission (Normal)";
                
                console.log(`  └─ ⚓ Anchor: ${new Date(anchorDate).toDateString()} (${anchorType})`);

                // 🔍 2. Summation Query
                const sums = await client.query(
                    `SELECT 
                        (SELECT COALESCE(SUM(days_earned), 0) FROM gcta_days_log 
                         WHERE pdl_id = $1 AND status = 'Active' AND month_year >= $2) AS gcta_sum,
                        (SELECT COALESCE(SUM(days_earned), 0) FROM tastm_days_log 
                         WHERE pdl_id = $1 AND status = 'Active' AND month_year >= $2) AS tastm_sum`, 
                    [pdlId, anchorDate]
                );
                
                const gctaCount = parseInt(sums.rows[0].gcta_sum) || 0;
                const tastmCount = parseInt(sums.rows[0].tastm_sum) || 0;
                const totalCredits = gctaCount + tastmCount;

                console.log(`  └─ 💰 Credits: GCTA(${gctaCount}) + TASTM(${tastmCount}) = ${totalCredits} total days`);

                // 🧮 3. RUN THE MATH
                const newReleaseDate = calculateReleaseDate(
                    p.date_commited_pnp, p.sentence_years, p.sentence_months, p.sentence_days, totalCredits
                );

                console.log(`  └─ 📅 Calculated Release: ${new Date(newReleaseDate).toDateString()}`);

                // 💾 4. UPDATE PDL_TBL
                await client.query(
                    `UPDATE pdl_tbl SET 
                        total_timeallowance_earned = $1, 
                        expected_releasedate = $2 
                     WHERE pdl_id = $3`, 
                    [totalCredits, newReleaseDate, pdlId]
                );
                console.log(`  └─ ✅ PDL Table Updated.`);
            }
        }

        await client.query('COMMIT');
        console.log(`\n--- ✅ GCTA Sync Finished Successfully ---`);
        res.status(200).json({ success: true, granted: grantResult.rowCount });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error(`\n❌ GCTA SYNC FATAL ERROR:`, err.message);
        res.status(500).json({ error: "Sync failed", details: err.message });
    } finally {
        client.release();
    }
};

const silentTastmSync = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const now = new Date(); 
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

        console.log(`--- 🕒 SYNC RUNNING FOR: ${now.toDateString()} ---`);

        for (let p of pdls.rows) {
            const pdlId = p.pdl_id;
            const isDQ = p.is_legally_disqualified;
            const judgmentDate = p.date_of_final_judgment ? new Date(p.date_of_final_judgment) : null;
            
            console.log(`\n[PDL ${pdlId}] ---------------------------------`);

            // 🔍 1. FIND THE ANCHOR
            const anchorResult = await client.query(`
                SELECT tastm_log_id, total_hours_accumulated, days_earned, remarks, status 
                FROM tastm_days_log 
                WHERE pdl_id = $1 
                AND (
                    (remarks ILIKE 'Migration%') 
                    OR 
                    (remarks = 'Automated TASTM' AND status = 'Active' AND month_year < DATE_TRUNC('month', CURRENT_DATE AT TIME ZONE 'Asia/Manila'))
                )
                ORDER BY month_year DESC, tastm_log_id DESC LIMIT 1
            `, [pdlId]);

            let carryOver = 0;
            let migrationToLockId = null;

            if (anchorResult.rows.length > 0) {
                const anchor = anchorResult.rows[0];
                const isMigration = anchor.remarks.includes('Migration');

                // 🎯 THE DATE CHECKER (Part A): 
                // If they are DQ'd, we do NOT carry over Migration hours into the "Sentenced" phase 
                // because those hours belong to the "Detention" phase.
                if (isDQ && isMigration) {
                    carryOver = 0; 
                    console.log(`  └─ 🛡️  Migration hours ignored (DQ Detention Phase)`);
                    // We still lock it so it doesn't stay 'Active'
                    if (anchor.status === 'Active' && !anchor.remarks.includes('Locked')) {
                        migrationToLockId = anchor.tastm_log_id;
                    }
                } else if (isMigration) {
                    carryOver = parseFloat(anchor.total_hours_accumulated) || 0;
                    if (anchor.status === 'Active' && !anchor.remarks.includes('Locked')) {
                        migrationToLockId = anchor.tastm_log_id;
                    }
                } else {
                    carryOver = parseInt(anchor.days_earned) === 0 ? (parseFloat(anchor.total_hours_accumulated) || 0) : 0;
                }
            }

            // 🔍 2. SUM CURRENT MONTH ATTENDANCE
            // 🎯 THE DATE CHECKER (Part B):
            // If DQ'd, we ONLY sum attendance that happened ON or AFTER the judgment date.
            const currentHours = await client.query(`
                SELECT COALESCE(SUM(hours_attended), 0) as monthly_sum 
                FROM attendance_tbl 
                WHERE pdl_id = $1 AND status = 'Active' 
                AND DATE_TRUNC('month', timestamp_in AT TIME ZONE 'Asia/Manila') 
                    = DATE_TRUNC('month', $4::DATE AT TIME ZONE 'Asia/Manila') -- 🎯 Use $4 instead of CURRENT_DATE
                AND (
                    $2::BOOLEAN = false 
                    OR $3::TIMESTAMP IS NULL 
                    OR timestamp_in >= $3::TIMESTAMP
                )
            `, [pdlId, isDQ, judgmentDate, now]);

            const thisMonthAttendance = parseFloat(currentHours.rows[0].monthly_sum) || 0;
            console.log(`  └─ 📅 Eligible Attendance: ${thisMonthAttendance} hrs`);

            // 🔍 3. CHECK FOR EXISTING LOG (Stop the Duplicate Rows!)
            // 🎯 THE FIX: We search for Active OR Voided logs for this month.
            const existingThisMonth = await client.query(`
    SELECT tastm_log_id, total_hours_accumulated, days_earned 
    FROM tastm_days_log 
    WHERE pdl_id = $1 
    AND (status = 'Active' OR status = 'Voided')
    AND (remarks = 'Automated TASTM' OR remarks ILIKE 'Automated TASTM - VOIDED%')
    AND DATE_TRUNC('month', month_year AT TIME ZONE 'Asia/Manila') 
        = DATE_TRUNC('month', $2::DATE AT TIME ZONE 'Asia/Manila') -- 🎯 Use $2 instead of CURRENT_DATE
`, [pdlId, now]);

            const alreadyCompleted = existingThisMonth.rows.length > 0 && parseInt(existingThisMonth.rows[0].days_earned) === 15;

            let totalToEvaluate;
            if (alreadyCompleted) {
                totalToEvaluate = parseFloat(existingThisMonth.rows[0].total_hours_accumulated) || 0;
            } else {
                totalToEvaluate = carryOver + thisMonthAttendance;
                console.log(`  └─ 🧮 Final Total: ${totalToEvaluate} hrs`);
            }

            // 🧮 4. DAYS & LEGAL (Keeping your 1-month window work)
            let daysToGrant = totalToEvaluate >= 60 ? 15 : 0;
            let logStatus = 'Active';
            let logRemark = 'Automated TASTM';

        

            // 🎯 5. UPSERT LOG
            const monthYear = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();

            if (existingThisMonth.rows.length > 0) {
                const targetId = existingThisMonth.rows[0].tastm_log_id;
                await client.query(`
                    UPDATE tastm_days_log SET 
                        total_hours_accumulated = $1, days_earned = $2, status = $3, remarks = $4, date_granted = NOW()
                    WHERE tastm_log_id = $5`,
                    [totalToEvaluate, daysToGrant, logStatus, logRemark, targetId]
                );
                console.log(`  └─ 📝 Updated Existing Log ID: ${targetId}`);
            } else if (totalToEvaluate > 0) {
                const newRow = await client.query(`
                    INSERT INTO tastm_days_log (pdl_id, month_year, total_hours_accumulated, days_earned, status, remarks, date_granted)
                    VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING tastm_log_id`,
                    [pdlId, monthYear, totalToEvaluate, daysToGrant, logStatus, logRemark]
                );
                console.log(`  └─ ✨ Created NEW Log ID: ${newRow.rows[0].tastm_log_id}`);
            }

            if (migrationToLockId) {
                await client.query(`UPDATE tastm_days_log SET remarks = remarks || ' - Locked', status = 'Inactive' WHERE tastm_log_id = $1`, [migrationToLockId]);
            }
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

    try {
        const result = await pool.query(
            `UPDATE attendance_tbl 
             SET hours_attended = $1 
             WHERE session_id = $2 AND pdl_id = $3
             RETURNING *`,
            [parseFloat(new_hours), session_id, pdl_id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Attendance record not found." });
        }

        res.status(200).json({ message: "Hours updated successfully!", record: result.rows[0] });
    } catch (err) {
        console.error("❌ Update Hours Error:", err.message);
        res.status(500).json({ error: "Database error while updating hours." });
    }
};

module.exports = { startSession, logAttendance, finalizeSession, cancelSession , 
    getSessionHistory, searchPdls, updateAttendanceHours, getSessionDetails, removeAttendance, reloadSession, silentGctaSync, silentTastmSync};