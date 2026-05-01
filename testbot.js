require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => console.log(`Test bot online as ${client.user.tag}`));

client.login(process.env.TEST_BOT_TOKEN);
