import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { config } from '../config';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tournament')
    .setDescription('Tournament management commands')
    .addSubcommand(subcommand =>
      subcommand
        .setName('template')
        .setDescription('Get the master template spreadsheet to create a new tournament')
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'template') {
      const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('📋 vPoll Master Template')
        .setDescription('Use this template to create your tournament bracket!')
        .addFields(
          {
            name: '🔗 Template Link',
            value: `[Click here to open master template](${config.masterTemplateUrl})`,
          },
          {
            name: '📝 How to use:',
            value:
              '1. Open the template link above\n' +
              '2. Click **File → Make a copy**\n' +
              '3. Rename your copy (e.g., "Star Trek Character Battle 2025")\n' +
              '4. Fill in the Participants, Config, and Regions tabs\n' +
              '5. Share your copy with the service account (see below)\n' +
              '6. Run `/tournament create <your-sheet-url>` in Discord',
          },
          {
            name: '🔐 Service Account Email',
            value: '`vpoll-sheets-access@vpoll-475821.iam.gserviceaccount.com`\n(Give **Editor** permission)',
          },
          {
            name: '📚 Documentation',
            value: 'For detailed setup instructions, see the README or REQUIREMENTS.md',
          }
        )
        .setFooter({ text: 'vPoll - Tournament Voting Made Easy' });

      await interaction.reply({ embeds: [embed] });
    }
  },
};
