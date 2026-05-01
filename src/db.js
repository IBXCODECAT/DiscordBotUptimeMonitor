const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '..', 'data.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS guilds (
    guild_id TEXT PRIMARY KEY,
    reporting_channel_id TEXT
  );

  CREATE TABLE IF NOT EXISTS monitored_bots (
    guild_id TEXT NOT NULL,
    bot_id   TEXT NOT NULL,
    PRIMARY KEY (guild_id, bot_id),
    FOREIGN KEY (guild_id) REFERENCES guilds(guild_id)
  );
`);

const stmts = {
  getReportingChannel: db.prepare('SELECT reporting_channel_id FROM guilds WHERE guild_id = ?'),
  setReportingChannel: db.prepare(
    'INSERT INTO guilds (guild_id, reporting_channel_id) VALUES (?, ?) ON CONFLICT(guild_id) DO UPDATE SET reporting_channel_id = excluded.reporting_channel_id'
  ),
  ensureGuild: db.prepare(
    'INSERT OR IGNORE INTO guilds (guild_id, reporting_channel_id) VALUES (?, NULL)'
  ),
  addMonitoredBot: db.prepare(
    'INSERT OR IGNORE INTO monitored_bots (guild_id, bot_id) VALUES (?, ?)'
  ),
  removeMonitoredBot: db.prepare(
    'DELETE FROM monitored_bots WHERE guild_id = ? AND bot_id = ?'
  ),
  getMonitoredBots: db.prepare(
    'SELECT bot_id FROM monitored_bots WHERE guild_id = ?'
  ),
  isMonitored: db.prepare(
    'SELECT 1 FROM monitored_bots WHERE guild_id = ? AND bot_id = ?'
  ),
};

function getReportingChannel(guildId) {
  const row = stmts.getReportingChannel.get(guildId);
  return row?.reporting_channel_id ?? null;
}

function setReportingChannel(guildId, channelId) {
  stmts.setReportingChannel.run(guildId, channelId);
}

function addMonitoredBot(guildId, botId) {
  stmts.ensureGuild.run(guildId);
  stmts.addMonitoredBot.run(guildId, botId);
}

function removeMonitoredBot(guildId, botId) {
  stmts.removeMonitoredBot.run(guildId, botId);
}

function getMonitoredBots(guildId) {
  return stmts.getMonitoredBots.all(guildId).map(r => r.bot_id);
}

function isMonitored(guildId, botId) {
  return !!stmts.isMonitored.get(guildId, botId);
}

module.exports = { getReportingChannel, setReportingChannel, addMonitoredBot, removeMonitoredBot, getMonitoredBots, isMonitored };
