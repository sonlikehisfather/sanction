const { EmbedBuilder } = require('discord.js');

const buildEmbed = (configService, { title, description, fields = [], thumbnail, timestamp = true, color, footerText, footerIcon, suppressFooter = false }) => {
  const embed = new EmbedBuilder();
  const resolvedColor = color || configService.getColor();
  // Safety check: ensure color is valid for Discord.js
  const finalColor = typeof resolvedColor === 'string' && /^#[0-9A-Fa-f]{6}$/.test(resolvedColor)
    ? resolvedColor
    : typeof resolvedColor === 'number'
      ? resolvedColor
      : '#5865F2';
  embed.setColor(finalColor);
  if (title) {
    embed.setTitle(title);
  }
  if (description) {
    embed.setDescription(description);
  }
  if (Array.isArray(fields) && fields.length > 0) {
    embed.addFields(fields);
  }
  if (thumbnail) {
    embed.setThumbnail(thumbnail);
  }
  if (timestamp) {
    embed.setTimestamp(new Date());
  }
  if (!suppressFooter) {
    const footer = footerText || configService.getFooter();
    if (footer) {
      embed.setFooter({ text: footer, iconURL: footerIcon || null });
    }
  }
  return embed;
};

module.exports = { buildEmbed };
