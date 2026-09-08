const express = require('express');
const { getStats } = require('../../../lib/stats');

const router = express.Router();

router.get('/', (req, res) => {
  const stats = getStats();
  res.json({
    success: true,
    total: stats.total,
    today: stats.today,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
