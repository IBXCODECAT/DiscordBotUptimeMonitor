const { isMonitored, getReportingChannel } = require('../db');

function register(client) {
  client.on('presenceUpdate', async (oldPresence, newPresence) => {
    if (!newPresence?.guild) return;

    const { guild, userId } = newPresence;

    if (!newPresence.user?.bot && !process.argv.includes('test')) return;

    if (!isMonitored(guild.id, userId)) return;

    const wasOnline = oldPresence && oldPresence.status !== 'offline';
    const isNowOnline = newPresence.status && newPresence.status !== 'offline';
    const isNowOffline = !newPresence.status || newPresence.status === 'offline';

    const channelId = getReportingChannel(guild.id);
    if (!channelId) return;

    const channel = guild.channels.cache.get(channelId);
    if (!channel?.isTextBased()) return;

    if (!wasOnline && isNowOnline) {
      await channel.send(`✅ Monitored bot <@${userId}> is back online.`);
    } else if (wasOnline && isNowOffline) {
      await channel.send(`⚠️ Monitored bot <@${userId}> has gone offline.`);
    }
  });
}

module.exports = { register };
