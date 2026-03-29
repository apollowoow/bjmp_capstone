const pool = require("../db/pool");
const { logAction } = require('../utils/logger'); 

// backend/controllers/pdlController.js

const getAllPDL = async (req, res) => {
  try {
    // 1. SELECTing all columns required by your PdlList frontend
    // Added: birthday, rfid_number, and expected_releasedate
    const query = `
      SELECT 
        pdl_id, 
        first_name, 
        middle_name, 
        last_name, 
        birthday,
        gender,
        rfid_number,
        pdl_status, 
        crime_name,
        case_number,
        date_commited_pnp, 
        date_admitted_bjmp,
        sentence_years,
        sentence_months,
        sentence_days,
        expected_releasedate,
        is_locked_for_gcta,
        pdl_picture
      FROM pdl_tbl
      WHERE pdl_status IN ('Sentenced', 'Detained')
      ORDER BY pdl_id DESC
    `;

    const result = await pool.query(query);

    // 2. Map results to provide the full dynamic URL for photos
    const pdlsWithFullPhotoUrl = result.rows.map(pdl => {
      return {
        ...pdl,
        // Ensures photos load correctly on different devices in the same Wi-Fi
        pdl_picture: pdl.pdl_picture 
          ? `${req.protocol}://${req.get('host')}/public/uploads/${pdl.pdl_picture}`
          : null 
      };
    });

    res.json(pdlsWithFullPhotoUrl);

  } catch (err) {
    console.error("Database Error:", err.message);
    res.status(500).json({ 
        error: "Server Error: Unable to fetch pdl profiling data" 
    });
  }
};


const getReleasedPdls = async (req, res) => {
    try {
        const query = `
            SELECT 
                r.release_id, 
                r.pdl_id, 
                r.first_name, 
                r.middle_name, 
                r.last_name, 
                r.birthday,
                r.gender,
                'Released' as pdl_status, 
                r.crime_name,
                r.sentence_years,
                r.sentence_months,
                r.sentence_days,
                r.actual_release_date as expected_releasedate,
                r.total_credits_applied as total_timeallowance_earned,
                p.pdl_picture
            FROM released_tbl r
            LEFT JOIN pdl_tbl p ON r.pdl_id = p.pdl_id
            ORDER BY r.actual_release_date DESC
        `;

        const result = await pool.query(query);

        // 🎯 MAP RESULTS: Construct the dynamic photo URL
        const pdlsWithFullPhotoUrl = result.rows.map(pdl => {
            return {
                ...pdl,
                // Automatically builds http://192.168.x.x:5000/public/uploads/file.png
                pdl_picture: pdl.pdl_picture 
                    ? `${req.protocol}://${req.get('host')}/public/uploads/${pdl.pdl_picture}`
                    : null 
            };
        });

        res.status(200).json(pdlsWithFullPhotoUrl);
    } catch (err) {
        console.error("Error fetching released PDLs:", err.message);
        res.status(500).json({ error: "Failed to fetch archive records." });
    }
};


const getReleasedPdlById = async (req, res) => {
    const { id } = req.params; // This is the release_id
    const client = await pool.connect();

    try {
        // 1. Fetch the exact Archived Stay using release_id
        const profileQuery = `
            SELECT 
                r.*, 
                p.pdl_picture,
                p.pdl_status AS current_live_status -- 🕵️‍♂️ Get their REAL-TIME status
            FROM released_tbl r
            LEFT JOIN pdl_tbl p ON r.pdl_id = p.pdl_id
            WHERE r.release_id = $1
        `;
        const profileResult = await client.query(profileQuery, [id]);

        if (profileResult.rows.length === 0) {
            return res.status(404).json({ error: "No archived record found." });
        }

        const pdl = profileResult.rows[0];
        const pdl_id = pdl.pdl_id;
        const startDate = pdl.date_admitted_bjmp;
        const endDate = pdl.actual_release_date;

        // 2. Fetch GCTA Logs (Stay-Bound)
        const gctaLogs = await client.query(
            `SELECT * FROM gcta_days_log 
            WHERE pdl_id = $1 
            AND date_granted::DATE >= $2::DATE 
            AND date_granted::DATE <= $3::DATE 
            ORDER BY date_granted DESC`, 
            [pdl_id, startDate, endDate]
        );
                // 3. Fetch TASTM Logs (Stay-Bound)
        const tastmLogs = await client.query(
            `SELECT * FROM tastm_days_log 
             WHERE pdl_id = $1 
             AND date_granted::DATE >= $2::DATE 
             AND date_granted::DATE <= $3::DATE 
             ORDER BY date_granted DESC`, 
            [pdl_id, startDate, endDate]
        );

        // 4. Construct Final Response
        const fullData = {
            ...pdl,
            pdl_status: 'Released', // Force the 'viewed' status to Released for the header
            current_live_status: pdl.current_live_status, // 🚀 This is the flag for the button logic
            pdl_picture: pdl.pdl_picture ? `${req.protocol}://${req.get('host')}/public/uploads/${pdl.pdl_picture}` : null,
            gcta_history: gctaLogs.rows,
            tastm_history: tastmLogs.rows,
            is_archived_view: true 
        };
        console.log(fullData);

        res.status(200).json(fullData);

    } catch (err) {
        console.error("Archive Fetch Error:", err.message);
        res.status(500).json({ error: "Server error fetching historical logs." });
    } finally {
        client.release();
    }
};


