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
    const { id } = req.params;
    const client = await pool.connect();

    try {
        // 1. Fetch the Archived Stay Snapshot
        const profileQuery = `
            SELECT 
                r.*, 
                p.pdl_picture,
                'Released' as pdl_status
            FROM released_tbl r
            LEFT JOIN pdl_tbl p ON r.pdl_id = p.pdl_id
            WHERE r.pdl_id = $1
            ORDER BY r.actual_release_date DESC LIMIT 1
        `;
        const profileResult = await client.query(profileQuery, [id]);

        if (profileResult.rows.length === 0) {
            return res.status(404).json({ error: "No archived record found." });
        }

        const pdl = profileResult.rows[0];
        const startDate = pdl.date_admitted_bjmp;
        const endDate = pdl.actual_release_date;

        // 2. Fetch GCTA Logs filtered by Stay Dates
        // Logic: Only logs that happened between admission and release
        const gctaLogs = await client.query(
            `SELECT * FROM gcta_days_log 
             WHERE pdl_id = $1 
             AND month_year >= $2 
             AND month_year <= $3 
             ORDER BY month_year DESC`, 
            [id, startDate, endDate]
        );

        // 3. Fetch TASTM Logs filtered by Stay Dates
        const tastmLogs = await client.query(
            `SELECT * FROM tastm_days_log 
             WHERE pdl_id = $1 
             AND month_year >= $2 
             AND month_year <= $3 
             ORDER BY month_year DESC`, 
            [id, startDate, endDate]
        );

        // 4. Construct Final Response
        const fullData = {
            ...pdl,
            pdl_picture: pdl.pdl_picture 
                ? `${req.protocol}://${req.get('host')}/public/uploads/${pdl.pdl_picture}`
                : null,
            gcta_history: gctaLogs.rows,
            tastm_history: tastmLogs.rows,
            is_archived_view: true // Helper flag for frontend
        };

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

        // 1. Fetch Sentence Params & Status
        const pdlResult = await client.query(
            `SELECT date_commited_pnp, sentence_years, sentence_months, sentence_days, pdl_status 
             FROM pdl_tbl WHERE pdl_id = $1`, [id]
        );
        
        if (pdlResult.rows.length === 0) throw new Error("PDL not found.");
        const pdl = pdlResult.rows[0];

        // 2. Aggregate EVERY credit from the logs (True Sum)
        const creditResult = await client.query(`
            SELECT 
                (SELECT COALESCE(SUM(days_earned), 0) FROM gcta_days_log WHERE pdl_id = $1) as gcta,
                (SELECT COALESCE(SUM(days_earned), 0) FROM tastm_days_log WHERE pdl_id = $1) as tastm
        `, [id]);

        const totalCredits = parseInt(creditResult.rows[0].gcta) + parseInt(creditResult.rows[0].tastm);

        // 3. Calculation Engine (The "Legal Math")
        let updatedExpectedDate = null;
        let updatedOriginalDate = null;

        if (pdl.date_commited_pnp && (pdl.sentence_years || pdl.sentence_months || pdl.sentence_days)) {
            // Full Term Logic
            let release = new Date(pdl.date_commited_pnp);
            release.setFullYear(release.getFullYear() + (parseInt(pdl.sentence_years) || 0));
            release.setMonth(release.getMonth() + (parseInt(pdl.sentence_months) || 0));
            release.setDate(release.getDate() + (parseInt(pdl.sentence_days) || 0));

            // Inclusive Day Rule (-1)
            release.setDate(release.getDate() - 1);
            updatedOriginalDate = new Date(release); // Stays as Full Term Expiry

            // Deduct the Total Credits (GCTA + TASTM)
            release.setDate(release.getDate() - totalCredits);
            updatedExpectedDate = release; // Becomes Projected Release
        }
        console.log("tado   ");
        console.log(updatedExpectedDate + updatedOriginalDate);

        // 4. THE UPSERT: Sync back to Master Table
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

        const finalResult = await client.query(updateQuery, [
            totalCredits, 
            updatedExpectedDate, 
            updatedOriginalDate, 
            id
        ]);

        await client.query('COMMIT');

        // 5. Response (Confirmed Update)
        res.status(200).json({
            success: true,
            message: "Database analytics synchronized.",
            updatedData: finalResult.rows[0]
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Recalculation Error:", err.message);
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

        // 🎯 DEBUGGING LOG
        // This will tell you if the DB is sending a valid Date object, a string, or null
        console.log(`--- [DEBUG] PDL ID: ${id} ---`);
        console.log("Committal Date (PNP):", pdl.date_admitted_bjmp);
 

        const gctaLogs = await client.query(
            "SELECT * FROM gcta_days_log WHERE pdl_id = $1 ORDER BY month_year DESC", [id]
        );

        const tastmLogs = await client.query(
            "SELECT * FROM tastm_days_log WHERE pdl_id = $1 ORDER BY month_year DESC", [id]
        );

        const migrationBaselineString = "Migration";
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

        let combinedTotal = 0;

        if (manualActive) {
            // 🎯 1. Get the sum of all GCTA/TASTM logs that ARE NOT 'Migration'
            const autoCredits = await client.query(`
                SELECT 
                    (SELECT COALESCE(SUM(days_earned), 0) FROM gcta_days_log WHERE pdl_id = $1 AND remarks != 'Migration') as auto_gcta,
                    (SELECT COALESCE(SUM(days_earned), 0) FROM tastm_days_log WHERE pdl_id = $1 AND remarks != 'Migration') as auto_tastm
            `, [id]);

            const autoG = parseInt(autoCredits.rows[0].auto_gcta);
            const autoT = parseInt(autoCredits.rows[0].auto_tastm);

            // 🎯 2. Add [Manual Migration Input] + [Existing Automated Credits]
            combinedTotal = (parseInt(gcta_days) || 0) + (parseInt(tastm_days) || 0) + autoG + autoT;
            
            console.log(`[MATH] Migration(${gcta_days}+${tastm_days}) + Auto(${autoG}+${autoT}) = ${combinedTotal}`);
        } else {
            combinedTotal = (parseInt(db.total_timeallowance_earned) || 0);
}

        // --- 🎯 STEP 3: THE CALCULATION ENGINE ---
        // Recalculates every time to handle the "Vice-Versa" logic you requested.
        let expectedReleaseDate = null;
        let originalReleaseDate = null;

        if (pnpDate && (sY > 0 || sM > 0 || sD > 0)) {
            // We use UTC-style or clear date objects to avoid the "May 05" timezone shift
            let fullTerm = new Date(pnpDate);
            
            // 1. Add Sentence duration
            fullTerm.setFullYear(fullTerm.getFullYear() + sY);
            fullTerm.setMonth(fullTerm.getMonth() + sM);
            fullTerm.setDate(fullTerm.getDate() + sD);

            // 2. The "Inclusive Day" Rule (-1 Day)
            // This is the "Full Term" release date (if they had 0 credits)
            fullTerm.setDate(fullTerm.getDate() - 1);
            
            // Clone this for the Original Release Date field
            originalReleaseDate = new Date(fullTerm);
            console.log("etits")
            console.log(originalReleaseDate);
            // 3. Subtract Time Allowance (Credits) for the Projected/Expected date
            let projectedDate = new Date(fullTerm);
            projectedDate.setDate(projectedDate.getDate() - combinedTotal);
            
            expectedReleaseDate = projectedDate;
        }

        // --- 🛡️ STEP 4: MASTER UPDATE (pdl_tbl) ---
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
                -- 🎯 NEW: Update original release date ONLY if status is 'Sentenced'
                original_release_date = CASE 
                    WHEN $6 = 'Sentenced' THEN $16::DATE
                    ELSE original_release_date 
                END,
                updated_at = NOW()
            WHERE pdl_id = $14
            RETURNING *;
        `;

        const pdlValues = [
            first_name, last_name, middle_name, rfid_number, crime_name,
            pdl_status, pnpDate,
            sY, sM, sD,
            is_locked_for_gcta || false, 
            manualActive,       // $12
            combinedTotal,      // $13
            id,                 // $14
            expectedReleaseDate,// $15
            originalReleaseDate // $16
        ];

        const result = await client.query(masterUpdateQuery, pdlValues);

        // --- 🛡️ STEP 5: SMART MIGRATION LOG SYNC (Upsert) ---
        if (manualActive) {
            const migrationDate = new Date();
            migrationDate.setDate(1); 
            const logRemark = 'Migration';

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

        // 1. Fetch current data for the snapshot
        const pdlResult = await client.query(
            "SELECT * FROM pdl_tbl WHERE pdl_id = $1", [id]
        );
        
        if (pdlResult.rows.length === 0) throw new Error("PDL not found.");
        const p = pdlResult.rows[0];

        // 2. INSERT into released_tbl (The History Snapshot)
        await client.query(`
        INSERT INTO released_tbl (
            pdl_id, first_name, last_name, middle_name, birthday, gender,
            crime_name, sentence_years, sentence_months, sentence_days,
            total_credits_applied, date_commited_pnp, 
            date_admitted_bjmp, 
            actual_release_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
            p.pdl_id, p.first_name, p.last_name, p.middle_name, p.birthday, p.gender,
            p.crime_name, p.sentence_years, p.sentence_months, p.sentence_days,
            p.total_timeallowance_earned, p.date_commited_pnp, 
            p.date_admitted_bjmp,
            actual_release_date
        ]
    );

        // 3. WIPE/RESET pdl_tbl (Clear judicial data for future recommitment)
        await client.query(`
            UPDATE pdl_tbl SET 
                pdl_status = 'Released',
                rfid_number = NULL, 
                date_commited_pnp = NULL,
                sentence_years = 0, 
                sentence_months = 0, 
                sentence_days = 0,
                total_timeallowance_earned = 0,
                expected_releasedate = NULL,
               
            
                updated_at = NOW()
            WHERE pdl_id = $1`, [id]);

        await client.query('COMMIT');
        res.status(200).json({ success: true, message: "Archive created and profile reset." });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Release Error:", err.message);
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
};

module.exports = { getAllPDL, addPDL, getPdlById,  updatePDL, updatePdlJudicialRecord, grantGlobalGcta, recalculatePdlSentence, releasePdl, 
    getReleasedPdls, getReleasedPdlById, updatePersonalInfo, recommitPDL};