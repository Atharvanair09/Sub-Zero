function getCycleIdentifier(frequency, dateInput) {
  const date = new Date(dateInput);
  const year = date.getFullYear();
  if (frequency === 'monthly') {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  } else if (frequency === 'weekly') {
    const firstDay = new Date(year, 0, 1);
    const pastDaysOfYear = (date - firstDay) / 86400000;
    const weekNum = Math.ceil((pastDaysOfYear + firstDay.getDay() + 1) / 7);
    return `${year}-W${String(weekNum).padStart(2, '0')}`;
  } else if (frequency === 'biweekly') {
    const firstDay = new Date(year, 0, 1);
    const pastDaysOfYear = (date - firstDay) / 86400000;
    const weekNum = Math.ceil((pastDaysOfYear + firstDay.getDay() + 1) / 7);
    const biWeekNum = Math.ceil(weekNum / 2);
    return `${year}-BW${String(biWeekNum).padStart(2, '0')}`;
  } else if (frequency === 'yearly') {
    return `${year}`;
  }
  return `${year}-${String(date.getMonth() + 1).padStart(2, '0')}`; // default
}

module.exports = {
  getCycleIdentifier
};