const grantGlobalGcta = async (req, res) => {
    const { days_to_grant, month_year, remarks } = req.body;

    try {
        // 1. Check if ANY eligible PDL has already received GCTA for this month
        // This is a "Global" check. If you want to skip individuals, we can adjust the INSERT.
        const alreadyGranted = await pool.query(
            "SELECT 1 FROM gcta_days_log WHERE month_year = TO_DATE($1, 'MM-YYYY') LIMIT 1",
            [month_year]
        );

        if (alreadyGranted.rows.length > 0) {
            return res.status(400).json({ 
                message: `Data Integrity Error: GCTA for ${remarks} ${month_year.split('-')[1]} has already been processed.` 
            });
        }

        // 2. Perform the bulk insert for those not locked
        const result = await pool.query(`
            INSERT INTO gcta_days_log (pdl_id, month_year, days_earned, date_granted, status, remarks)
            SELECT pdl_id, TO_DATE($1, 'MM-YYYY'), $2, CURRENT_DATE, 'active', $3
            FROM pdl_tbl
            WHERE is_locked_for_gcta = false
            RETURNING *`,
            [month_year, days_to_grant, remarks]
        );

        res.status(200).json({
            message: "Success: Monthly GCTA granted to all eligible PDLs.",
            count: result.rowCount
        });

    } catch (err) {
        console.error("Database Error:", err.message);
        res.status(500).json({ message: "Internal server error during GCTA validation." });
    }
};


// controllers/pdlController.js

const recalculatePdlSentence = async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Fetch PDL Details
        const pdlResult = await client.query(
            `SELECT date_admitted_bjmp, date_commited_pnp, date_of_final_judgment,
                    sentence_years, sentence_months, sentence_days, 
                    pdl_status, is_legally_disqualified 
             FROM pdl_tbl WHERE pdl_id = $1`, [id]
        );
        
        if (pdlResult.rows.length === 0) throw new Error("PDL not found.");
        const pdl = pdlResult.rows[0];

        // 🎯 2. The Anchor (Judgment for DQ, Admission for Normal)
        const creditAnchor = pdl.is_legally_disqualified 
            ? pdl.date_of_final_judgment 
            : pdl.date_admitted_bjmp;

        // 🛡️ 3. AGGREGATE WITH MIGRATION OVERRIDE
        // This query now says: "Include it if it's after the anchor OR if it's labeled 'Sentenced Migration'"
        const creditResult = await client.query(`
            SELECT 
                (SELECT COALESCE(SUM(days_earned), 0) FROM gcta_days_log 
                 WHERE pdl_id = $1 
                 AND status IN ('Active', 'Inactive') -- 🎯 Include Locked Migrations
                 AND (
                    (remarks = 'Automated GCTA' AND status = 'Active' AND DATE_TRUNC('month', month_year) >= DATE_TRUNC('month', $2::DATE))
                    OR (remarks ILIKE 'Migration%') -- 🎯 Catch "Migration" and "Migration - Locked"
                 )) as gcta,

                (SELECT COALESCE(SUM(days_earned), 0) FROM tastm_days_log 
                 WHERE pdl_id = $1 
                 AND status IN ('Active', 'Inactive') -- 🎯 Include Locked Migrations
                 AND (
                    (remarks = 'Automated TASTM' AND status = 'Active' AND DATE_TRUNC('month', month_year) >= DATE_TRUNC('month', $2::DATE))
                    OR (remarks ILIKE 'Migration%') -- 🎯 Catch "Migration" and "Migration - Locked"
                 )) as tastm
        `, [id, creditAnchor]);

        const gcta = parseInt(creditResult.rows[0].gcta) || 0;
        const tastm = parseInt(creditResult.rows[0].tastm) || 0;
        const totalCredits = gcta + tastm;

        // --- 🎯 4. CALCULATION ENGINE ---
        let updatedExpectedDate = null;
        let updatedOriginalDate = null;

        const sentenceStartDate = pdl.is_legally_disqualified 
            ? pdl.date_of_final_judgment 
            : pdl.date_commited_pnp;

        if (sentenceStartDate && (pdl.sentence_years || pdl.sentence_months || pdl.sentence_days)) {
            let release = new Date(sentenceStartDate);
            
            // Add Sentence
            release.setFullYear(release.getFullYear() + (parseInt(pdl.sentence_years) || 0));
            release.setMonth(release.getMonth() + (parseInt(pdl.sentence_months) || 0));
            release.setDate(release.getDate() + (parseInt(pdl.sentence_days) || 0));
            release.setDate(release.getDate() - 1); 
            
            updatedOriginalDate = new Date(release);

            // Subtract Credits
            let expected = new Date(updatedOriginalDate);
            expected.setDate(expected.getDate() - totalCredits); 
            updatedExpectedDate = expected;
        }

        // 5. MASTER UPDATE
        const updateQuery = `
            UPDATE pdl_tbl SET 
                total_timeallowance_earned = $1,
                expected_releasedate = $2,
                original_release_date = CASE 
                    WHEN pdl_status = 'Sentenced' THEN $3::DATE 
                    ELSE original_release_date 
                END,
                updated_at = NOW()
            WHERE pdl_id = $4
            RETURNING expected_releasedate, total_timeallowance_earned;
        `;

        const finalResult = await client.query(updateQuery, [totalCredits, updatedExpectedDate, updatedOriginalDate, id]);

        await client.query('COMMIT');
        res.status(200).json({ success: true, updatedData: finalResult.rows[0] });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Recalculate Error:", err.message);
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
};

