const express = require('express');
const { Connection, Request } = require('tedious');
const cors = require('cors');
const { json } = require('express');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Example API Endpoint: Get all products
app.get('/api/products', async (req, res) => {
  try {
    const query = 'SELECT * FROM Products'; // Replace with your table name
    const products = await executeQuery(query);
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Example API Endpoint: Get all collections
app.get('/api/collections', async (req, res) => {
  try {
    const query = 'SELECT * FROM Collections'; // Replace with your table name
    const collections = await executeQuery(query);
    res.json(collections);
  } catch (err) {
    console.error('Error fetching collections:', err);
    res.status(500).json({ error: 'Failed to fetch collections' });
  }
});

// Example API Endpoint: Get all testimonials
app.get('/api/testimonials', async (req, res) => {
  try {
    const query = 'SELECT * FROM Testimonials'; // Replace with your table name
    const testimonials = await executeQuery(query);
    res.json(testimonials);
  } catch (err) {
    console.error('Error fetching testimonials:', err);
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
});

// Example API Endpoint: Get all usps
app.get('/api/usps', async (req, res) => {
  try {
    const query = 'SELECT * FROM Usps'; // Replace with your table name
    const usps = await executeQuery(query);
    res.json(usps);
  } catch (err) {
    console.error('Error fetching usps:', err);
    res.status(500).json({ error: 'Failed to fetch usps' });
  }
});

// Example API Endpoint: Get all about us
app.get('/api/aboutUs', async (req, res) => {
  try {
    const query = 'SELECT * FROM AboutUs'; // Replace with your table name
    const aboutUs = await executeQuery(query);
    res.json(aboutUs);
  } catch (err) {
    console.error('Error fetching about us:', err);
    res.status(500).json({ error: 'Failed to fetch about us' });
  }
});

// Example API Endpoint: Get all contact us
app.get('/api/contactUs', async (req, res) => {
  try {
    const query = 'SELECT * FROM ContactUs'; // Replace with your table name
    const contactUs = await executeQuery(query);
    res.json(contactUs);
  } catch (err) {
    console.error('Error fetching contact us:', err);
    res.status(500).json({ error: 'Failed to fetch contact us' });
  }
});

// Example API Endpoint: Get all terms
app.get('/api/terms', async (req, res) => {
  try {
    const query = 'SELECT * FROM Terms'; // Replace with your table name
    const terms = await executeQuery(query);
    res.json(terms);
  } catch (err) {
    console.error('Error fetching terms:', err);
    res.status(500).json({ error: 'Failed to fetch terms' });
  }
});

// Example API Endpoint: Get all delivery
app.get('/api/delivery', async (req, res) => {
  try {
    const query = 'SELECT * FROM Delivery'; // Replace with your table name
    const delivery = await executeQuery(query);
    res.json(delivery);
  } catch (err) {
    console.error('Error fetching delivery:', err);
    res.status(500).json({ error: 'Failed to fetch delivery' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
