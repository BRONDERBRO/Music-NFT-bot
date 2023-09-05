module.exports = (blockchain) => {
  switch (blockchain) {
    case 'Base':
      return 'https://api-base.reservoir.tools';
    case 'Polygon':
      return 'https://api-polygon.reservoir.tools'; // Replace with the actual Polygon API URL
    default:
      return 'https://api.reservoir.tools';
  };
}
