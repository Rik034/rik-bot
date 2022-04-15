const Discord = require("discord.js");
const dotenv = require("dotenv");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const fs = require("fs");
const { Player } = require("discord-player");
const mongoose = require("mongoose");
//const testSchema = require("./test-schema");

dotenv.config();
const TOKEN = process.env.TOKEN;

const LOAD_SLASH = process.argv[2] == "load";
const LOAD_SLASH_GLOBAL = process.argv[2] == "global";

const CLIENT_ID = "962944796052303932";
const GUILD_ID = "914007305186574347";

const client = new Discord.Client({
  intents: ["GUILDS", "GUILD_VOICE_STATES"],
});

client.slashcommands = new Discord.Collection();
client.player = new Player(client, {
  ytdlOptions: {
    quality: "highestaudio",
    highWaterMark: 1 << 25,
  },
});

let commands = [];

const slashFiles = fs
  .readdirSync("./slash")
  .filter((file) => file.endsWith(".js"));
for (const file of slashFiles) {
  const slashcmd = require(`./slash/${file}`);
  client.slashcommands.set(slashcmd.data.name, slashcmd);
  if (LOAD_SLASH || LOAD_SLASH_GLOBAL) commands.push(slashcmd.data.toJSON());
}

if (LOAD_SLASH) {
  const rest = new REST({ version: "9" }).setToken(TOKEN);
  (async () => {
    try {
      console.log("Deploying slash commands");

      await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
        body: commands,
      });
      console.log("Successfully loaded");
      process.exit(0);

    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  })
} else if (LOAD_SLASH_GLOBAL) {
  const rest = new REST({ version: "9" }).setToken(TOKEN);
  (async () => {
    try {
      console.log("Deploying slash commands");

      await rest.put(Routes.applicationCommands(CLIENT_ID), {
        body: commands,
      });
      console.log("Successfully loaded");
      process.exit(0);

    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  })
} else {
  client.on("ready", async () => {
    // Connect to Database
    // await mongoose.connect(process.env.MONGO_URI, {
    //   keepAlive: true,
    // }, () => {
    //   console.log("Connected to MongoDB")
    // });

    console.log(`Logged in as ${client.user.tag}`);
  });

  client.on("interactionCreate", (interaction) => {
    async function handleCommand() {
      if (!interaction.isCommand()) return;

      const slashcmd = client.slashcommands.get(interaction.commandName);
      if (!slashcmd) interaction.reply("Not a valid slash command");

      await interaction.deferReply();
      await slashcmd.run({ client, interaction });
    }
    handleCommand();
  });
  client.login(TOKEN);
}
