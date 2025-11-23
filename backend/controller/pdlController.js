const pool = require("../db/pool");
const { logAction } = require('../utils/logger'); 

const getAllPDL = async (req, res) => {
  try {
    // FIX: Changed "pdlid" to "pdltable.pdlid" in the SELECT line
    const result = await pool.query(`
      SELECT pdltable.pdlid, firstname, lastname, middlename, 
             cellblock, casestatus, profile_photo_url, behaviorscoretbl.risklevel
      FROM pdltable
      LEFT JOIN behaviorscoretbl ON pdltable.pdlid = behaviorscoretbl.pdlid
      ORDER BY pdltable.pdlid DESC
    `);
    
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Failed to fetch records");
  }
};

const addPDL = async (req, res) => {
  const client = await pool.connect(); 
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  try {
    const { 
      firstName, lastName, middleName, birthday, gender, 
      cellBlock, caseStatus, caseNumber, caseName,
      educationalLevel, 
      workExperience,
      dateConvicted, sentenceYears, 
      courtName, nextHearingDate,
      admissionDate 
    } = req.body;

    // 👇 CHANGE 1: Capture the file path from Multer
    // If a file was uploaded, create the path. If not, set to null.
    const profile_photo_url = req.file ? `/uploads/${req.file.filename}` : null;

    const currentUserId = req.user ? req.user.id : 1; 

    await client.query('BEGIN'); 

    // 👇 CHANGE 2: Update the SQL Query to include profile_photo_url
    const pdlQuery = `
      INSERT INTO pdltable 
      (firstname, lastname, middlename, birthday, gender, cellblock, casestatus, casenumber, casename, profile_photo_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING pdlid;
    `;

    // 👇 CHANGE 3: Add profile_photo_url to the values array (matches $10)
    const pdlValues = [
      firstName, lastName, middleName, birthday, gender, 
      cellBlock, caseStatus, caseNumber, caseName, 
      profile_photo_url 
    ];

    const pdlResult = await client.query(pdlQuery, pdlValues);
    const newPdlId = pdlResult.rows[0].pdlid;

    // --- The rest of your logic remains exactly the same ---

    await client.query(`
      INSERT INTO behaviorscoretbl (pdlid, score, risklevel, remarks, lastupdated)
      VALUES ($1, 100, 'Low', 'Initial Entry', NOW())
    `, [newPdlId]);

    if (caseStatus === 'Sentenced') {
      const convictQuery = `
        INSERT INTO convicttbl 
        (pdlid, dateconvicted, sentenceyears, crimecommitted, admissiondate)
        VALUES ($1, $2, $3, $4, $5)
      `;
      await client.query(convictQuery, [newPdlId, dateConvicted, sentenceYears, caseName, admissionDate]);

    } else if (caseStatus === 'Detained') {
      const detaineeQuery = `
        INSERT INTO detaineetbl 
        (pdlid, courtname, nexthearingdate, status, admissiondate)
        VALUES ($1, $2, $3, $4, $5)
      `;
      await client.query(detaineeQuery, [newPdlId, courtName, nextHearingDate, 'Pending', admissionDate]);
    }

    if (educationalLevel) {
      await client.query(`
        INSERT INTO edutable (pdlid, educationallevel)
        VALUES ($1, $2)
      `, [newPdlId, educationalLevel]);
    }

    if (workExperience && workExperience.length > 0) {
        // Note: When sending FormData, arrays might need parsing depending on how you send them in React
        // If workExperience comes as a string, you might need: JSON.parse(workExperience)
        // But if you handle it correctly in frontend, this loop works.
        const workExpArray = Array.isArray(workExperience) ? workExperience : [workExperience];
        
        for (const job of workExpArray) {
            await client.query(`
            INSERT INTO workexptbl (pdlid, workexp)
            VALUES ($1, $2)
            `, [newPdlId, job]);
      }
    }

    // Log the action
    await logAction(
      client,
      currentUserId,
      'CREATE_PDL',
      'pdltable',
      newPdlId,
      `Added new PDL record: ${firstName} ${lastName}`,
      clientIp
    );

    await client.query('COMMIT'); 
    res.json({ message: "PDL Record and Legal Details saved!", pdlId: newPdlId, photoUrl: profile_photo_url });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Transaction Error:", error);
    res.status(500).json({ error: "Failed to save PDL data" });
  } finally {
    client.release();
  }
};

const updatePDL = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, cellBlock, caseStatus } = req.body;

    const query = `
      UPDATE pdlTable 
      SET firstName = $1, lastName = $2, cellBlock = $3, caseStatus = $4
      WHERE pdlID = $5
      RETURNING *;
    `;
    const values = [firstName, lastName, cellBlock, caseStatus, id];

    const result = await pool.query(query, values);

    if (result.rows.length === 0)
      return res.status(404).json({ message: "PDL not found" });

    res.json({ message: "PDL updated successfully", data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: "Failed to update PDL" });
  }
};

module.exports = { getAllPDL, addPDL, updatePDL };