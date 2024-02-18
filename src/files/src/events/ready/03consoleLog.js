module.exports = (client) => {
  const currentTime = new Date().toLocaleTimeString();
  console.log(`[${currentTime}] ✅ ${client.user.tag} is online.`, '\n');
};
