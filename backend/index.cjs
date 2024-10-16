const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const { connectDb, pool } = require('./config/dbConnection.cjs');
const app = express();
const port = 5002;

const corsOptions = {
  origin: ['https://www.bentsassistant.com','https://bents-model-backend.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
};

// Apply CORS middleware
app.use(cors(corsOptions));

app.options('*', (req, res) => {
  res.sendStatus(204);
});

app.get('/test-cors', (req, res) => {
  res.json({ message: 'CORS is working' });
});
// Middleware
app.use(bodyParser.json());


// Flask backend URL
const FLASK_BACKEND_URL = 'https://bents-model-phi.vercel.app';

// Get user data
app.get('/api/user/:userId', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE user_id = $1', [req.params.userId]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Save user data
app.post('/api/user/:userId', async (req, res) => {
  try {
    const { conversations, searchHistory, selectedIndex } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO users (user_id, conversations, search_history, selected_index) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id) DO UPDATE SET conversations = $2, search_history = $3, selected_index = $4 RETURNING *',
      [req.params.userId, JSON.stringify(conversations), JSON.stringify(searchHistory), selectedIndex]
    );
    res.json(rows[0]);
  } catch (error) {
    console.error('Error saving user data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get("/", (req, res) => {
  res.send("Server is running");
});




// Route to handle contact form submission
app.post('/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;
  try {
    console.log('Received contact form submission:', { name, email, subject, message });
    const { rows } = await pool.query(
      'INSERT INTO contacts (name, email, subject, message) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, subject, message]
    );
    console.log('Contact saved successfully:', rows[0]);
    res.json({ message: 'Message received successfully!', data: rows[0] });
  } catch (err) {
    console.error('Error saving contact data:', err);
    res.status(500).json({ message: 'An error occurred while processing your request.', error: err.message });
  }
});





app.post('/chat', async (req, res) => {
  try {
    const response = await axios.post(`${FLASK_BACKEND_URL}/chat`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error('Error forwarding chat request to Flask:', error);
    res.status(500).json({ message: 'An error occurred while processing your chat request.' });
  }
});

app.get('/documents', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ message: 'An error occurred while fetching documents.' });
  }
});

app.post('/add_document', async (req, res) => {
  try {
    const { title, tags, link, image_url } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO products (id, title, tags, link, image_url) VALUES (uuid_generate_v4(), $1, $2, $3, $4) RETURNING *',
      [title, tags, link, image_url]
    );
    res.json(rows[0]);
  } catch (error) {
    console.error('Error adding document:', error);
    res.status(500).json({ message: 'An error occurred while adding the document.' });
  }
});

app.post('/delete_document', async (req, res) => {
  try {
    const { id } = req.body;
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ message: 'An error occurred while deleting the document.' });
  }
});

app.post('/update_document', async (req, res) => {
  try {
    const { id, title, tags, link } = req.body;
    await pool.query(
      'UPDATE products SET title = $2, tags = $3, link = $4 WHERE id = $1',
      [id, title, tags, link]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ message: 'An error occurred while updating the document.' });
  }
});

// Route to get all users
app.get('/api/users', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM users');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to get all migrated data
app.get('/api/migrated-data', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM pinecone_data');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching migrated data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to fetch products
app.get('/api/products', async (req, res) => {
  try {
    console.log('Attempting to fetch products...');
    const { rows } = await pool.query('SELECT id, title, tags, link, image_data FROM products');
    console.log('Products fetched:', rows);
    const products = rows.map(product => ({
      ...product,
      image_data: product.image_data ? product.image_data.toString('base64') : null
    }));
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working' });
});

// Start the server
app.listen(port, () => {
  console.log(`Express server is running on http://localhost:${port}`);
});
