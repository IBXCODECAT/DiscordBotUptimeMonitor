require('dotenv').config();
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const setup = require('./src/commands/setup');
const dashboard = require('./src/commands/dashboard');

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

(async () => {
  try {
    console.log('Registering slash commands globally...');
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: [setup.data.toJSON(), dashboard.data.toJSON()],
    });
    console.log('Slash commands registered.');
  } catch (err) {
    console.error(err);
  }
})();
