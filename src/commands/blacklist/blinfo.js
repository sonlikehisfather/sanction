const { ActionKeys } = require('../../utils/actionKeys');
const { helpEntries } = require('../definitions/helpContent');
const { cloneHelpData, replyCommandError } = require('../helpers/usageMessages');

const help = cloneHelpData(helpEntries.blinfo || {
  key: 'blinfo',
  label: 'Blacklist Info',
  category: 'sanctions',
  description: 'Info sur une blacklist',
  usage: { prefix: '&blinfo <utilisateur>' },
  examples: { prefix: '&blinfo @utilisateur' }
});

const name = 'blinfo';
const description = 'Affiche les informations sur une blacklist.';
const usage = 'blinfo <membre>';
const aliases = ['blinfo'];

module.exports = {
  name,
  description,
  usage,
  aliases,
  prefix: { aliases: ['blinfo'] },
  handlePrefix: async ({ message, args, registry, db, configService, sanctionService }) => {
    const guild = message.guild;
    if (!guild) {
      return;
    }

    const executorMember = message.member;
    const commandPrefix = configService.getPrefix();
    const target = await registry.resolveCommandTarget(message, args);
    if (target.error) {
      await message.reply(replyCommandError(configService, target.error, commandPrefix));
      return;
    }
    const userId = target.userId;

    const canBlacklist = await registry.permissionService.canExecute(executorMember, ActionKeys.BLACKLIST);

    if (!canBlacklist && !registry.permissionService.isOwner(executorMember.id)) {
      await message.reply(replyCommandError(configService, "Vous n'avez pas la permission d'exécuter cette action", commandPrefix));
      return;
    }

    const targetUser = await message.client.users.fetch(userId).catch(() => null);
    if (!targetUser) {
      await message.reply(replyCommandError(configService, 'Utilisateur introuvable.', commandPrefix));
      return;
    }

    try {
      const sanctions = db.listSanctions(guild.id, userId, 1, 0);
      const blacklist = sanctions.find(s => s.type === 'BLACKLIST' || s.type === 'TEMPBLACKLIST');
      
      if (!blacklist) {
        const embed = {
          color: parseInt(configService.getColor().replace('#', ''), 16),
          description: '✗ Aucune blacklist trouvée pour cet utilisateur.'
        };
        await message.reply({ embeds: [embed] });
        return;
      }

      const isBanned = sanctions.some(s => s.type === 'BAN' || s.type === 'TEMPBAN');
      const byOwner = sanctionService.wasBlacklistedByOwner(blacklist);
      const executorUser = await message.client.users.fetch(blacklist.executor_id).catch(() => null);
      const executorIsOwner = db.isOwner(executorMember.id);

      const embed = {
        color: parseInt(configService.getColor().replace('#', ''), 16),
        title: 'Informations sur la Blacklist',
        fields: [
          {
            name: '👤 > Auteur',
            value: isBanned ? `\`\`\`\n❌\n\`\`\`` : (byOwner && !executorIsOwner ? `\`\`\`\nOwner\n\`\`\`` : `\`\`\`\n> Nom d'utilisateur ${executorUser?.username || 'Inconnu'}\n> Identifiant ${blacklist.executor_id}\n\`\`\``),
            inline: false
          },
          {
            name: '📄 > Informations',
            value: `\`\`\`\n> Raison ${blacklist.reason || '-'}\n\`\`\``,
            inline: false
          }
        ],
      };

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply(replyCommandError(configService, error.message, commandPrefix));
    }
  },
  actionKey: null,
  help
};
