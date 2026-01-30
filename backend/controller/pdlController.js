const pool = require("../db/pool");
const { logAction } = require('../utils/logger'); 

// backend/controllers/pdlController.js

const getAllPDL = async (req, res) => {
  try {
    // 1. Query only from pdl_tbl using your exact column names
    // We filter for active statuses: 'Sentenced' and 'Detained'
    const query = `
      SELECT 
        pdl_id, 
        first_name, 
        middle_name, 
        last_name, 
        gender,
        pdl_status, 
        date_commited_pnp, 
        date_admitted_bjmp,
        pdl_picture,
        crime_name,
        case_number,
        sentence_years,
        sentence_months,
        sentence_days
      FROM pdl_tbl
      WHERE pdl_status IN ('Sentenced', 'Detained')
      ORDER BY pdl_id DESC
    `;

    const result = await pool.query(query);

    // 2. Map to provide the full URL for the frontend photos
    const pdlsWithFullPhotoUrl = result.rows.map(pdl => {
      return {
        ...pdl,
        // This ensures the image loads on your groupmates' laptops via Wi-Fi
        pdl_picture: pdl.pdl_picture 
          ? `${req.protocol}://${req.get('host')}/uploads/${pdl.pdl_picture}`
          : null 
      };
    });

    res.json(pdlsWithFullPhotoUrl);

  } catch (err) {
    console.error("Database Error:", err.message);
    res.status(500).json({ error: "Server Error: Unable to fetch inmate profiling data" });
  }
};

const addPDL = async (req, res) => {
    const client = await pool.connect();
    
    // Capture the IP Address for the audit log (handles proxy and direct connection)
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    try {
        const { 
            firstName, lastName, middleName, birthday, gender,
            rfidNumber, 
            caseNumber, 
            caseName,   
            caseStatus,
            sentenceYears, sentenceMonths, sentenceDays,
            dateCommitedPNP, admissionDate 
        } = req.body;

        // 1. Capture the Filename from Multer
        // 'req.file' is populated by the Multer middleware (upload.single('profile_photo'))
        const pdlPicture = req.file ? req.file.filename : null;

        // Use the current user ID from the JWT token (middleware)
        const currentUserId = req.user ? req.user.id : 1; 

        // 2. Pre-flight duplicate check for RFID
        const rfidCheck = await client.query("SELECT pdl_id FROM pdl_tbl WHERE rfid_number = $1", [rfidNumber]);
        if (rfidCheck.rows.length > 0) {
            return res.status(400).json({ error: "RFID Tag is already assigned to another PDL record." });
        }

        await client.query('BEGIN');

        // 3. Calculate initial predictive release date
        let originalReleaseDate = null;
        if (dateCommitedPNP) {
            const start = new Date(dateCommitedPNP);
            // Math for sentencing: Adding years, months, and days to the PNP committal date
            start.setFullYear(start.getFullYear() + parseInt(sentenceYears || 0));
            start.setMonth(start.getMonth() + parseInt(sentenceMonths || 0));
            start.setDate(start.getDate() + parseInt(sentenceDays || 0));
            originalReleaseDate = start.toISOString().split('T')[0];
        }

        // 4. Insert Query with 17 Parameters (Including pdl_picture)
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
            firstName, lastName, middleName, birthday, gender,
            rfidNumber, caseNumber, caseName, caseStatus,
            dateCommitedPNP || null, admissionDate,
            sentenceYears, sentenceMonths, sentenceDays,
            originalReleaseDate, originalReleaseDate, // Initially they are identical
            pdlPicture // The filename saved in 'uploads/'
        ]);

        const newPdlId = result.rows[0].pdl_id;

        // 5. Audit Logging
        // This keeps a history of which officer added the PDL and from what IP
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
        console.error("Registration Error:", err);
        res.status(500).json({ error: "Internal Server Error during registration." });
    } finally {
        client.release();
    }
};


module.exports = { getAllPDL, addPDL };