const getPdlById = async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();

    try {
        const profileQuery = `SELECT * FROM pdl_tbl WHERE pdl_id = $1`;
        const profileResult = await client.query(profileQuery, [id]);

        if (profileResult.rows.length === 0) {
            return res.status(404).json({ error: "PDL record not found." });
        }

        const pdl = profileResult.rows[0];
        
        // 🎯 Anchor for the current stay
        const admissionDate = pdl.date_commited_pnp || pdl.date_admitted_bjmp;

        // --- 🛡️ FILTER LOGS: The "History & Audit" Strategy ---
        // 🎯 CHANGE: We now allow 'Voided' logs to show up in the history.
        const logQuery = (tableName) => `
            SELECT * FROM ${tableName} 
            WHERE pdl_id = $1 
            AND status IN ('Active', 'Voided', 'Inactive')   -- 🎯 Show both for transparency
            AND date_granted::DATE >= $2::DATE
            ORDER BY month_year DESC
        `;

        const gctaLogs = await client.query(logQuery('gcta_days_log'), [id, admissionDate]);
        const tastmLogs = await client.query(logQuery('tastm_days_log'), [id, admissionDate]);

        // 🔍 Migration Check (Updated for Phase-Aware remarks)
        // We use .includes because the remark might be "Migration (Detention)" or "Migration (Sentenced)"
        const checkMigration = (logs) => logs.rows.some(log => log.remarks && log.remarks.includes('Migration'));
        
        const gctaMigrated = checkMigration(gctaLogs);
        const tastmMigrated = checkMigration(tastmLogs);

        res.status(200).json({
            ...pdl,
            pdl_picture: pdl.pdl_picture ? `${req.protocol}://${req.get('host')}/public/uploads/${pdl.pdl_picture}` : null,
            gcta_history: gctaLogs.rows,
            tastm_history: tastmLogs.rows,
            hasMigrated: gctaMigrated || tastmMigrated, 
            is_recommitted: !!pdl.date_admitted_bjmp 
        });

    } catch (err) {
        console.error("Fetch Error:", err.message);
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        client.release();
    }
};



