const db = require('./database');

async function createActivityLogsTable() {
  const createTableSql = `
    CREATE TABLE IF NOT EXISTS ssh_activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      connection_id TEXT,
      activity_type TEXT NOT NULL, -- 'connect', 'disconnect', 'command', 'error', 'file_transfer'
      event_data TEXT, -- JSON string containing event details
      ip_address TEXT,
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `;

  try {
    await db.run(createTableSql);
    console.log('SSH activity logs table created or already exists.');

    // Create indexes for better performance
    await db.run('CREATE INDEX IF NOT EXISTS idx_activity_logs_session_id ON ssh_activity_logs (session_id)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON ssh_activity_logs (user_id)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON ssh_activity_logs (created_at)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_activity_logs_activity_type ON ssh_activity_logs (activity_type)');
    
    console.log('SSH activity logs indexes created.');
  } catch (error) {
    console.error('Error creating SSH activity logs table:', error.message);
    throw error;
  }
}

module.exports = { createActivityLogsTable };