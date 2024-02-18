module.exports = (drop) => {
  // Check if the drop has collection titles (songs)
  return drop.tittles && drop.tittles.length > 1;
};
