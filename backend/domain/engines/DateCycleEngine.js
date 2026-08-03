class DateCycleEngine {
  static getDeduplicationWindow(dateStrOrMs) {
    const timestamp = new Date(dateStrOrMs).getTime();
    return {
      windowStart: new Date(timestamp - 2 * 60 * 60 * 1000),
      windowEnd: new Date(timestamp + 2 * 60 * 60 * 1000)
    };
  }

  static getCycleDays(billingCycle) {
    return billingCycle === 'monthly' ? 30 : 365;
  }

  static getDaysAgo(days, fromDate = Date.now()) {
    return new Date(new Date(fromDate).getTime() - days * 24 * 60 * 60 * 1000);
  }

  static getStartOfMonth(fromDate = new Date()) {
    const d = new Date(fromDate);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  }

  static getDaysDifference(date1, date2) {
    return Math.abs(new Date(date1).getTime() - new Date(date2).getTime()) / (1000 * 3600 * 24);
  }

  static getDaysUntil(targetDate, fromDate = new Date()) {
    return Math.ceil((new Date(targetDate).getTime() - new Date(fromDate).getTime()) / (1000 * 60 * 60 * 24));
  }

  static isIncomeTimeMatch(frequency, daysDiff) {
    if (frequency === 'monthly' && daysDiff >= 26 && daysDiff <= 35) return true;
    if (frequency === 'weekly' && daysDiff >= 5 && daysDiff <= 9) return true;
    if (frequency === 'biweekly' && daysDiff >= 12 && daysDiff <= 16) return true;
    return false;
  }

  static getIncomeReferenceDate(lastCycleDate, nextExpectedDate, createdAt, frequency) {
    if (lastCycleDate) return new Date(lastCycleDate);
    if (nextExpectedDate) {
      const referenceDate = new Date(nextExpectedDate);
      if (frequency === 'monthly') referenceDate.setMonth(referenceDate.getMonth() - 1);
      else if (frequency === 'biweekly') referenceDate.setDate(referenceDate.getDate() - 14);
      else if (frequency === 'weekly') referenceDate.setDate(referenceDate.getDate() - 7);
      return referenceDate;
    }
    return new Date(createdAt);
  }

  static isWeekend(date) {
    const day = new Date(date).getDay();
    return day === 0 || day === 6;
  }
  
  static isLateNight(date) {
    const hour = new Date(date).getHours();
    return hour >= 22 || hour <= 4;
  }
  
  static isOver15Days(date1, date2) {
      return (new Date(date1).getTime() - new Date(date2).getTime()) > 15 * 24 * 60 * 60 * 1000;
  }

  static getCycleIdentifier(frequency, dateInput) {
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
    return `${year}-${String(date.getMonth() + 1).padStart(2, '0')}`; 
  }

  static isWithinDetectionWindow(date1, date2, windowMs = 2 * 60 * 60 * 1000) {
    return Math.abs(new Date(date1).getTime() - new Date(date2).getTime()) < windowMs;
  }
}
module.exports = DateCycleEngine;