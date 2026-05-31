const { ActionKeys } = require('../../utils/actionKeys');
const { helpEntries } = require('../definitions/helpContent');
const { cloneHelpData } = require('../helpers/usageMessages');
const { createSanctionApplyCommand } = require('../helpers/createSanctionCommand');

const help = cloneHelpData(helpEntries.ban);

const name = 'ban';
const description = 'Bannit un membre.';
const usage = 'ban <membre> [durée] [raison]';
const aliases = ['ban'];

module.exports = createSanctionApplyCommand({
  name,
  description,
  usage,
  aliases,
  description: 'Ban un membre',
  durationOption: {
    mode: 'optional',
    description: 'Durée optionnelle (ex: 60s, 30m, 24h, 7j). Vide = permanent.'
  },
  actionKey: ActionKeys.BAN,
  prefixAliases: ['ban'],
  embedTitle: 'Ban appliqué',
  applySuccessStyle: 'ban',
  includeDurationInEmbed: true,
  apply: async ({ sanctionService, guild, targetUser, executorUser, reason, durationMs }) =>
    sanctionService.applyBan({ guild, targetUser, executorUser, reason, durationMs }),
  help
});
