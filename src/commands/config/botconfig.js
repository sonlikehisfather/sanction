const { buildBotconfigMainEmbed, buildBotconfigMainComponents } = require('../../utils/botconfigHelpers');
const { helpEntries } = require('../definitions/helpContent');

const name = 'botconfig';
const description = 'Configure les paramètres du bot.';
const usage = '/botconfig';
const aliases = [];

module.exports = {
  name,
  description,
  usage,
  aliases,
  handleSlash: async ({ interaction, permissionService, configService }) => {
    if (!permissionService.isOwner(interaction.user.id)) {
      await interaction.reply({
        content: 'Seuls le propriétaire principal et les owners secondaires du bot peuvent utiliser cette commande.',
        ephemeral: true
      });
      return;
    }

    await interaction.reply({
      embeds: [buildBotconfigMainEmbed(configService)],
      components: buildBotconfigMainComponents(),
      ephemeral: false
    });
  },
  help: helpEntries.configBot
};
