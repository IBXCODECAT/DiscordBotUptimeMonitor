const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { addMonitoredBot, isMonitored, setReportingChannel } = require('../db');

const data = new SlashCommandBuilder()
  .setName('setup')
  .setDescription('Configure the bot monitor')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addSubcommand(sub =>
    sub
      .setName('monitor')
      .setDescription('Add a bot to the offline monitor list')
      .addUserOption(opt =>
        opt.setName('bot').setDescription('The bot to monitor').setRequired(true)
      )
  )
  .addSubcommand(sub =>
    sub
      .setName('reporting-channel')
      .setDescription('Set the channel where offline alerts are sent')
      .addChannelOption(opt =>
        opt
          .setName('channel')
          .setDescription('Text channel for alerts')
          .addChannelTypes(ChannelType.GuildText)
          .setRequired(true)
      )
  );

async function execute(interaction) {
  const sub = interaction.options.getSubcommand();

  if (sub === 'monitor') {
    const user = interaction.options.getUser('bot');

    if (!user.bot && !process.argv.includes('test')) {
      return interaction.reply({ content: 'Only bots can be monitored.', ephemeral: true });
    }

    if (isMonitored(interaction.guildId, user.id)) {
      return interaction.reply({ content: `<@${user.id}> is already being monitored.`, ephemeral: true });
    }

    addMonitoredBot(interaction.guildId, user.id);
    return interaction.reply({ content: `Now monitoring <@${user.id}> for offline status.`, ephemeral: true });
  }

  if (sub === 'reporting-channel') {
    const channel = interaction.options.getChannel('channel');
    setReportingChannel(interaction.guildId, channel.id);
    return interaction.reply({ content: `Reporting channel set to <#${channel.id}>. Offline alerts will be sent there.`, ephemeral: true });
  }
}

module.exports = { data, execute };
