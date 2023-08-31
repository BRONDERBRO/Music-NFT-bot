module.exports = async (client, user, embed) => {
  try {
    
      const fetchedUser = await client.users.fetch(user, false);
      await fetchedUser.send({ embeds: [embed] });
      // console.log('sendembedDM (', user.id, ' ', message);

  } catch (error) {
      console.error('Error sending embed DM:', error);
  }
};
