const { ActivityType } = require('discord.js');

const setupTwitchStatusEvent = (client) => {
  client.once('clientReady', () => {
    client.user.setActivity('mysoulislost', {
      type: ActivityType.Streaming,
      url: 'https://twitch.tv/mysoulislost'
    });
  });
};

module.exports = { setupTwitchStatusEvent };
