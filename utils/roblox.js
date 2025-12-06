const noblox = require('noblox.js');
const axios = require('axios');
const { saveVerification, getVerification, saveWhitelist } = require('./database');

// Generate random verification code
function generateVerificationCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Get Roblox user ID from username
async function getRobloxId(username) {
  try {
    const response = await axios.get(`https://api.roblox.com/users/get-by-username?username=${username}`);
    if (response.data.Id) {
      return response.data.Id;
    }
    throw new Error('User not found');
  } catch (error) {
    throw new Error('Invalid Roblox username');
  }
}

// Get user's profile description
async function getUserDescription(userId) {
  try {
    const response = await axios.get(`https://users.roblox.com/v1/users/${userId}`);
    return response.data.description || '';
  } catch (error) {
    return '';
  }
}

// Start verification process
async function verifyRobloxUser(discordId, robloxUsername) {
  const robloxId = await getRobloxId(robloxUsername);
  const code = generateVerificationCode();
  
  // Save verification attempt
  await saveVerification(discordId, robloxId, robloxUsername, code);
  
  return { robloxId, code };
}

// Check if verification is complete
async function checkVerification(discordId) {
  const verification = await getVerification(discordId);
  
  if (!verification) {
    throw new Error('No verification found. Please run /verify first');
  }
  
  // Check if verification expired (10 minutes)
  if (Date.now() - verification.createdAt > 10 * 60 * 1000) {
    throw new Error('Verification code expired. Please run /verify again');
  }
  
  // Check Roblox profile for code
  const description = await getUserDescription(verification.robloxId);
  
  if (!description.includes(verification.code)) {
    throw new Error('Verification code not found in your Roblox profile "About" section');
  }
  
  // Get user info
  const userInfo = await axios.get(`https://users.roblox.com/v1/users/${verification.robloxId}`);
  
  // Save to whitelist
  await saveWhitelist(discordId, verification.robloxId, verification.username);
  
  return {
    username: verification.username,
    robloxId: verification.robloxId,
    avatar: `https://www.roblox.com/headshot-thumbnail/image?userId=${verification.robloxId}&width=420&height=420&format=png`
  };
}

module.exports = {
  generateVerificationCode,
  getRobloxId,
  verifyRobloxUser,
  checkVerification
};
