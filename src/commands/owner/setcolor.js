const { buildEmbed } = require('../../utils/embedFactory');

const name = 'setcolor';
const description = 'Modifie la couleur du bot (owner principal uniquement).';
const usage = 'setcolor <#couleur_hex>';
const aliases = ['setcolor'];

module.exports = {
  name,
  description,
  usage,
  aliases,
  prefix: {
    aliases: ['setcolor']
  },
  handlePrefix: async ({ message, args, configService }) => {
    const primaryOwnerId = configService.get('ownerId');
    if (message.author.id !== primaryOwnerId) {
      await message.reply("Seul l'owner principal peut modifier la couleur.");
      return;
    }

    const newColor = args[0];
    if (!newColor) {
      await message.reply('Usage: `setcolor <#couleur_hex>` (ex: `#5865F2`)');
      return;
    }

    const hexRegex = /^#[0-9A-Fa-f]{6}$/;
    if (!hexRegex.test(newColor)) {
      await message.reply('Format invalide. Utilisez un code hexadécimal : `#RRGGBB` (ex: `#5865F2`)');
      return;
    }

    configService.setColor(message.guild.id, newColor);

    const embed = buildEmbed(configService, {
      title: 'Couleur modifiée',
      description: `La couleur de ce serveur a été changée en > \`${newColor.toUpperCase()}\``
    });

    await message.reply({ embeds: [embed] });
  },
  help: {
    key: 'setcolor',
    label: 'SetColor',
    category: 'owners',
    description: 'Modifier la couleur des embeds du bot',
    usage: { prefix: '&setcolor <#couleur_hex>' },
    examples: { prefix: '&setcolor #FF5733' },
    notes: ['Seul l\'owner principal peut utiliser cette commande.', 'Format hexadécimal requis : #RRGGBB', 'Stocké par serveur.']
  }
};
