const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/build')));

// Database initialization
const db = new sqlite3.Database('./traceability.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  // Kits table
  db.run(`CREATE TABLE IF NOT EXISTS kits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kit_serial_number TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'allocated',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Cells table
  db.run(`CREATE TABLE IF NOT EXISTS cells (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cell_serial_number TEXT UNIQUE NOT NULL,
    kit_id INTEGER,
    status TEXT DEFAULT 'allocated',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (kit_id) REFERENCES kits (id)
  )`);

  // Validation sessions table
  db.run(`CREATE TABLE IF NOT EXISTS validation_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT UNIQUE NOT NULL,
    kit_id INTEGER,
    operator_name TEXT NOT NULL,
    status TEXT DEFAULT 'in_progress',
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY (kit_id) REFERENCES kits (id)
  )`);

  // Validation logs table
  db.run(`CREATE TABLE IF NOT EXISTS validation_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    cell_serial_number TEXT NOT NULL,
    validation_result TEXT NOT NULL,
    scanned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES validation_sessions (session_id)
  )`);
}

// API Routes

// Create a new kit with allocated cells
app.post('/api/kits', (req, res) => {
  const { kitSerialNumber, cellSerialNumbers, operatorName } = req.body;
  
  if (!kitSerialNumber || !cellSerialNumbers || !Array.isArray(cellSerialNumbers)) {
    return res.status(400).json({ error: 'Invalid input data' });
  }

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    // Insert kit
    db.run('INSERT INTO kits (kit_serial_number) VALUES (?)', [kitSerialNumber], function(err) {
      if (err) {
        db.run('ROLLBACK');
        return res.status(400).json({ error: 'Kit already exists or database error' });
      }
      
      const kitId = this.lastID;
      let cellsInserted = 0;
      const totalCells = cellSerialNumbers.length;
      
      // Insert cells
      cellSerialNumbers.forEach((cellSerialNumber, index) => {
        db.run('INSERT INTO cells (cell_serial_number, kit_id) VALUES (?, ?)', 
          [cellSerialNumber, kitId], function(err) {
          if (err) {
            console.error('Error inserting cell:', err);
          }
          cellsInserted++;
          
          if (cellsInserted === totalCells) {
            db.run('COMMIT');
            res.json({ 
              success: true, 
              kitId, 
              kitSerialNumber, 
              allocatedCells: cellSerialNumbers.length 
            });
          }
        });
      });
    });
  });
});

// Get kit details with allocated cells
app.get('/api/kits/:kitSerialNumber', (req, res) => {
  const { kitSerialNumber } = req.params;
  
  db.get('SELECT * FROM kits WHERE kit_serial_number = ?', [kitSerialNumber], (err, kit) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!kit) {
      return res.status(404).json({ error: 'Kit not found' });
    }
    
    db.all('SELECT cell_serial_number FROM cells WHERE kit_id = ?', [kit.id], (err, cells) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json({
        kit,
        cells: cells.map(cell => cell.cell_serial_number)
      });
    });
  });
});

// Start validation session
app.post('/api/validation/start', (req, res) => {
  const { kitSerialNumber, operatorName } = req.body;
  
  if (!kitSerialNumber || !operatorName) {
    return res.status(400).json({ error: 'Kit serial number and operator name required' });
  }
  
  db.get('SELECT id FROM kits WHERE kit_serial_number = ?', [kitSerialNumber], (err, kit) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!kit) {
      return res.status(404).json({ error: 'Kit not found' });
    }
    
    const sessionId = uuidv4();
    
    db.run('INSERT INTO validation_sessions (session_id, kit_id, operator_name) VALUES (?, ?, ?)', 
      [sessionId, kit.id, operatorName], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create validation session' });
      }
      
      res.json({ 
        success: true, 
        sessionId, 
        kitId: kit.id,
        kitSerialNumber 
      });
    });
  });
});

// Validate cell scan
app.post('/api/validation/scan', (req, res) => {
  const { sessionId, cellSerialNumber } = req.body;
  
  if (!sessionId || !cellSerialNumber) {
    return res.status(400).json({ error: 'Session ID and cell serial number required' });
  }
  
  db.get('SELECT vs.*, k.kit_serial_number FROM validation_sessions vs JOIN kits k ON vs.kit_id = k.id WHERE vs.session_id = ?', 
    [sessionId], (err, session) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!session) {
      return res.status(404).json({ error: 'Validation session not found' });
    }
    
    // Check if cell belongs to this kit
    db.get('SELECT * FROM cells WHERE cell_serial_number = ? AND kit_id = ?', 
      [cellSerialNumber, session.kit_id], (err, cell) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      const isValid = !!cell;
      const result = isValid ? 'valid' : 'invalid';
      
      // Log the validation
      db.run('INSERT INTO validation_logs (session_id, cell_serial_number, validation_result) VALUES (?, ?, ?)', 
        [sessionId, cellSerialNumber, result], function(err) {
        if (err) {
          console.error('Error logging validation:', err);
        }
        
        res.json({
          success: true,
          isValid,
          cellSerialNumber,
          kitSerialNumber: session.kit_serial_number,
          message: isValid ? 'Cell validated successfully' : 'Cell does not belong to this kit'
        });
      });
    });
  });
});

// Complete validation session
app.post('/api/validation/complete', (req, res) => {
  const { sessionId } = req.body;
  
  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID required' });
  }
  
  db.run('UPDATE validation_sessions SET status = ?, completed_at = CURRENT_TIMESTAMP WHERE session_id = ?', 
    ['completed', sessionId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to complete validation session' });
    }
    
    res.json({ success: true, message: 'Validation session completed' });
  });
});

// Get validation session details
app.get('/api/validation/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  
  db.get('SELECT vs.*, k.kit_serial_number FROM validation_sessions vs JOIN kits k ON vs.kit_id = k.id WHERE vs.session_id = ?', 
    [sessionId], (err, session) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    db.all('SELECT * FROM validation_logs WHERE session_id = ? ORDER BY scanned_at', [sessionId], (err, logs) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json({ session, logs });
    });
  });
});

// Get all kits
app.get('/api/kits', (req, res) => {
  db.all('SELECT * FROM kits ORDER BY created_at DESC', (err, kits) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(kits);
  });
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

app.listen(PORT, () => {
  console.log(`Cell Traceability System server running on port ${PORT}`);
});
