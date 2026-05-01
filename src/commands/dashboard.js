const { SlashCommandBuilder } = require('discord.js');

const data = new SlashCommandBuilder()
  .setName('dashboard')
  .setDescription('Get a link to the management dashboard');

const PORT = process.env.PORT || 3000;
const DASHBOARD_URL = process.env.DASHBOARD_URL || `http://localhost:${PORT}`;

async function execute(interaction) {
  return interaction.reply({ content: `Manage your monitored bots here: ${DASHBOARD_URL}`, ephemeral: true });
}

module.exports = { data, execute };