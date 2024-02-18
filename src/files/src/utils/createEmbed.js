const { EmbedBuilder } = require('discord.js');

module.exports.createEmbed = (client, title, description, color, url) => {
  return new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setColor(color)
      .setTimestamp(Date.now())
      .setURL(url)
      .setAuthor({
          iconURL: client.user.displayAvatarURL(),
          name: client.user.tag,
      })
      .setFooter({
          iconURL: client.user.displayAvatarURL(),
          text: client.user.tag,
      });
};