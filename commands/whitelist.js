const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { addToWhitelist, removeFromWhitelist, getWhitelist } = require('../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('whitelist')
    .setDescription('Manage whitelist')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('Manually add someone to whitelist')
        .addUserOption(option =>
          option.setName('user')
            .setDescription('Discord user to whitelist')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('robloxid')
            .setDescription('Roblox ID')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('remove')
        .setDescription('Remove someone from whitelist')
        .addUserOption(option =>
          option.setName('user')
            .setDescription('Discord user to remove')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('View whitelisted users')),
  
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    
    const subcommand = interaction.options.getSubcommand();
    
    switch (subcommand) {
      case 'add':
        const userToAdd = interaction.options.getUser('user');
        const robloxId = interaction.options.getString('robloxid');
        
        await addToWhitelist(userToAdd.id, robloxId);
        await interaction.editReply(`✅ Added ${userToAdd.tag} to whitelist`);
        break;
        
      case 'remove':
        const userToRemove = interaction.options.getUser('user');
        
        await removeFromWhitelist(userToRemove.id);
        await interaction.editReply(`✅ Removed ${userToRemove.tag} from whitelist`);
        break;
        
      case 'list':
        const whitelist = await getWhitelist();
        
        if (whitelist.length === 0) {
          await interaction.editReply('No users in whitelist');
          return;
        }
        
        const embed = new EmbedBuilder()
          .setColor('#0099FF')
          .setTitle('Whitelisted Users')
          .setDescription(`Total: ${whitelist.length} users`);
        
        for (const user of whitelist.slice(0, 20)) {
          embed.addFields({
            name: `<@${user.discordId}>`,
            value: `Roblox ID: ${user.robloxId}\nVerified: ${new Date(user.verifiedAt).toLocaleDateString()}`,
            inline: true
          });
        }
        
        await interaction.editReply({ embeds: [embed] });
        break;
    }
  }
};
