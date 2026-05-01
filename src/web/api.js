const { Router } = require('express');
const { addMonitoredBot, removeMonitoredBot, getMonitoredBots, getReportingChannel, setReportingChannel } = require('../db');

const DISCORD_API = 'https://discord.com/api/v10';
const MANAGE_GUILD = BigInt(0x20);

function canManage(guild) {
  return guild.owner || (BigInt(guild.permissions) & MANAGE_GUILD) === MANAGE_GUILD;
}

function requireAuth(req, res, next) {
  if (!req.session?.user) return res.status(401).json({ error: 'Unauthenticated' });
  next();
}

function requireGuildAccess(client) {
  return (req, res, next) => {
    if (!req.session?.user) return res.status(401).json({ error: 'Unauthenticated' });
    const sessionGuild = (req.session.guilds || []).find(g => g.id === req.params.guildId);
    if (!sessionGuild || !canManage(sessionGuild)) return res.status(403).json({ error: 'Forbidden' });
    if (!client.guilds.cache.has(req.params.guildId)) return res.status(403).json({ error: 'Bot not in server' });
    next();
  };
}

function createApiRouter(client) {
  const router = Router();

  router.get('/me', requireAuth, (req, res) => res.json(req.session.user));

  router.get('/guilds', requireAuth, (req, res) => {
    const guilds = (req.session.guilds || []).filter(g => canManage(g) && client.guilds.cache.has(g.id));
    res.json(guilds);
  });

  router.get('/guild/:guildId', requireGuildAccess(client), (req, res) => {
    const g = client.guilds.cache.get(req.params.guildId);
    res.json({ id: g.id, name: g.name, icon: g.icon });
  });

  router.get('/guild/:guildId/channels', requireGuildAccess(client), (req, res) => {
    const guild = client.guilds.cache.get(req.params.guildId);
    const channels = [...guild.channels.cache.values()]
      .filter(c => c.isTextBased() && !c.isThread())
      .sort((a, b) => a.position - b.position)
      .map(c => ({ id: c.id, name: c.name }));
    res.json({ channels, reportingChannelId: getReportingChannel(req.params.guildId) });
  });

  router.get('/guild/:guildId/bots', requireGuildAccess(client), async (req, res) => {
    const { guildId } = req.params;
    try {
      const r = await fetch(`${DISCORD_API}/guilds/${guildId}/members?limit=1000`, {
        headers: { Authorization: `Bot ${process.env.BOT_TOKEN}` },
      });
      const members = await r.json();
      if (!Array.isArray(members)) return res.status(502).json({ error: 'Failed to fetch members — ensure Server Members Intent is enabled in the Developer Portal' });
      const monitored = new Set(getMonitoredBots(guildId));
      const bots = members
        .filter(m => m.user.bot && m.user.id !== client.user.id)
        .map(m => ({
          id: m.user.id,
          username: m.user.username,
          avatar: m.user.avatar,
          monitored: monitored.has(m.user.id),
        }));
      res.json(bots);
    } catch {
      res.status(500).json({ error: 'Internal error' });
    }
  });

  router.post('/guild/:guildId/bots/:botId/monitor', requireGuildAccess(client), (req, res) => {
    const { guildId, botId } = req.params;
    if (req.body.enabled) addMonitoredBot(guildId, botId); else removeMonitoredBot(guildId, botId);
    res.json({ ok: true });
  });

  router.put('/guild/:guildId/channel', requireGuildAccess(client), (req, res) => {
    setReportingChannel(req.params.guildId, req.body.channelId);
    res.json({ ok: true });
  });

  return router;
}

module.exports = { createApiRouter };
