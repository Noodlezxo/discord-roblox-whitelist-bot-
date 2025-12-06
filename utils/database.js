const mongoose = require('mongoose');

// Connect to MongoDB from Railway
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/whitelist-bot';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Verification Schema (temporary)
const verificationSchema = new mongoose.Schema({
  discordId: String,
  robloxId: Number,
  username: String,
  code: String,
  createdAt: { type: Date, default: Date.now }
});

// Whitelist Schema (permanent)
const whitelistSchema = new mongoose.Schema({
  discordId: String,
  robloxId: Number,
  username: String,
  verifiedAt: { type: Date, default: Date.now }
});

const Verification = mongoose.model('Verification', verificationSchema);
const Whitelist = mongoose.model('Whitelist', whitelistSchema);

// Save verification attempt
async function saveVerification(discordId, robloxId, username, code) {
  await Verification.findOneAndUpdate(
    { discordId },
    { discordId, robloxId, username, code, createdAt: Date.now() },
    { upsert: true, new: true }
  );
}

// Get verification
async function getVerification(discordId) {
  return await Verification.findOne({ discordId });
}

// Save to whitelist
async function saveWhitelist(discordId, robloxId, username) {
  await Whitelist.findOneAndUpdate(
    { discordId },
    { discordId, robloxId, username, verifiedAt: Date.now() },
    { upsert: true, new: true }
  );
  
  // Remove verification
  await Verification.deleteOne({ discordId });
}

// Add to whitelist (admin)
async function addToWhitelist(discordId, robloxId) {
  // You might want to fetch the username from Roblox API here
  await saveWhitelist(discordId, robloxId, 'Manually Added');
}

// Remove from whitelist
async function removeFromWhitelist(discordId) {
  await Whitelist.deleteOne({ discordId });
}

// Get all whitelisted users
async function getWhitelist() {
  return await Whitelist.find({});
}

// Check if user is whitelisted
async function isWhitelisted(discordId) {
  const user = await Whitelist.findOne({ discordId });
  return !!user;
}

module.exports = {
  saveVerification,
  getVerification,
  saveWhitelist,
  addToWhitelist,
  removeFromWhitelist,
  getWhitelist,
  isWhitelisted
};