const addPDL = async (req, res) => {
    const client = await pool.connect();
    // Capture IP for Audit Logging
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    try {
        const { 
            firstName, lastName, middleName, birthday, gender,
            rfidNumber, caseNumber, caseName, caseStatus,
            sentenceYears, sentenceMonths, sentenceDays,
            dateCommitedPNP, admissionDate 
        } = req.body;

        
        const cleanYears = parseInt(sentenceYears) || 0;
        const cleanMonths = parseInt(sentenceMonths) || 0;
        const cleanDays = parseInt(sentenceDays) || 0;

        const pdlPicture = req.file ? req.file.filename : null;
        const currentUserId = req.user ? req.user.id : 1; 

        // 🛡️ 2. PRE-FLIGHT: Duplicate RFID Check
        const rfidCheck = await client.query("SELECT pdl_id FROM pdl_tbl WHERE rfid_number = $1", [rfidNumber]);
        if (rfidCheck.rows.length > 0) {
            return res.status(400).json({ error: "RFID Tag is already assigned to another PDL record." });
        }

        await client.query('BEGIN');

        // 🛡️ 3. PREDICTIVE RELEASE CALCULATION
        // We use the CLEANED integers here for accurate date math.
        let originalReleaseDate = null;
        if (dateCommitedPNP) {
            const start = new Date(dateCommitedPNP);
            start.setFullYear(start.getFullYear() + cleanYears);
            start.setMonth(start.getMonth() + cleanMonths);
            start.setDate(start.getDate() + cleanDays);
            originalReleaseDate = start.toISOString().split('T')[0];
        }

        // 🛡️ 4. DEBUG LOG: Prints the payload to your Terminal (VS Code) before inserting
        // This helps you verify Parameter $13 is 0 and NOT ""
        console.log("--- DATABASE PAYLOAD DEBUG ---");
        console.log({
            name: `${firstName} ${lastName}`,
            rfid: rfidNumber,
            years: cleanYears,
            months: cleanMonths, // Should show 0 even if input was empty
            days: cleanDays,
            releaseDate: originalReleaseDate
        });

        // 🛡️ 5. INSERT QUERY
        const insertQuery = `
            INSERT INTO pdl_tbl (
                first_name, last_name, middle_name, birthday, gender,
                rfid_number, case_number, crime_name, pdl_status,
                date_commited_pnp, date_admitted_bjmp,
                sentence_years, sentence_months, sentence_days,
                original_release_date, expected_releasedate,
                pdl_picture
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
            RETURNING pdl_id;
        `;

        const result = await client.query(insertQuery, [
            firstName, 
            lastName, 
            middleName || null, 
            birthday || null, 
            gender,
            rfidNumber, 
            caseNumber, 
            caseName, 
            caseStatus,
            dateCommitedPNP || null, 
            admissionDate || null,
            cleanYears,   // $12
            cleanMonths,  // $13 👈 No longer empty string!
            cleanDays,    // $14
            originalReleaseDate, 
            originalReleaseDate, // Initial expected date matches original
            pdlPicture 
        ]);

        const newPdlId = result.rows[0].pdl_id;

        // 🛡️ 6. AUDIT LOGGING (For Meycauayan City Jail Security)
        await logAction(
            client,
            currentUserId,
            'CREATE_PDL',
            'pdl_tbl',
            newPdlId,
            `Registered new PDL: ${firstName} ${lastName} (RFID: ${rfidNumber})`,
            clientIp
        );

        await client.query('COMMIT');
        res.status(201).json({ 
            message: "PDL Registered successfully!", 
            id: newPdlId,
            filename: pdlPicture 
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Registration Error Detail:", err); 
        res.status(500).json({ error: "Internal Server Error during registration." });
    } finally {
        client.release();
    }
};

const updatePDL = async (req, res) => {
    const { id } = req.params;
    const { 
        first_name, last_name, middle_name, 
        rfid_number, pdl_status, crime_name,
        sentence_years, sentence_months, sentence_days,
        gcta_days, tastm_days, expected_releasedate 
    } = req.body;

    const client = await pool.connect();
    try {
        const query = `
            UPDATE pdl_tbl 
            SET 
                first_name = COALESCE($1, first_name),
                last_name = COALESCE($2, last_name),
                middle_name = COALESCE($3, middle_name),
                rfid_number = COALESCE($4, rfid_number),
                pdl_status = COALESCE($5, pdl_status),
                crime_name = COALESCE($6, crime_name),
                sentence_years = COALESCE($7, sentence_years),
                sentence_months = COALESCE($8, sentence_months),
                sentence_days = COALESCE($9, sentence_days),
                gcta_days = COALESCE($10, gcta_days),
                tastm_days = COALESCE($11, tastm_days),
                expected_releasedate = COALESCE($12, expected_releasedate)
            WHERE pdl_id = $13
            RETURNING *;
        `;

        const values = [
            first_name, last_name, middle_name, 
            rfid_number, pdl_status, crime_name,
            sentence_years, sentence_months, sentence_days,
            gcta_days, tastm_days, expected_releasedate,
            id
        ];

        const result = await client.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Record not found." });
        }

        res.status(200).json({ message: "PDL record updated successfully!", data: result.rows[0] });

    } catch (err) {
        console.error("Update Error:", err.message);
        res.status(500).json({ error: "Failed to update pdl record." });
    } finally {
        client.release();
    }
};

const updatePdlJudicialRecord = async (req, res) => {
    const { id } = req.params;
    const { 
        first_name, last_name, middle_name, rfid_number, crime_name,
        pdl_status, date_commited_pnp, 
        sentence_years, sentence_months, sentence_days,
        is_locked_for_gcta,
        is_legally_disqualified, 
        date_of_final_judgment,
        disqualification_reason,
        gcta_days, tastm_days, tastm_hours,
        isManualOverride 
    } = req.body;

    const client = await pool.connect();
    
    try {
        await client.query("BEGIN");

        // --- 🛡️ STEP 1: FETCH FALLBACKS ---
        const currentRecord = await client.query(
            "SELECT sentence_years, sentence_months, sentence_days, date_commited_pnp, pdl_status FROM pdl_tbl WHERE pdl_id = $1", 
            [id]
        );
        const db = currentRecord.rows[0];
        if (!db) throw new Error("PDL Record not found.");

        // --- 🛡️ STEP 2: VARIABLE RESOLUTION ---
        const manualActive = isManualOverride === true || isManualOverride === 'true';
        const isDisqualified = is_legally_disqualified === true || is_legally_disqualified === 'true';

        const sY = sentence_years !== undefined ? parseInt(sentence_years) : (db.sentence_years || 0);
        const sM = sentence_months !== undefined ? parseInt(sentence_months) : (db.sentence_months || 0);
        const sD = sentence_days !== undefined ? parseInt(sentence_days) : (db.sentence_days || 0);
        const pnpDate = (date_commited_pnp && date_commited_pnp !== "") ? date_commited_pnp : db.date_commited_pnp;

        // --- 🛡️ STEP 4: CLEAN MIGRATION SYNC ---
        let tastmLogId = null;
        if (manualActive) {
            if (isDisqualified && pdl_status !== 'Sentenced') {
                console.log("Migration Blocked: Disqualified Detainee.");
            } else {
                const migrationDate = new Date(Date.UTC(
                    new Date().getUTCFullYear(),
                    new Date().getUTCMonth(),
                    1
                )).toISOString();

                // ✅ Flat label — no Detention/Sentenced split
                const baseLabel = 'Migration';

                // -----------------------------------------------
                // 🎯 GCTA Migration
                // Only touch days_earned if a real positive value was explicitly sent
                // -----------------------------------------------
                const safeGctaDays = (
                    gcta_days !== undefined && 
                    gcta_days !== null && 
                    gcta_days !== '' && 
                    parseInt(gcta_days) > 0
                ) ? parseInt(gcta_days) : null;

                const existingGcta = await client.query(
                    `SELECT gcta_log_id, status FROM gcta_days_log 
                    WHERE pdl_id = $1 AND remarks ILIKE 'Migration%' 
                    AND status IN ('Active', 'Inactive', 'Voided')`, 
                    [id]
                );

                if (safeGctaDays !== null) {
                    // Real value sent — update or insert
                    if (existingGcta.rows.length > 0) {
                        await client.query(
                            `UPDATE gcta_days_log SET days_earned = $1, remarks = $2 WHERE gcta_log_id = $3`, 
                            [safeGctaDays, baseLabel, existingGcta.rows[0].gcta_log_id]
                        );
                    } else {
                        await client.query(
                            `INSERT INTO gcta_days_log (pdl_id, month_year, days_earned, status, remarks, date_granted) 
                             VALUES ($1, $2, $3, 'Active', $4, NOW())`, 
                            [id, migrationDate, safeGctaDays, baseLabel]
                        );
                    }
                } else {
                    // Nothing sent — only relabel if row exists, never touch days_earned
                    if (existingGcta.rows.length > 0) {
                        await client.query(
                            `UPDATE gcta_days_log SET remarks = $1 WHERE gcta_log_id = $2`,
                            [baseLabel, existingGcta.rows[0].gcta_log_id]
                        );
                    }
                }

                // -----------------------------------------------
                // 🎯 TASTM Migration
                // Only touch hours/days if real positive values were explicitly sent
                // -----------------------------------------------
                const safeTastmDays = (
                    tastm_days !== undefined && 
                    tastm_days !== null && 
                    tastm_days !== '' && 
                    parseInt(tastm_days) > 0
                ) ? parseInt(tastm_days) : null;

                const safeTastmHours = (
                    tastm_hours !== undefined && 
                    tastm_hours !== null && 
                    tastm_hours !== '' && 
                    parseFloat(tastm_hours) > 0
                ) ? parseFloat(tastm_hours) : null;

                const existingTastm = await client.query(
                    `SELECT tastm_log_id, status FROM tastm_days_log 
                    WHERE pdl_id = $1 AND remarks ILIKE 'Migration%' 
                    AND status IN ('Active', 'Inactive', 'Voided')`, 
                    [id]
                );const targetStatus = isDisqualified ? 'Voided' : 'Active';

                if (safeTastmDays !== null || safeTastmHours !== null) {
                    // Real value(s) sent — update or insert
                    if (existingTastm.rows.length > 0) {
                        tastmLogId = existingTastm.rows[0].tastm_log_id;
                        await client.query(
                            `UPDATE tastm_days_log 
                             SET total_hours_accumulated = COALESCE($1, total_hours_accumulated), 
                                 days_earned = COALESCE($2, days_earned), 
                                 remarks = $3 
                             WHERE tastm_log_id = $4`, 
                            [safeTastmHours, safeTastmDays, baseLabel, tastmLogId]
                        );
                    } else {
                        const newTastm = await client.query(
                            `INSERT INTO tastm_days_log 
                             (pdl_id, month_year, total_hours_accumulated, days_earned, remarks, status, date_granted) 
                             VALUES ($1, $2, $3, $4, $5, 'Active', NOW()) RETURNING tastm_log_id`, 
                            [id, migrationDate, safeTastmHours ?? 0, safeTastmDays ?? 0, baseLabel]
                        );
                        tastmLogId = newTastm.rows[0].tastm_log_id;
                    }
                } else {
                    // Nothing sent — only relabel if row exists, never touch hours/days
                    if (existingTastm.rows.length > 0) {
                        tastmLogId = existingTastm.rows[0].tastm_log_id;
                        await client.query(
                            `UPDATE tastm_days_log SET remarks = $1 WHERE tastm_log_id = $2`,
                            [baseLabel, tastmLogId]
                        );
                    }
                }

                // --- 🛡️ STEP 4.2: DETENTION WINDOW KILL SWITCH ---
                // Only voids period-specific credits, never Migration rows
                if (pdl_status === 'Sentenced' && isDisqualified && date_of_final_judgment && pnpDate) {
                    const lockStamp = ` - VOIDED (System Locked): ${disqualification_reason || 'RA 10592 Exclusion'} (Judgment: ${date_of_final_judgment})`;
                    
                    const voidQuery = `
                        UPDATE %I SET 
                            status = 'Voided', 
                            remarks = CASE 
                                WHEN remarks NOT LIKE '%VOIDED%' THEN remarks || $1 
                                ELSE remarks 
                            END
                        WHERE pdl_id = $2 
                        AND status IN ('Active', 'Inactive') -- 🎯 Catch them before they are voided
                        AND month_year >= $3 
                        AND month_year <= $4
                    `;
                    await client.query(voidQuery.replace('%I', 'gcta_days_log'), [lockStamp, id, pnpDate, date_of_final_judgment]);
                    await client.query(voidQuery.replace('%I', 'tastm_days_log'), [lockStamp, id, pnpDate, date_of_final_judgment]);
                    
                    await client.query(`
                        UPDATE attendance_tbl SET status = 'Voided' 
                        WHERE pdl_id = $1 AND status = 'Active' 
                        AND timestamp_in >= $2 AND timestamp_in <= $3
                    `, [id, pnpDate, date_of_final_judgment]);

                    // ✅ Lock Migration rows on both tables if judgment date has arrived
                    await client.query(`
                        UPDATE gcta_days_log 
                        SET remarks = remarks || ' - Locked'
                        WHERE pdl_id = $1 
                        AND status = 'Voided'
                        AND remarks ILIKE 'Migration%'
                        AND remarks NOT LIKE '%Locked%'
                        AND month_year <= DATE_TRUNC('month', $2::DATE)
                    `, [id, date_of_final_judgment]);

                    await client.query(`
                        UPDATE tastm_days_log 
                        SET remarks = remarks || ' - Locked'
                        WHERE pdl_id = $1 
                        AND status = 'Voided'
                        AND remarks ILIKE 'Migration%'
                        AND remarks NOT LIKE '%Locked%'
                        AND month_year <= DATE_TRUNC('month', $2::DATE)
                    `, [id, date_of_final_judgment]);
                    
                    console.log(`[Legal] Credits voided within detention window: ${pnpDate} to ${date_of_final_judgment}`);
                    console.log(`[Legal] Migration rows locked as of judgment date: ${date_of_final_judgment}`);
                }

                // --- 🛡️ STEP 4.5: RETROACTIVE AUTOMATED UPDATE ---
                const currentAutomatedLog = await client.query(`
                    SELECT tastm_log_id FROM tastm_days_log 
                    WHERE pdl_id = $1 
                    AND remarks = 'Automated TASTM' -- 🎯 Strictly match the label
                    AND status = 'Active'
                    AND month_year = DATE_TRUNC('month', CURRENT_DATE)
                `, [id]);

                if (currentAutomatedLog.rows.length > 0 && tastmLogId) {
                    const currentAttendance = await client.query(`
                        SELECT COALESCE(SUM(hours_attended), 0) as monthly_sum 
                        FROM attendance_tbl 
                        WHERE pdl_id = $1 AND status = 'Active' 
                        AND DATE_TRUNC('month', timestamp_in AT TIME ZONE 'Asia/Manila') 
                            = DATE_TRUNC('month', CURRENT_DATE AT TIME ZONE 'Asia/Manila')
                    `, [id]);
                    const attHours = parseFloat(currentAttendance.rows[0].monthly_sum) || 0;

                    // Fetch the actual saved migration hours from DB, not from request
                    const savedMigration = await client.query(
                        `SELECT total_hours_accumulated FROM tastm_days_log WHERE tastm_log_id = $1`,
                        [tastmLogId]
                    );
                    const migHours = parseFloat(savedMigration.rows[0]?.total_hours_accumulated) || 0;

                    const prevMonth = await client.query(`
                        SELECT total_hours_accumulated, days_earned 
                        FROM tastm_days_log 
                        WHERE pdl_id = $1 
                        AND month_year < DATE_TRUNC('month', CURRENT_DATE AT TIME ZONE 'Asia/Manila') 
                        AND remarks = 'Automated TASTM' 
                        AND status = 'Active'
                        ORDER BY month_year DESC LIMIT 1
                    `, [id]);

                    let prevCarry = 0;
                    if (prevMonth.rows.length > 0 && parseInt(prevMonth.rows[0].days_earned) === 0) {
                        prevCarry = parseFloat(prevMonth.rows[0].total_hours_accumulated) || 0;
                    }

                    const finalTotal = migHours + attHours + prevCarry;
                    const finalDays = finalTotal >= 60 ? 15 : 0;

                    await client.query(
                        `UPDATE tastm_days_log SET total_hours_accumulated = $1, days_earned = $2, date_granted = NOW() 
                         WHERE tastm_log_id = $3`, 
                        [finalTotal, finalDays, currentAutomatedLog.rows[0].tastm_log_id]
                    );
                     await client.query(
                        `UPDATE tastm_days_log 
                        SET remarks = remarks || ' - Locked',
                            status = 'Inactive'
                        WHERE tastm_log_id = $1 AND remarks NOT LIKE '%Locked%'`, 
                        [tastmLogId]
                    );
                }
            }
        }

        // --- 🛡️ STEP 5: AGGREGATE ALL 'ACTIVE' CREDITS ---
        const activeCredits = await client.query(`
            SELECT 
                (SELECT COALESCE(SUM(days_earned), 0) FROM gcta_days_log 
                WHERE pdl_id = $1 AND status IN ('Active', 'Inactive')) +
                (SELECT COALESCE(SUM(days_earned), 0) FROM tastm_days_log 
                WHERE pdl_id = $1 AND status IN ('Active', 'Inactive')) 
            as total
        `, [id]);
        
        const combinedTotal = parseInt(activeCredits.rows[0].total) || 0;

        // --- 🎯 STEP 6: CALCULATION ENGINE ---
        let expectedReleaseDate = null;
        let originalReleaseDate = null;
        if (pnpDate && (sY > 0 || sM > 0 || sD > 0)) {
            let release = new Date(pnpDate);
            release.setFullYear(release.getFullYear() + sY);
            release.setMonth(release.getMonth() + sM);
            release.setDate(release.getDate() + sD);
            release.setDate(release.getDate() - 1); 
            originalReleaseDate = new Date(release);
            let projected = new Date(release);
            projected.setDate(projected.getDate() - combinedTotal);
            expectedReleaseDate = projected;
        }

        // --- 🛡️ STEP 7: MASTER UPDATE ---
        const masterUpdateQuery = `
            UPDATE pdl_tbl SET 
                first_name = COALESCE($1, first_name), 
                last_name = COALESCE($2, last_name), 
                middle_name = COALESCE($3, middle_name),
                rfid_number = COALESCE($4, rfid_number), 
                crime_name = COALESCE($5, crime_name), 
                pdl_status = COALESCE($6, pdl_status),
                date_commited_pnp = $7, 
                sentence_years = $8, 
                sentence_months = $9, 
                sentence_days = $10,
                is_locked_for_gcta = $11, 
                total_timeallowance_earned = $12, 
                expected_releasedate = $13,
                is_legally_disqualified = $14, 
                date_of_final_judgment = $15, 
                disqualification_reason = $16,
                original_release_date = CASE WHEN $6 = 'Sentenced' THEN $17::DATE ELSE original_release_date END,
                updated_at = NOW()
            WHERE pdl_id = $18 RETURNING *;
        `;

        const pdlValues = [
            first_name, last_name, middle_name, rfid_number, crime_name, pdl_status, pnpDate, sY, sM, sD,
            is_locked_for_gcta || false, combinedTotal, expectedReleaseDate, isDisqualified, 
            date_of_final_judgment, 
            isDisqualified ? (disqualification_reason || "Disqualified under RA 10592") : null, 
            originalReleaseDate, id 
        ];

        const result = await client.query(masterUpdateQuery, pdlValues);
  
        await client.query("COMMIT");
        res.status(200).json({ success: true, message: "Judicial Ledger Updated.", data: result.rows[0] });

    } catch (err) {
        await client.query("ROLLBACK");
        console.error("Critical Update Error:", err.message);
        res.status(500).json({ error: `System Error: ${err.message}` });
    } finally {
        client.release();
    }
};

 const updatePersonalInfo = async (req, res) => {
  const { id } = req.params;
  const { 
    first_name, 
    last_name, 
    middle_name, 
    gender, 
    birthday, 
    case_number, 
    crime_name, 
    date_admitted_bjmp 
  } = req.body;

  try {
    // 1. Determine if a new photo path exists
    // Since your storage destination is 'public/uploads/', 
    // the accessible URL path is usually /uploads/filename
    const newPhotoPath = req.file ? `${req.file.filename}` : null;

    const query = `
      UPDATE pdl_tbl 
      SET 
        first_name = $1,
        last_name = $2,
        middle_name = $3,
        gender = $4,
        birthday = $5,
        case_number = $6,
        crime_name = $7,
        date_admitted_bjmp = $8,
        pdl_picture = COALESCE($9, pdl_picture),
        updated_at = NOW()
      WHERE pdl_id = $10
      RETURNING *;
    `;

    const values = [
      first_name,
      last_name,
      middle_name,
      gender,
      birthday,
      case_number,
      crime_name,
      date_admitted_bjmp,
      newPhotoPath, // If null, COALESCE keeps the old picture
      id
    ];

    const result = await pool.query(query, values);

   
    if (result.rowCount === 0) {
      // 🛡️ Cleanup: If DB fails but file was uploaded, delete it
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: "PDL Record not found." });
    }

    res.status(200).json({ 
      message: "Personal Information successfully synchronized.", 
      pdl: result.rows[0] 
    });

  } catch (err) {
    console.error("❌ Update Personal Info Error:", err.message);
    // 🛡️ Cleanup uploaded file on server error
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: "Internal Database Error" });
  }
};

