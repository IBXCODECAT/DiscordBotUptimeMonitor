function register(client) {
  client.once('clientReady', async () => {
    console.log(`Logged in as ${client.user.tag} in ${client.guilds.cache.size} guild(s)`);
  });
}

module.exports = { register };
