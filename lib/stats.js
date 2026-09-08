const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const statsFile = path.join(dataDir, 'stats.json');

if (!fs.existsSync(dataDir)) {
  try {
    fs.mkdirSync(dataDir, { recursive: true });
  } catch (e) {
    console.error('Failed to create data directory:', e);
  }
}

const defaultStats = {
  totalPremium: 0,
  todayPremium: 0,
  lastDate: getTodayDateString()
};

function getTodayDateString() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

function loadStats() {
  try {
    if (fs.existsSync(statsFile)) {
      const raw = fs.readFileSync(statsFile, 'utf8');
      const data = JSON.parse(raw);
      
      const today = getTodayDateString();
      if (data.lastDate !== today) {
        data.todayPremium = 0;
        data.lastDate = today;
        saveStats(data);
      }
      return data;
    }
  } catch (err) {
    console.error('Error reading stats.json, initializing defaults:', err);
  }

  saveStats(defaultStats);
  return { ...defaultStats };
}

function saveStats(statsObj) {
  try {
    fs.writeFileSync(statsFile, JSON.stringify(statsObj, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing stats.json:', err);
  }
}

function getStats() {
  const current = loadStats();
  return {
    total: current.totalPremium || 0,
    today: current.todayPremium || 0
  };
}

function incrementStats() {
  const current = loadStats();
  current.totalPremium = (current.totalPremium || 0) + 1;
  current.todayPremium = (current.todayPremium || 0) + 1;
  current.lastDate = getTodayDateString();
  saveStats(current);
  return {
    total: current.totalPremium,
    today: current.todayPremium
  };
}

module.exports = {
  getStats,
  incrementStats
};
