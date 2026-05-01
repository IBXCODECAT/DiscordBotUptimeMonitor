const { leaveIfBanned } = require('../bannedGuilds');

function register(client) {
  client.on('guildCreate', async guild => {
    await leaveIfBanned(guild, client);
  });
}

module.exports = { register };
