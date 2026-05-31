const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { buildEmbed } = require('../../utils/embedFactory');

const name = 'del-punition';
const description = 'Retire la punition d\'un utilisateur avant son expiration.';
const usage = '/del-punition <utilisateur>';
const aliases = [];

const data = new SlashCommandBuilder()
  .setName('del-punition')
  .setDescription('Retirer une punition')
  .addUserOption(option =>
    option
      .setName('utilisateur')
      .setDescription('L\'utilisateur à dépunir')
      .setRequired(true)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

const handleSlash = async ({ interaction, db, configService, permissionService }) => {
  if (!permissionService.isOwner(interaction.user.id)) {
    await interaction.reply({
      content: 'Cette commande est réservée aux owners.',
      ephemeral: true
    });
    return;
  }

  const targetUser = interaction.options.getUser('utilisateur');

  const punishment = db.getPunishment(targetUser.id);
  if (!punishment) {
    await interaction.reply({
      content: `✗ <@${targetUser.id}> n'a pas de punition active.`,
      ephemeral: true
    });
    return;
  }

  db.removePunishment(targetUser.id);

  const embed = buildEmbed(configService, {
    description: `✓ La punition de <@${targetUser.id}> a été retirée.\n\n**> Info** Expirait <t:${Math.floor(punishment.expiresAt / 1000)}:R>`
  });

  await interaction.reply({ embeds: [embed] });

  try {
    const dmEmbed = new (require('discord.js')).EmbedBuilder()
      .setColor(configService.getColor())
      .setDescription(`Ta punition sur **${interaction.guild.name}** a été retirée par un administrateur.`)
      .setFooter({ text: configService.get('footer') });
    
    await targetUser.send({ embeds: [dmEmbed] });
  } catch (dmError) {
    console.error('dm error:', dmError.message);
  }
};

module.exports = {
  name,
  description,
  usage,
  aliases,
  data,
  handleSlash
};
