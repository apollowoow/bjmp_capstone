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
    getSessionHistory, searchPdls, updateAttendanceHours, getSessionDetails, removeAttendance, reloadSession};