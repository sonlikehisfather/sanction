const { helpCategories, helpEntries } = require('../definitions/helpContent');
const { buildEmbed } = require('../../utils/embedFactory');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

const getCommandPrefix = (usage, serverPrefix) => {
  if (!usage) return '';
  // Remplacer & par le préfixe serveur
  const prefix = usage.prefix || '';
  const cmd = prefix.split(' ')[0] || '';
  return cmd.replace(/^&/, serverPrefix);
};

const buildPrefixFields = (configService, guildId) => {
  const fields = [];
  const serverPrefix = configService.getPrefix(guildId);
  
  for (const category of Object.values(helpCategories)) {
    const categoryCommands = Object.values(helpEntries).filter(
      entry => entry.category === category.id && entry.usage?.prefix
    );
    
    if (categoryCommands.length === 0) continue;
    
    const commandList = categoryCommands.map(cmd => {
      const prefix = getCommandPrefix(cmd.usage, serverPrefix);
      return `\`${prefix}\` - ${cmd.description || cmd.label}`;
    }).join('\n');
    
    fields.push({
      name: `📁 ${category.label}`,
      value: commandList,
      inline: false
    });
  }
  
  return fields;
};

const buildSlashFields = () => {
  const fields = [];
  const slashCommands = Object.values(helpEntries).filter(
    entry => entry.usage?.slash
  );
  
  if (slashCommands.length > 0) {
    const slashList = slashCommands.map(cmd => {
      return `\`${cmd.usage.slash}\` - ${cmd.description || cmd.label}`;
    }).join('\n');
    
    fields.push({
      name: `Slash Commands`,
      value: slashList,
      inline: false
    });
  }
  
  return fields;
};

const handlePrefix = async ({ message, configService, permissionService }) => {
  if (!permissionService.isOwner(message.author.id)) {
    await message.reply('Cette commande est réservée aux owners du bot.').catch(() => {});
    return;
  }

  const guildId = message.guild?.id;
  const prefix = configService.getPrefix(guildId);
  const prefixFields = buildPrefixFields(configService, guildId);
  const slashFields = buildSlashFields();

  // Page 1 - Prefix Commands
  const embedPage1 = buildEmbed(configService, {
    title: '📚 Liste des commandes',
    description: `> Préfixe actuel \`${prefix}\`\n\nPage 1/2 - Commands Préfixe`,
    fields: prefixFields,
    timestamp: true
  });

  // Page 2 - Slash Commands
  const embedPage2 = buildEmbed(configService, {
    title: 'Slash Commands',
    description: `> Page 2/2\n\n${slashFields.map(f => f.value).join('\n')}`,
    timestamp: true
  });

  const createRow = (page) => {
    return new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('help_prev')
          .setLabel('<<')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page === 1),
        new ButtonBuilder()
          .setCustomId('help_next')
          .setLabel('>>')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page === 2)
      );
  };

  let currentPage = 1;
  const sent = await message.reply({ embeds: [embedPage1], components: [createRow(currentPage)] });

  const collector = sent.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 60000,
    filter: (i) => i.user.id === message.author.id
  });

  collector.on('collect', async (interaction) => {
    if (interaction.customId === 'help_prev') {
      currentPage = 1;
      await interaction.update({ embeds: [embedPage1], components: [createRow(currentPage)] });
    } else if (interaction.customId === 'help_next') {
      currentPage = 2;
      await interaction.update({ embeds: [embedPage2], components: [createRow(currentPage)] });
    }
  });

  collector.on('end', async () => {
    const disabledRow = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('help_prev_disabled')
          .setLabel('<<')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId('help_next_disabled')
          .setLabel('>>')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(true)
      );
    await sent.edit({ components: [disabledRow] }).catch(() => {});
  });
};

const name = 'help';
const description = 'Menu d\'aide des commandes (réservé aux owners).';
const usage = 'help';
const aliases = ['help', 'h', 'aide'];

module.exports = {
  name,
  description,
  usage,
  aliases,
  prefix: {
    aliases: ['help', 'h', 'aide']
  },
  help: {
    key: 'help',
    label: 'Help',
    category: 'assistance',
    description: 'Menu d\'aide des commandes (réservé aux owners)',
    usage: {
      prefix: '&help'
    },
    examples: {
      prefix: '&help'
    },
    notes: [
      'Cette commande est réservée aux owners du bot.',
      'Affiche toutes les commandes organisées par catégories.'
    ]
  },
  handlePrefix
};
