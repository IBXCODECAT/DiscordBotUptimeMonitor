const fs = require('fs');
const path = require('path');
const { AuditLogEvent } = require('discord.js');

function loadBannedGuilds() {
  const filePath = path.join(__dirname, '..', 'banned-guilds.txt');
  try {
    return new Set(
      fs.readFileSync(filePath, 'utf8')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'))
    );
  } catch {
    return new Set();
  }
}

async function leaveIfBanned(guild, client) {
  if (!loadBannedGuilds().has(guild.id)) return false;

  try {
    const logs = await guild.fetchAuditLogs({ type: AuditLogEvent.BotAdd, limit: 10 });
    const entry = logs.entries.find(e => e.target?.id === client.user.id);
    if (entry?.executor) {
      await entry.executor.send(
        `Your server **${guild.name}** is on the banned list. The bot has left.`
      );
    }
  } catch {}

  await guild.leave();
  return true;
}

module.exports = { leaveIfBanned };
