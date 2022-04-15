const { SlashCommandBuilder, Embed } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Deletes messages in a channel")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("number")
        .setDescription("Deletes specified number of messages")
        .addNumberOption((option) =>
          option
            .setName("numberdel")
            .setDescription("Number of messages to delete")
            .setMinValue(1)
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("all").setDescription("Deletes all (99) messages")
    ),
  run: async ({ interaction }) => {
    if (interaction.options.getSubcommand() === "all") {
      await interaction.deleteReply();
      await interaction.channel.bulkDelete(100).catch(console.error);
    } else if (interaction.options.getSubcommand() === "number") {
      const delNum = interaction.options.getNumber("numberdel");
      await interaction.deleteReply();
      await interaction.channel.bulkDelete(delNum).catch(console.error);
    }
  },
};
