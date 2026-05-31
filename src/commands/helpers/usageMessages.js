const { buildCommandErrorEmbed, ERROR_CROSS } = require('../../utils/sanctionSuccessEmbeds');
const { buildEmbed } = require('../../utils/embedFactory');

const cloneHelpData = (help) => {
  if (!help) {
    return null;
  }
  return {
    ...help,
    usage: { ...(help.usage || {}) },
    examples: { ...(help.examples || {}) },
    notes: Array.isArray(help.notes) ? [...help.notes] : []
  };
};

const DEFAULT_PREFIX = '&';

const applyCommandPrefix = (text, commandPrefix) => {
  if (!text || !commandPrefix) {
    return text;
  }
  return text.replace(/&/g, commandPrefix);
};

const formatUsageLine = (help, type, field, commandPrefix) => {
  const value = help[field]?.[type];
  if (!value) {
    return null;
  }
  return type === 'prefix' ? applyCommandPrefix(value, commandPrefix) : value;
};

/** Embed d'erreur court (sans usage / exemple). */
const replyCommandError = (configService, baseMessage, commandPrefix = DEFAULT_PREFIX) => ({
  embeds: [buildCommandErrorEmbed(configService, applyCommandPrefix(baseMessage, commandPrefix))]
});

/**
 * Réponse avec aide détaillée sous forme d'embed incluant usage et exemple.
 */
const buildUsageResponse = (baseMessage, help, type, commandPrefix = DEFAULT_PREFIX, includeHint = false, configService = null) => {
  const message = type === 'prefix' ? applyCommandPrefix(baseMessage, commandPrefix) : baseMessage;

  if (!includeHint || !help || !configService) {
    return { content: message };
  }

  const usageValue = formatUsageLine(help, type, 'usage', commandPrefix);
  const exampleValue = formatUsageLine(help, type, 'examples', commandPrefix);

  const fields = [];
  if (usageValue) {
    fields.push({ name: '> ・Usage.', value: `\`${usageValue}\``, inline: false });
  }
  if (exampleValue) {
    fields.push({ name: '> ・Exemple.', value: `\`${exampleValue}\``, inline: false });
  }

  const dot = message.endsWith('.') || message.endsWith('?') ? '' : '.';
  const description = `${ERROR_CROSS}  ${message}${dot}`;

  return {
    embeds: [
      buildEmbed(configService, {
        description,
        fields,
        timestamp: false,
        suppressFooter: true
      })
    ]
  };
};

module.exports = {
  cloneHelpData,
  applyCommandPrefix,
  buildUsageResponse,
  replyCommandError
};
