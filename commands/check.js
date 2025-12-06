const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { checkVerification } = require('../utils/roblox');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('check')
    .setDescription('Check your verification status'),
  
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    
    const discordId = interaction.user.id;
    
    try {
      const result = await checkVerification(discordId);
      
      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('Verification Complete!')
        .setDescription(`✅ Successfully verified as **${result.username}**`)
        .addFields(
          { name: 'Roblox Username', value: result.username },
          { name: 'Roblox ID', value: result.robloxId.toString() },
          { name: 'Verified At', value: new Date().toLocaleString() }
        )
        .setThumbnail(result.avatar)
        .setFooter({ text: 'You are now whitelisted!' });
      
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await interaction.editReply({ 
        content: `❌ ${error.message}`,
        ephemeral: true 
      });
    }
  }
};
