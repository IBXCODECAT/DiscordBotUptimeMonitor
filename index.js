require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const setup = require('./src/commands/setup');
const dashboard = require('./src/commands/dashboard');
const ready = require('./src/events/ready');
const presenceUpdate = require('./src/events/presenceUpdate');
const guildCreate = require('./src/events/guildCreate');
const web = require('./src/web/server');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildPresences,
  ],
});

ready.register(client);
presenceUpdate.register(client);
guildCreate.register(client);

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === 'setup') {
    await setup.execute(interaction);
  }
  if (interaction.commandName === 'dashboard') {
    await dashboard.execute(interaction);
  }
});

client.login(process.env.BOT_TOKEN);
web.start(client);
