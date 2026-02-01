const pool = require('../db/pool');


// 📜 GET SESSION HISTORY (With Attendee Counts)
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
             ORDER BY s.session_date DESC`
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

// 🟡 LOG RFID ATTENDANCE (With Duplicate Guard)
const logAttendance = async (req, res) => {
    const { session_id, rfid_number, hours_to_earn } = req.body;

    try {
        // 1. Identify PDL
        const pdlResult = await pool.query(
            "SELECT pdl_id, first_name, last_name, pdl_picture FROM pdl_tbl WHERE rfid_number = $1",
            [rfid_number]
        );

        if (pdlResult.rows.length === 0) {
            return res.status(404).json({ error: "RFID card not registered to any PDL." });
        }

        const pdl = pdlResult.rows[0];

        // 2. 🛡️ DOUBLE ENTRY CHECK
        const duplicateCheck = await pool.query(
            "SELECT * FROM attendance_tbl WHERE session_id = $1 AND pdl_id = $2",
            [session_id, pdl.pdl_id]
        );

        if (duplicateCheck.rows.length > 0) {
            // Return 409 Conflict so the frontend triggers the Duplicate Alert
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
        res.status(500).json({ error: "Server error during RFID processing." });
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

        // 2. Optional: Mark session as finalized in session_tbl if you have a status column
        // await pool.query("UPDATE session_tbl SET status = 'completed' WHERE session_id = $1", [session_id]);

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

module.exports = { startSession, logAttendance, finalizeSession, cancelSession , 
    getSessionHistory};