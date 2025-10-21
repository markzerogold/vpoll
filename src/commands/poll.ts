import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Create a poll')
    .addStringOption((option) =>
      option
        .setName('question')
        .setDescription('The poll question')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('options')
        .setDescription('Poll options separated by semicolons (e.g., "Yes;No;Maybe")')
        .setRequired(true)
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const question = interaction.options.getString('question', true);
    const optionsString = interaction.options.getString('options', true);
    const options = optionsString.split(';').map((opt) => opt.trim()).filter((opt) => opt.length > 0);

    if (options.length < 2) {
      await interaction.reply({
        content: 'Please provide at least 2 options separated by semicolons.',
        ephemeral: true,
      });
      return;
    }

    if (options.length > 5) {
      await interaction.reply({
        content: 'Maximum 5 options allowed.',
        ephemeral: true,
      });
      return;
    }

    // Create embed
    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle('📊 ' + question)
      .setDescription(options.map((opt, idx) => `${idx + 1}. ${opt}`).join('\n'))
      .setFooter({ text: `Poll by ${interaction.user.tag}` })
      .setTimestamp();

    // Create buttons (up to 5)
    const row = new ActionRowBuilder<ButtonBuilder>();
    const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];

    for (let i = 0; i < options.length; i++) {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`poll_vote_${i}`)
          .setLabel(options[i])
          .setEmoji(emojis[i])
          .setStyle(ButtonStyle.Primary)
      );
    }

    await interaction.reply({
      embeds: [embed],
      components: [row],
    });
  },
};
