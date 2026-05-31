const { ActionKeys, SanctionTypes } = require('../../utils/actionKeys');
const { helpEntries } = require('../definitions/helpContent');
const { cloneHelpData } = require('../helpers/usageMessages');
const { createSanctionRevokeCommand } = require('../helpers/createSanctionCommand');

const help = cloneHelpData(helpEntries.unblacklist);

const name = 'unblacklist';
const description = 'Retire la blacklist d\'un membre.';
const usage = 'unblacklist <membre>';
const aliases = ['unblacklist', 'unbl'];

module.exports = createSanctionRevokeCommand({
  name,
  description,
  usage,
  aliases,
  description: "Retirer la blacklist d'un utilisateur",
  actionKey: ActionKeys.UNBLACKLIST,
  prefixAliases: ['unblacklist', 'unbl'],
  embedTitle: 'Blacklist serveur retirée',
  revokeSuccessStyle: 'unblacklist',
  sanctionTypes: [SanctionTypes.BLACKLIST, SanctionTypes.TEMPBLACKLIST],
  revoke: async ({ sanctionService, guild, sanction, executorUser, reason }) =>
    sanctionService.revokeBlacklist({ guild, sanction, executorUser, reason }),
  help
});
