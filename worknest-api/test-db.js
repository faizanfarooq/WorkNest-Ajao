require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => { console.log('✅ Connected to MongoDB'); process.exit(0); })
  .catch(err => { console.error('❌ Failed:', err.message); process.exit(1); });
