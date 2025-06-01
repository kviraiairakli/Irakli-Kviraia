const express = require('express');
const cors = require('cors');
const jsonServer = require('json-server');
const fs = require('fs');

const app = express();
const port = 3000;

// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON request bodies
app.use(express.json());

// Create a router for the JSON Server
const router = jsonServer.router('products.json');

// Use the JSON Server router for the /api path
app.use('/api', router);

// Create a new endpoint for purchases
app.post('/api/purchases', (req, res) => {
  const purchaseData = req.body;
  console.log('Received purchase data:', purchaseData);

  // Log the purchase data to a file (e.g., purchases.log)
  fs.appendFile('purchases.log', JSON.stringify(purchaseData) + '\n', (err) => {
    if (err) {
      console.error('Error logging purchase data:', err);
      res.status(500).send('Error logging purchase data');
    } else {
      res.status(200).send('Purchase data received and logged');
    }
  });
});

// Create a new endpoint for contacts
app.post('/api/contacts', (req, res) => {
  const contactData = req.body;
  console.log('Received contact data:', contactData);

  // Log the contact data to a file (e.g., contacts.log)
  fs.appendFile('contacts.log', JSON.stringify(contactData) + '\n', (err) => {
    if (err) {
      console.error('Error logging contact data:', err);
      res.status(500).send('Error logging contact data');
    } else {
      res.status(200).send('Contact data received and logged');
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