const recommitPDL = async (req, res) => {
  const { id } = req.params;
    
    // Destructure based on the mapping we used in the Frontend FormData
    const {
        case_status,      // This will update the pdl_status column
        caseNumber,
        caseName,
        admissionDate,
        rfidNumber,
        date_commited_pnp,
        sentence_years,
        sentence_months,
        sentence_days
    } = req.body;

    try {
        const newPhotoPath = req.file ? `/uploads/${req.file.filename}` : null;

        // 🎯 THE RESET QUERY
        // We use case_status to set the new pdl_status
        const query = `
            UPDATE pdl_tbl 
            SET 
                pdl_status = $1,               -- This handles both Case/PDL status
                case_number = $2,
                crime_name = $3,
                date_admitted_bjmp = $4,
                rfid_number = $5,
                date_commited_pnp = $6,
                sentence_years = $7,
                sentence_months = $8,
                sentence_days = $9,
                pdl_picture = COALESCE($10, pdl_picture),
                
                -- 📉 RESET TRACKING: New case starts at zero credits
                total_timeallowance_earned = 0,
                updated_at = NOW()
            WHERE pdl_id = $11
            RETURNING *;
        `;

        const values = [
            case_status || 'Detained',         // Default to Detained if empty
            caseNumber,
            caseName,
            admissionDate,
            rfidNumber,
            date_commited_pnp || null,
            parseInt(sentence_years) || 0,
            parseInt(sentence_months) || 0,
            parseInt(sentence_days) || 0,
            newPhotoPath,
            id
        ];

        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Record not found." });
        }

        res.status(200).json({ 
            message: "Recommitment Successful. New legal timeline initialized.", 
            pdl: result.rows[0] 
        });
        

    } catch (err) {
        console.error("❌ Backend Recommit Error:", err.message);
        res.status(500).json({ error: "Database failed to initialize recommitment." });
    }
};

