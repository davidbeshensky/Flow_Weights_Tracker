export function getMondayOfCurrentWeek(date = new Date()) {
    // getDay() returns 0 for Sunday, 1 for Monday, etc.
    const day = date.getDay(); 
    const diffToMonday = day === 0 ? 6 : day - 1; 
    // If day === 0 (Sunday), we want to go back 6 days to get Monday
    // If day === 1 (Monday), diffToMonday is 0, etc.
  
    const monday = new Date(date);
    monday.setHours(0, 0, 0, 0); // reset time to 00:00
    monday.setDate(monday.getDate() - diffToMonday);
    return monday;
  }
  
export function getSundayOfCurrentWeek(monday: Date) {
    // Sunday = Monday + 6 days
    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999); // end of Sunday
    return sunday;
  }
  