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

        // 🎯 DEBUGGING LOG
        // This will tell you if the DB is sending a valid Date object, a string, or null
        console.log(`--- [DEBUG] PDL ID: ${id} ---`);
        console.log("Committal Date (PNP):", pdl.date_admitted_bjmp);
        console.log("Type of date:", typeof pdl.date_adm);

        const gctaLogs = await client.query(
            "SELECT * FROM gcta_days_log WHERE pdl_id = $1 ORDER BY month_year DESC", [id]
        );

        const tastmLogs = await client.query(
            "SELECT * FROM tastm_days_log WHERE pdl_id = $1 ORDER BY month_year DESC", [id]
        );

        const migrationBaselineString = "Migration Baseline";
        const gctaMigrated = gctaLogs.rows.some(log => log.remarks === migrationBaselineString);
        const tastmMigrated = tastmLogs.rows.some(log => log.remarks === migrationBaselineString);

        res.status(200).json({
            ...pdl,
            pdl_picture: pdl.pdl_picture ? `${req.protocol}://${req.get('host')}/public/uploads/${pdl.pdl_picture}` : null,
            gcta_history: gctaLogs.rows,
            tastm_history: tastmLogs.rows,
            hasMigrated: gctaMigrated || tastmMigrated 
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

        // 🛡️ 1. DATA CLEANING: Convert strings/empty inputs to valid Integers
        // This stops the "invalid input syntax for type integer: ''" error.
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
        // 1. Personal Info
        first_name, last_name, middle_name, rfid_number, crime_name,
        // 2. Judicial Info
        pdl_status, date_commited_pnp, 
        sentence_years, sentence_months, sentence_days,
        is_locked_for_gcta,
        // 3. Allowance Migration Data (GCTA/TASTM)
        gcta_days, tastm_days, tastm_hours,
        isManualOverride 
    } = req.body;

    const client = await pool.connect();
    
    try {
        await client.query("BEGIN");

        // --- 🛡️ STEP 1: FETCH FALLBACKS (System Memory) ---
        // This ensures the math works even if only one field is updated.
        const currentRecord = await client.query(
            "SELECT sentence_years, sentence_months, sentence_days, date_commited_pnp, total_timeallowance_earned FROM pdl_tbl WHERE pdl_id = $1", 
            [id]
        );
        const db = currentRecord.rows[0];
        if (!db) throw new Error("PDL Record not found in database.");

        // --- 🛡️ STEP 2: VARIABLE RESOLUTION ---
        // We force values to booleans and integers to avoid "Data Type" errors.
        const manualActive = isManualOverride === true || isManualOverride === 'true';
        
        const sY = sentence_years !== undefined ? parseInt(sentence_years) : (db.sentence_years || 0);
        const sM = sentence_months !== undefined ? parseInt(sentence_months) : (db.sentence_months || 0);
        const sD = sentence_days !== undefined ? parseInt(sentence_days) : (db.sentence_days || 0);
        const pnpDate = (date_commited_pnp && date_commited_pnp !== "") ? date_commited_pnp : db.date_commited_pnp;

        // Determine which credits to use for the math
        const combinedTotal = manualActive 
            ? (parseInt(gcta_days) || 0) + (parseInt(tastm_days) || 0)
            : (parseInt(db.total_timeallowance_earned) || 0);

        // --- 🎯 STEP 3: THE CALCULATION ENGINE ---
        // Recalculates every time to handle the "Vice-Versa" logic you requested.
        let expectedReleaseDate = null;

        if (pnpDate && (sY > 0 || sM > 0 || sD > 0)) {
            let calculationDate = new Date(pnpDate);
            
            // Add Sentence duration
            calculationDate.setFullYear(calculationDate.getFullYear() + sY);
            calculationDate.setMonth(calculationDate.getMonth() + sM);
            calculationDate.setDate(calculationDate.getDate() + sD);

            // Subtract Time Allowance (Credits)
            calculationDate.setDate(calculationDate.getDate() - combinedTotal);
            
            // Note: If you want the "Inclusive Rule" (-1 day), uncomment the line below:
            // calculationDate.setDate(calculationDate.getDate() - 1);
            
            expectedReleaseDate = calculationDate;
        }

        // --- 🛡️ STEP 4: MASTER UPDATE (pdl_tbl) ---
        // Added ::BOOLEAN casting to $12 to prevent "could not determine data type" errors.
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
                total_timeallowance_earned = CASE 
                    WHEN $12::BOOLEAN = true THEN $13 
                    ELSE total_timeallowance_earned 
                END,
                expected_releasedate = $15,
                updated_at = NOW()
            WHERE pdl_id = $14
            RETURNING *;
        `;

        const pdlValues = [
            first_name, last_name, middle_name, rfid_number, crime_name,
            pdl_status, pnpDate,
            sY, sM, sD,
            is_locked_for_gcta || false, 
            manualActive, // $12
            combinedTotal, // $13
            id,           // $14
            expectedReleaseDate // $15
        ];

        const result = await client.query(masterUpdateQuery, pdlValues);

        // --- 🛡️ STEP 5: SMART MIGRATION LOG SYNC (Upsert) ---
        if (manualActive) {
            const migrationDate = new Date();
            migrationDate.setDate(1); 
            const logRemark = 'Migration Baseline';

            // --- GCTA UPSERT ---
            const existingGcta = await client.query(
                "SELECT gcta_log_id FROM gcta_days_log WHERE pdl_id = $1 AND remarks = $2",
                [id, logRemark]
            );

            if (existingGcta.rows.length > 0) {
                await client.query(
                    "UPDATE gcta_days_log SET days_earned = $1, month_year = $2 WHERE gcta_log_id = $3",
                    [parseInt(gcta_days) || 0, migrationDate, existingGcta.rows[0].gcta_log_id]
                );
            } else {
                await client.query(
                    `INSERT INTO gcta_days_log (pdl_id, month_year, days_earned, status, remarks) 
                     VALUES ($1, $2, $3, 'Active', $4)`,
                    [id, migrationDate, parseInt(gcta_days) || 0, logRemark]
                );
            }

            // --- TASTM UPSERT ---
            const existingTastm = await client.query(
                "SELECT tastm_log_id FROM tastm_days_log WHERE pdl_id = $1 AND remarks = $2",
                [id, logRemark]
            );

            if (existingTastm.rows.length > 0) {
                await client.query(
                    `UPDATE tastm_days_log SET total_hours_accumulated = $1, days_earned = $2, month_year = $3 
                     WHERE tastm_log_id = $4`,
                    [parseFloat(tastm_hours) || 0, parseInt(tastm_days) || 0, migrationDate, existingTastm.rows[0].tastm_log_id]
                );
            } else {
                await client.query(
                    `INSERT INTO tastm_days_log (pdl_id, month_year, total_hours_accumulated, days_earned, remarks) 
                     VALUES ($1, $2, $3, $4, $5)`,
                    [id, migrationDate, parseFloat(tastm_hours) || 0, parseInt(tastm_days) || 0, logRemark]
                );
            }
        }

        await client.query("COMMIT");
        res.status(200).json({ 
            message: "Timeline Recalculated & Logs Synchronized.", 
            data: result.rows[0] 
        });

    } catch (err) {
        await client.query("ROLLBACK");
        console.error("Critical Update Error:", err.message);
        res.status(500).json({ error: `System Error: ${err.message}` });
    } finally {
        client.release();
    }
};

module.exports = { getAllPDL, addPDL, getPdlById,  updatePDL, updatePdlJudicialRecord, grantGlobalGcta};