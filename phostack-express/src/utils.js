function getRandomTimestamp(startDate, endDate) {
  // Convert start and end dates to timestamps
  const startTimestamp = startDate.getTime();
  const endTimestamp = endDate.getTime();

  // Generate a random timestamp between start and end dates
  const randomTimestamp =
    startTimestamp + Math.random() * (endTimestamp - startTimestamp);

  // Create a new Date object using the random timestamp
  const randomDate = new Date(randomTimestamp);

  // Format the date as 'YYYY-MM-DD HH:mm:ss'
  const formattedDate = randomDate.toISOString().slice(0, 19).replace('T', ' ');

  return formattedDate;
}

function getRandomElement(array) {
  // Generate a random index within the length of the array
  const randomIndex = Math.floor(Math.random() * array.length);
  // Return the element at the randomly generated index
  return array[randomIndex];
}

function getMonthAbbreviation(monthNumber) {
  switch (monthNumber) {
    case 1:
      return 'Jan';
    case 2:
      return 'Feb';
    case 3:
      return 'Mar';
    case 4:
      return 'Apr';
    case 5:
      return 'May';
    case 6:
      return 'Jun';
    case 7:
      return 'Jul';
    case 8:
      return 'Aug';
    case 9:
      return 'Sep';
    case 10:
      return 'Oct';
    case 11:
      return 'Nov';
    case 12:
      return 'Dec';
    default:
      return '';
  }
}

module.exports = {
  getRandomTimestamp,
  getRandomElement,
  getMonthAbbreviation
};
