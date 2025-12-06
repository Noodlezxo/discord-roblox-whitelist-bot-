const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { verifyRobloxUser, generateVerificationCode } = require('../utils/roblox');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verify')
    .setDescription('Verify your Roblox account')
    .addStringOption(option =>
      option.setName('username')
        .setDescription('Your Roblox username')
        .setRequired(true)),
  
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    
    const robloxUsername = interaction.options.getString('username');
    const discordId = interaction.user.id;
    
    try {
      const verification = await verifyRobloxUser(discordId, robloxUsername);
      
      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('Verification Started')
        .setDescription(`**Instructions:**`)
        .addFields(
          { name: 'Step 1', value: `Go to your Roblox profile: https://www.roblox.com/users/${verification.robloxId}/profile` },
          { name: 'Step 2', value: `Set your "About" section to: \`${verification.code}\`` },
          { name: 'Step 3', value: `Then run \`/check\` to complete verification` },
          { name: 'Verification Code', value: `\`${verification.code}\`` }
        )
        .setFooter({ text: 'You have 10 minutes to complete verification' })
        .setTimestamp();
      
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await interaction.editReply({ 
        content: `Error: ${error.message}`,
        ephemeral: true 
      });
    }
  }
};
