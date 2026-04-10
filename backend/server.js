const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const helmet = require('helmet');
const isTest = process.env.NODE_ENV === 'test';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// ✅ FIX #1: match docker-compose + retry connect
const pool = isTest
  ? {
      query: async (text, params) => {
        // mock DB
        if (text.includes('SELECT')) {
          return { rows: [] };
        }
        if (text.includes('INSERT')) {
          return {
            rows: [{ id: 1, title: params[0], completed: params[1] }]
          };
        }
        if (text.includes('DELETE')) {
          return { rows: [{ id: params[0] }] };
        }
        if (text.includes('UPDATE')) {
          return {
            rows: [{ id: params[2], title: params[0], completed: params[1] }]
          };
        }
        return { rows: [] };
      }
    }
  : new Pool({
      user: process.env.DB_USER || 'myuser',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'mydatabase',
      password: process.env.DB_PASSWORD || 'mypass',
      port: process.env.DB_PORT || 5432,
    });

// ✅ Optional: log connection test
if (!isTest) {
  pool.connect()
     .then(client => {
        console.log('✅ Connected to PostgreSQL');
        client.release();
     })
   .catch(err => {
      console.error('❌ PostgreSQL connection error:', err.message);
   });
}
// Health check
app.get('/health', (req, res) => {
   res.json({ status: 'healthy', version: '1.0.0' });
});

// GET todos
app.get('/api/todos', async (req, res) => {
   try {
      const result = await pool.query('SELECT * FROM todos ORDER BY id');
      res.json(result.rows);
   } catch (err) {
      res.status(500).json({ error: err.message });
   }
});

// CREATE todo
app.post('/api/todos', async (req, res) => {
   try {
      const { title, completed = false } = req.body;
      if (!title || typeof title !== 'string' || title.trim() === '') {
  return res.status(400).json({ error: 'Title is required' });
}// The validation to check if the title is missing, send the error message and trim the useless whitespace

      if (!title || title.trim() === '') {
         return res.status(400).json({ error: 'Title is required' });
      }

      const result = await pool.query(
         'INSERT INTO todos(title, completed) VALUES($1, $2) RETURNING *',
         [title.trim(), completed]
      );

      res.status(201).json(result.rows[0]);
   } catch (err) {
      res.status(500).json({ error: err.message });
   }
});

// DELETE todo
app.delete('/api/todos/:id', async (req, res) => {
   try {
      const { id } = req.params;

      const result = await pool.query(
         'DELETE FROM todos WHERE id = $1 RETURNING *',
         [id]
      );

      if (result.rows.length === 0) {
         return res.status(404).json({ error: 'Todo not found' });
      }

      res.status(200).json({ message: 'Deleted successfully' });
   } catch (err) {
      res.status(500).json({ error: err.message });
   }
});

// UPDATE todo
app.put('/api/todos/:id', async (req, res) => {
   try {
      const { id } = req.params;
      const { title, completed } = req.body;

      if (title !== undefined && title.trim() === '') {
         return res.status(400).json({ error: 'Title cannot be empty' });
      }

      const result = await pool.query(
         `UPDATE todos 
          SET title = COALESCE($1, title),
              completed = COALESCE($2, completed)
          WHERE id = $3
          RETURNING *`,
         [title ? title.trim() : null, completed, id]
      );

      if (result.rows.length === 0) {
         return res.status(404).json({ error: 'Todo not found' });
      }

      res.status(200).json(result.rows[0]);
   } catch (err) {
      res.status(500).json({ error: err.message });
   }
});

const port = process.env.PORT || 8080;

// ✅ FIX: only start if not testing
if (process.env.NODE_ENV !== 'test') {
   app.listen(port, () => {
      console.log(`🚀 Backend running on port ${port}`);
   });
}

module.exports = app;