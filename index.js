require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const setup = require('./src/commands/setup');
const ready = require('./src/events/ready');
const presenceUpdate = require('./src/events/presenceUpdate');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildPresences,
  ],
});

ready.register(client);
presenceUpdate.register(client);

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === 'setup') {
    await setup.execute(interaction);
  }
});

client.login(process.env.BOT_TOKEN);
