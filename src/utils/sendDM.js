module.exports = (client, user, message) => {
    try {
      client.users.fetch(user, false).then((user) => {
      user.send(message).catch(err => console.log(err));
          //console.log("sendDM (",user.id," ",message)
      });
    } catch (error) {
      console.log("could not alert user: ", error);
    }
}