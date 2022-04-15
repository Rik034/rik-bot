const { SlashCommandBuilder, Embed } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("volume")
    .setDescription("Set the bot volume")
    .addNumberOption((option) =>
      option
        .setName("vol")
        .setDescription("The volume number")
        .setMinValue(1)
        .setRequired(true)
    ),
  run: async ({ client, interaction }) => {
    const queue = client.player.getQueue(interaction.guildId);
    const volume = interaction.options.getNumber("vol");
    queue.setVolume(volume);
    await interaction.deleteReply();
  },
};
