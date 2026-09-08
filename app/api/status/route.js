const express = require('express')

const router = express.Router()

router.get('/', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString()
  })
})

module.exports = router