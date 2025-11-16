const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const raEngine = require('./ra/engine');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

app.get('/api/ping', (req, res) => {
  res.json({ ok: true, time: Date.now() });
});

// Execute a relational algebra operation. Expects a JSON body:
// { tables: { name: [ {col:val}, ... ] }, op: { type: 'project'|'select'|... , args: {...} } }
app.post('/api/ra/execute', async (req, res) => {
  try {
    const { tables, op } = req.body;
    if (!tables || !op) {
      return res.status(400).json({ error: 'Missing tables or op in request body' });
    }
    const result = raEngine.execute(op, tables);
    res.json({ result });
  } catch (err) {
    console.error('RA execute error:', err);
    res.status(500).json({ error: String(err) });
  }
});

// Static serve for production build (optional)
app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`ERD server listening on http://localhost:${PORT}`);
});
