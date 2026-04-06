const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const backupDir = path.join(__dirname, '../backups');

// 🔍 1. LIST ALL AVAILABLE SNAPSHOTS
exports.getSnapshots = (req, res) => {
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }

    fs.readdir(backupDir, (err, files) => {
        if (err) return res.status(500).json({ error: "Cannot access vault." });
        // Filter only .sql files and sort by date (newest first)
        const sqlFiles = files.filter(f => f.endsWith('.sql')).sort().reverse();
        res.json(sqlFiles);
    });
};

// 📸 2. CREATE NEW SNAPSHOT (Naming & Clean-Restore fix)
exports.createSnapshot = async (req, res) => {
    const { customName } = req.body; // 🎯 ITO ANG FIX PARA SA NAMING
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Sanitize the custom name: replace spaces/special chars with underscores
    const sanitizedName = customName ? customName.trim().replace(/[^a-z0-9]/gi, '_') : 'Manual_Backup';
    const fileName = `MCJ_${sanitizedName}_${timestamp}.sql`;
    const filePath = path.join(backupDir, fileName);

    const user = process.env.DB_USER?.trim() || 'postgres';
    const pass = process.env.DB_PASS?.trim() || '';
    const db = process.env.DB_NAME?.trim();

    // 🎯 THE "ALREADY EXISTS" FIX:
    // Dagdagan ng --clean at --if-exists para maglagay ng 'DROP TABLE' sa loob ng file.
    const cmd = `pg_dump -U ${user} --clean --if-exists ${db} > "${filePath}"`;

    console.log(`📸 Generating Named Snapshot: ${fileName}`);

    exec(cmd, { env: { PGPASSWORD: pass } }, (error, stdout, stderr) => {
        if (error || stderr) {
            console.error("🔥 Backup Failed:", stderr || error);
            return res.status(500).json({ error: "Backup failed." });
        }
        res.json({ message: "Snapshot created successfully!", fileName });
    });
};

// 🔄 3. RESTORE SYSTEM TO SNAPSHOT
exports.restoreSnapshot = async (req, res) => {
    const { fileName } = req.body;
    const filePath = path.join(backupDir, fileName);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "File not found in vault." });
    }

    const user = encodeURIComponent(process.env.DB_USER?.trim() || 'postgres');
    const pass = encodeURIComponent(process.env.DB_PASS?.trim() || '');
    const host = process.env.DB_HOST?.trim() || '127.0.0.1';
    const db = process.env.DB_NAME?.trim();
    const port = process.env.DB_PORT?.trim() || '5432';

    const connUri = `postgresql://${user}:${pass}@${host}:${port}/${db}`;
    const postgresUri = `postgresql://${user}:${pass}@${host}:${port}/postgres`;

    console.log(`🚀 RECOVERY PROTOCOL: Restoring ${db} from ${fileName}`);

    // Kill connections to unlock the DB
    const killCmd = `psql "${postgresUri}" -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${db}' AND pid <> pg_backend_pid();"`;

    // The actual restore
    const restoreCmd = `psql "${connUri}" < "${filePath}"`;

    exec(killCmd, (err) => {
        // Even if kill outputs a warning (from terminating itself), we proceed
        exec(restoreCmd, (restoreErr, rStdout, rStderr) => {
            if (restoreErr || rStderr) {
                console.error("🔥 RESTORATION ERROR:", rStderr || restoreErr);
                return res.status(500).json({ 
                    error: "Restoration failed.", 
                    details: rStderr || restoreErr.message 
                });
            }

            console.log("✅ SYSTEM RESTORED: Rollback complete.");
            res.json({ message: "System Rollback Complete." });
        });
    });
};