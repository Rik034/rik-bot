const { SlashCommandBuilder, Embed } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const axios = require("axios");
const fs = require("fs");

const API_KEY = process.env.RIOT_API_KEY;
const DDragon = "https://ddragon.leagueoflegends.com/cdn/12.11.1";

const APICall = "https://euw1.api.riotgames.com/lol";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("lol")
    .setDescription("Shows information about a LoL account")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("Name of the account")
        .setRequired(true)
    ),
  run: async ({ interaction }) => {
    try {
      let response = await axios.get(`${DDragon}/data/en_US/champion.json`);
      const champions = response.data.data;

      let name = interaction.options.getString("name");

      const APICallSummoner = `${APICall}/summoner/v4/summoners/by-name/${encodeURI(
        name
      )}?api_key=${API_KEY}`;

      try {
        response = await axios.get(APICallSummoner);
      } catch (e) {
        return await interaction.editReply("Summoner not found!");
      }
      const playerData = response.data;

      const profileImage = `${DDragon}/img/profileicon/${playerData.profileIconId}.png`;

      const APICallMastery = `${APICall}/champion-mastery/v4/champion-masteries/by-summoner/${playerData.id}?api_key=${API_KEY}`;

      response = await axios.get(APICallMastery);
      const masteryData = response.data;

      let main;

      if (masteryData[0]) {
        for (const champ in champions) {
          //console.log(`${champions[champ].id} : ${champions[champ].key}`);
          if (masteryData[0].championId === parseInt(champions[champ].key)) {
            main = champions[champ].id;
            break;
          }
        }
      }

      const championImage = `${DDragon}/img/champion/${main}.png`;

      const APICallRank = `${APICall}/league/v4/entries/by-summoner/${playerData.id}?api_key=${API_KEY}`;

      response = await axios.get(`${APICallRank}`);
      const rankData = response.data;

      let solo = {
        queue: "Ranked Solo/Duo",
        tier: "Unranked",
        rank: " ",
        lp: " ",
      };

      let flex = {
        queue: "Ranked Flex",
        tier: "Unranked",
        rank: " ",
        lp: " ",
      };

      if (rankData[0]) {
        if (rankData[0].queueType == "RANKED_SOLO_5x5") {
          solo.tier = rankData[0].tier;
          solo.rank = rankData[0].rank;
          solo.lp = `${rankData[0].leaguePoints} LP`;
        } else if (rankData[0].queueType == "RANKED_FLEX_SR") {
          flex.tier = rankData[0].tier;
          flex.rank = rankData[0].rank;
          flex.lp = `${rankData[0].leaguePoints} LP`;
        }
      }

      if (rankData[1]) {
        if (rankData[1].queueType == "RANKED_FLEX_SR") {
          flex.tier = rankData[1].tier;
          flex.rank = rankData[1].rank;
          flex.lp = `${rankData[1].leaguePoints} LP`;
        } else if (rankData[1].queueType == "RANKED_SOLO_5x5") {
          solo.tier = rankData[1].tier;
          solo.rank = rankData[1].rank;
          solo.lp = `${rankData[1].leaguePoints} LP`;
        }
      }

      if (!masteryData[0]) {
        return await interaction.editReply({
          embeds: [
            new MessageEmbed()
              .setTitle(`${playerData.name}`)
              .setURL(
                encodeURI(`https://euw.op.gg/summoners/euw/${playerData.name}`)
              )
              .setDescription(`Level: ${playerData.summonerLevel}`)
              .setThumbnail(profileImage)
              .addFields(
                {
                  name: `Ranked Solo/Duo`,
                  value: `${solo.tier} ${solo.rank}\n${solo.lp}`,
                },
                {
                  name: `Ranked Flex`,
                  value: `${flex.tier} ${flex.rank}\n${flex.lp}`,
                }
              ),
          ],
        });
      }

      await interaction.editReply({
        embeds: [
          new MessageEmbed()
            .setTitle(`${playerData.name}`)
            .setURL(
              encodeURI(`https://euw.op.gg/summoners/euw/${playerData.name}`)
            )
            .setDescription(`Level: ${playerData.summonerLevel}`)
            .setThumbnail(profileImage)
            .addFields(
              {
                name: `Ranked Solo/Duo`,
                value: `${solo.tier} ${solo.rank}\n${solo.lp}`,
              },
              {
                name: `Ranked Flex`,
                value: `${flex.tier} ${flex.rank}\n${flex.lp}`,
              },
              { name: "\u200B", value: "\u200B" },
              { name: "Main", value: `${main}`, inline: true },
              {
                name: "Mastery Level",
                value: `${masteryData[0].championLevel}`,
                inline: true,
              },
              {
                name: "Mastery Points",
                value: `${masteryData[0].championPoints}`,
                inline: true,
              }
            )
            .setImage(championImage),
        ],
      });
    } catch (e) {
      console.log(e);
      await interaction.editReply({
        content: "Failed to retrieve data",
        ephemeral: true,
      });
    }
  },
};
