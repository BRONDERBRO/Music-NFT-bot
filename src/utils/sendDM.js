module.exports = async (client, user, message) => {
  try {

      const fetchedUser = await client.users.fetch(user, false);
      await fetchedUser.send(message);
      // console.log('sendDM (', user.id, ' ', message);
      
  } catch (error) {
      console.error('Error sending DM:', error);
  }
};
