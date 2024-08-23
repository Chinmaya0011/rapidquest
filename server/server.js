require('dotenv').config();
const express = require('express');
const cors = require('cors'); // Import the cors package
const app = express();
const port = process.env.PORT || 3000;

// Use the CORS middleware
app.use(cors());

const shopifyCustomersRoute = require('./routes/shopifyCustomers');
const shopifyProductsRoute = require('./routes/shopifyProducts');
const shopifyOrdersRoute = require('./routes/shopifyOrders');

app.use('/shopifyCustomers', shopifyCustomersRoute);
app.use('/shopifyProducts', shopifyProductsRoute);
app.use('/shopifyOrders', shopifyOrdersRoute);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
