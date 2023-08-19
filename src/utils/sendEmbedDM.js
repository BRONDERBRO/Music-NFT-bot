module.exports = (client, user, embed) => {
    try {
      client.users.fetch(user, false).then((user) => {
      user.send({embeds: [embed]}).catch(err => console.log(err));
          //console.log('sendembedDM (',user.id,' ',message)
      });
    } catch (error) {
      console.log('could not alert user: ', error);
    }
}