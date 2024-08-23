const express = require('express');
const { fetchCollectionData } = require('../config/db');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const data = await fetchCollectionData('shopifyOrders');
    res.json(data);
  } catch (err) {
    res.status(500).send('Error fetching shopifyOrders data');
  }
});

module.exports = router;
