const { ContainerBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, TextDisplayBuilder, MessageFlags, EmbedBuilder } = require('discord.js');

const COMPONENTS_V2_FLAG = MessageFlags?.IsComponentsV2 ?? (1 << 15);

const CHECK_MARK = '✓';
const CROSS_MARK = '\u2716';

const setupOwnerPingEvent = (client, configService, commandRegistry) => {
  client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (!message.guild) return;

    const primaryOwnerId = configService.get('ownerId');
    if (message.author.id !== primaryOwnerId) return;

    const botMention = `<@${client.user.id}>`;
    const botMentionNickname = `<@!${client.user.id}>`;
    if (!message.content.includes(botMention) && !message.content.includes(botMentionNickname)) return;

    const color = configService.getColor();
    const colorInt = parseInt(color.replace('#', ''), 16);

    const infoButton = new ButtonBuilder()
      .setCustomId(`owner_ping_info_${message.author.id}_${message.id}`)
      .setStyle(ButtonStyle.Primary)
      .setLabel(CHECK_MARK);

    const deleteButton = new ButtonBuilder()
      .setCustomId(`owner_ping_delete_${message.author.id}_${message.id}`)
      .setStyle(ButtonStyle.Danger)
      .setLabel(CROSS_MARK);

    const buttonRow = new ActionRowBuilder().addComponents(infoButton, deleteButton);

    const container = new ContainerBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent('## > Panel')
      )
      .addActionRowComponents(buttonRow);

    try {
      const botMessage = await message.reply({
        components: [container],
        flags: COMPONENTS_V2_FLAG
      });

      const collector = botMessage.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 60000,
        filter: (i) => i.user.id === primaryOwnerId
      });

      collector.on('collect', async (interaction) => {
        if (interaction.customId.startsWith('owner_ping_info_')) {
          const clientId = configService.get('clientId');
          const inviteLink = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=8&scope=bot%20applications.commands`;
          const prefix = configService.getPrefix(message.guild.id);
          const currentColor = configService.getColor(message.guild.id);
          const owners = configService.db?.getOwners ? configService.db.getOwners() : [{ user_id: primaryOwnerId, is_primary: true }];
          const ownerList = owners.map(o => `<@${o.user_id}>${o.is_primary ? ' (principal)' : ''}`).join('\n');

          const ephemeralEmbed = new EmbedBuilder()
            .setTitle('Informations du Bot')
            .addFields(
              { name: '> Lien d\'invitation', value: `[Clique ici pour inviter](${inviteLink})`, inline: false },
              { name: '> Préfixe actuel', value: `\`${prefix}\``, inline: true },
              { name: '> Couleur actuelle', value: `\`${currentColor}\``, inline: true },
              { name: '> Owner(s)', value: ownerList || 'Non défini', inline: false },
              { name: '> Commandes', value: `\`setprefix <nouveau>\` - Modifier le préfixe\n\`setcolor <#couleur>\` - Modifier la couleur`, inline: false }
            )
            .setTimestamp();

          const deployButton = new ButtonBuilder()
            .setCustomId(`owner_ping_deploy_${message.guild.id}_${message.id}`)
            .setLabel('Déployer les commandes')
            .setStyle(ButtonStyle.Success);

          const deployRow = new ActionRowBuilder().addComponents(deployButton);

          await interaction.reply({ embeds: [ephemeralEmbed], components: [deployRow], ephemeral: true });
        } else if (interaction.customId.startsWith('owner_ping_deploy_')) {
          await interaction.deferReply({ ephemeral: true });
          try {
            const result = await commandRegistry.registerSlashCommandsForGuild(interaction.guild.id);
            await interaction.editReply({ content: `✅ ${result.count} commandes slash déployées sur ce serveur.` });
          } catch (error) {
            await interaction.editReply({ content: `❌ Erreur: ${error.message}` });
          }
        } else if (interaction.customId.startsWith('owner_ping_delete_')) {
          await interaction.deferUpdate();
          await botMessage.delete().catch(() => {});
          await message.delete().catch(() => {});
        }
      });

      collector.on('end', async () => {
        const disabledRow = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('owner_ping_info_disabled')
              .setStyle(ButtonStyle.Primary)
              .setLabel(CHECK_MARK)
              .setDisabled(true),
            new ButtonBuilder()
              .setCustomId('owner_ping_delete_disabled')
              .setStyle(ButtonStyle.Danger)
              .setLabel(CROSS_MARK)
              .setDisabled(true)
          );
        await botMessage.edit({ components: [disabledRow] }).catch(() => {});
      });
    } catch (error) {
      console.error('owner ping event error:', error);
    }
  });
};

module.exports = { setupOwnerPingEvent };