const releasePdl = async (req, res) => {
    const { id } = req.params;
    const { actual_release_date } = req.body;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Fetch current data
        const pdlResult = await client.query("SELECT * FROM pdl_tbl WHERE pdl_id = $1", [id]);
        if (pdlResult.rows.length === 0) throw new Error("PDL not found.");
        const p = pdlResult.rows[0];

        // 🎯 Anchor Dates for the Archive Sweep
        const startDate = p.date_commited_pnp || p.date_admitted_bjmp;
        const endDate = actual_release_date;

        // 2. INSERT into released_tbl (Mapped to your schema)
        await client.query(`
            INSERT INTO released_tbl (
                pdl_id, first_name, last_name, middle_name, birthday, gender,
                crime_name, sentence_years, sentence_months, sentence_days,
                total_credits_applied, date_commited_pnp, date_admitted_bjmp, 
                actual_release_date, is_legally_disqualified, date_of_final_judgment, 
                remarks -- 🎯 Mapped from disqualification_reason
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
            [
                p.pdl_id, p.first_name, p.last_name, p.middle_name, p.birthday, p.gender,
                p.crime_name, p.sentence_years, p.sentence_months, p.sentence_days,
                p.total_timeallowance_earned, p.date_commited_pnp, p.date_admitted_bjmp, 
                actual_release_date, p.is_legally_disqualified, p.date_of_final_judgment,
                p.disqualification_reason // Store the reason in the remarks column
            ]
        );

        // --- 🛡️ STEP 3: THE ARCHIVE SWEEP ---
        // Only flip 'Active' logs. 'Voided' logs must stay 'Voided' in history!
        const logStatusUpdate = "UPDATE %I SET status = 'Released' WHERE pdl_id = $1 AND status = 'Active' AND month_year <= $2";
        
        await client.query(`UPDATE gcta_days_log SET status = 'Released' WHERE pdl_id = $1 AND status = 'Active'`, [id]);
        await client.query(
            `UPDATE tastm_days_log 
            SET status = 'Released' 
            WHERE pdl_id = $1 
            AND status IN ('Active', 'Voided', 'Inactive')`, 
            [id]
            );
        
        // Attendance - Simple status flip
        await client.query(`UPDATE attendance_tbl SET status = 'Released' WHERE pdl_id = $1 AND status = 'Active'`, [id]);

        // --- 🎯 STEP 4: WIPE/RESET pdl_tbl (Clean slate for next use) ---
        await client.query(`
            UPDATE pdl_tbl SET 
                pdl_status = 'Released',
                rfid_number = NULL, 
                original_release_date = NULL,
                date_commited_pnp = NULL,
                date_admitted_bjmp = NULL,
                date_of_final_judgment = NULL,
                is_legally_disqualified = false,
                disqualification_reason = NULL,
                sentence_years = 0, sentence_months = 0, sentence_days = 0,
                total_timeallowance_earned = 0,
                expected_releasedate = NULL,
                updated_at = NOW()
            WHERE pdl_id = $1`, [id]);

        await client.query('COMMIT');
        res.status(200).json({ success: true, message: "PDL released and history archived." });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Critical Release Error:", err.message);
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
};

module.exports = { getAllPDL, addPDL, getPdlById,  updatePDL, updatePdlJudicialRecord, grantGlobalGcta, recalculatePdlSentence, releasePdl, 
    getReleasedPdls, getReleasedPdlById, updatePersonalInfo, recommitPDL};