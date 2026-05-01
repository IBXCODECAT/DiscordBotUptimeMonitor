const express = require('express');
const session = require('express-session');
const path = require('path');
const { createApiRouter } = require('./api');

const DISCORD_API = 'https://discord.com/api/v10';

function start(client) {
  const app = express();

  app.use(express.json());
  app.use(session({
    secret: process.env.SESSION_SECRET || 'changeme',
    resave: false,
    saveUninitialized: false,
  }));

  app.get('/auth/login', (_req, res) => {
    const params = new URLSearchParams({
      client_id: process.env.CLIENT_ID,
      redirect_uri: process.env.REDIRECT_URI,
      response_type: 'code',
      scope: 'identify guilds',
    });
    res.redirect(`https://discord.com/api/oauth2/authorize?${params}`);
  });

  app.get('/auth/callback', async (req, res) => {
    const { code } = req.query;
    if (!code) return res.redirect('/');
    try {
      const tokenRes = await fetch(`${DISCORD_API}/oauth2/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: process.env.CLIENT_ID,
          client_secret: process.env.CLIENT_SECRET,
          grant_type: 'authorization_code',
          code,
          redirect_uri: process.env.REDIRECT_URI,
        }),
      });
      const { access_token } = await tokenRes.json();
      const [user, guilds] = await Promise.all([
        fetch(`${DISCORD_API}/users/@me`, { headers: { Authorization: `Bearer ${access_token}` } }).then(r => r.json()),
        fetch(`${DISCORD_API}/users/@me/guilds`, { headers: { Authorization: `Bearer ${access_token}` } }).then(r => r.json()),
      ]);
      req.session.user = user;
      req.session.guilds = guilds;
      res.redirect('/');
    } catch (err) {
      console.error('OAuth error:', err);
      res.redirect('/');
    }
  });

  app.get('/auth/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
  });

  app.use('/api', createApiRouter(client));
  app.use(express.static(path.join(__dirname, 'public')));

  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Dashboard: http://localhost:${port}`));
}

module.exports = { start };
