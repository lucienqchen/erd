const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'ERD Server is running' });
});

// Future API routes can be added here
// For example:
// - POST /api/diagrams - Save diagram
// - GET /api/diagrams/:id - Load diagram
// - POST /api/algebra/query - Process relational algebra queries

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
