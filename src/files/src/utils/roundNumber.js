module.exports = (number, decimals) => {
  const multiplier = Math.pow(10, decimals);
  const roundedNumber = Math.round(number * multiplier) / multiplier;

  /*
  console.log(
      'number:', number, '\n',
      'decimals:', decimals, '\n',
      'roundedNumber:', roundedNumber, '\n'
  );
  */

  return roundedNumber;
};
