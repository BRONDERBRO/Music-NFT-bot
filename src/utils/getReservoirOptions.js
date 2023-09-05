module.exports = () => {
  const headers = {
    accept: '*/*',
    'x-api-key': process.env.RESERVOIR_KEY
  };

  return options = {
    method: 'GET',
    headers: headers
  };
}
