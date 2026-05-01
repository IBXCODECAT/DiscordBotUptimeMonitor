const { leaveIfBanned } = require('../bannedGuilds');

function register(client) {
  client.once('clientReady', async () => {
    for (const guild of client.guilds.cache.values()) {
      await leaveIfBanned(guild, client);
    }
    console.log(`Logged in as ${client.user.tag} in ${client.guilds.cache.size} guild(s)`);
  });
}

module.exports = { register };
