const { buildEmbed } = require('../../utils/embedFactory');

const name = 'setprefix';
const description = 'Modifie le préfixe du bot (owner principal uniquement).';
const usage = 'setprefix <nouveau_prefixe>';
const aliases = ['setprefix'];

module.exports = {
  name,
  description,
  usage,
  aliases,
  prefix: {
    aliases: ['setprefix']
  },
  handlePrefix: async ({ message, args, configService, registry }) => {
    const primaryOwnerId = configService.get('ownerId');
    if (message.author.id !== primaryOwnerId) {
      await message.reply("Seul l'owner principal peut modifier le préfixe.");
      return;
    }

    const newPrefix = args[0];
    if (!newPrefix) {
      await message.reply('Usage: `setprefix <nouveau_prefixe>`');
      return;
    }

    if (newPrefix.length > 5) {
      await message.reply('Le préfixe ne peut pas dépasser 5 caractères.');
      return;
    }

    configService.setPrefix(message.guild.id, newPrefix);

    const embed = buildEmbed(configService, {
      title: 'Préfixe modifié',
      description: `Le préfixe de ce serveur a été changé en  \`${newPrefix}\``
    });

    await message.reply({ embeds: [embed] });
  },
  help: {
    key: 'setprefix',
    label: 'SetPrefix',
    category: 'owners',
    description: 'Modifier le préfixe du bot',
    usage: { prefix: '&setprefix <nouveau_prefixe>' },
    examples: { prefix: '&setprefix !' },
    notes: ['Seul l\'owner principal peut utiliser cette commande.', 'Maximum 5 caractères.', 'Stocké par serveur.']
  }
};
