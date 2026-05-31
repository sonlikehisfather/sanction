const { ActionKeys } = require('../../utils/actionKeys');
const { helpEntries } = require('../definitions/helpContent');
const { cloneHelpData } = require('../helpers/usageMessages');
const { createSanctionApplyCommand } = require('../helpers/createSanctionCommand');

const help = cloneHelpData(helpEntries.mute);
help.key = 'to';
help.label = 'To';
help.usage.prefix = '&To @utilisateur [durée] <raison>';
help.examples.prefix = '&To @Noé 30m Spam emoji';

const name = 'to';
const description = 'Timeout un membre.';
const usage = 'to <membre> [durée] [raison]';
const aliases = ['to', 'timeout'];

module.exports = createSanctionApplyCommand({
  name,
  description,
  usage,
  aliases,
  description: 'Timeout un membre',
  durationOption: {
    mode: 'optional',
    description: 'Durée optionnelle (ex: 30m, 2h). Laisser vide pour appliquer la durée maximale.'
  },
  actionKey: ActionKeys.MUTE,
  prefixAliases: ['To'],
  embedTitle: 'Timeout appliqué',
  applySuccessStyle: 'mute',
  includeDurationInEmbed: true,
  apply: async ({ sanctionService, guild, targetUser, executorUser, reason, durationMs }) =>
    sanctionService.applyMute({ guild, targetUser, executorUser, reason, durationMs, muteType: 'timeout' }),
  help
});
