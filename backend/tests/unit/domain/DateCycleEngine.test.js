const DateCycleEngine = require('../../../domain/engines/DateCycleEngine');

describe('DateCycleEngine', () => {
  describe('getDeduplicationWindow', () => {
    it('should return 2-hour window around the given time', () => {
      const date = new Date('2025-01-01T12:00:00.000Z');
      const window = DateCycleEngine.getDeduplicationWindow(date);
      expect(window.windowStart.toISOString()).toBe('2025-01-01T10:00:00.000Z');
      expect(window.windowEnd.toISOString()).toBe('2025-01-01T14:00:00.000Z');
    });
  });

  describe('getCycleDays', () => {
    it('should return 30 for monthly', () => {
      expect(DateCycleEngine.getCycleDays('monthly')).toBe(30);
    });
    it('should return 365 for non-monthly', () => {
      expect(DateCycleEngine.getCycleDays('yearly')).toBe(365);
    });
  });

  describe('getDaysAgo', () => {
    it('should return date n days ago', () => {
      const fromDate = new Date('2025-01-10T12:00:00.000Z');
      const daysAgo = DateCycleEngine.getDaysAgo(5, fromDate);
      expect(daysAgo.toISOString()).toBe('2025-01-05T12:00:00.000Z');
    });
  });

  describe('getStartOfMonth', () => {
    it('should return the first day of the month', () => {
      const date = new Date('2025-05-15T10:00:00.000Z');
      const startOfMonth = DateCycleEngine.getStartOfMonth(date);
      expect(startOfMonth.getFullYear()).toBe(2025);
      expect(startOfMonth.getMonth()).toBe(4); // 0-indexed month
      expect(startOfMonth.getDate()).toBe(1);
    });
  });

  describe('getDaysDifference', () => {
    it('should return positive difference in days', () => {
      expect(DateCycleEngine.getDaysDifference('2025-01-01', '2025-01-10')).toBe(9);
      expect(DateCycleEngine.getDaysDifference('2025-01-10', '2025-01-01')).toBe(9);
    });
  });

  describe('getDaysUntil', () => {
    it('should return days until target date', () => {
      const fromDate = new Date('2025-01-01');
      const targetDate = new Date('2025-01-10');
      expect(DateCycleEngine.getDaysUntil(targetDate, fromDate)).toBe(9);
    });
  });

  describe('isIncomeTimeMatch', () => {
    it('should match monthly', () => {
      expect(DateCycleEngine.isIncomeTimeMatch('monthly', 30)).toBe(true);
      expect(DateCycleEngine.isIncomeTimeMatch('monthly', 20)).toBe(false);
    });
    it('should match weekly', () => {
      expect(DateCycleEngine.isIncomeTimeMatch('weekly', 7)).toBe(true);
      expect(DateCycleEngine.isIncomeTimeMatch('weekly', 3)).toBe(false);
    });
    it('should match biweekly', () => {
      expect(DateCycleEngine.isIncomeTimeMatch('biweekly', 14)).toBe(true);
      expect(DateCycleEngine.isIncomeTimeMatch('biweekly', 10)).toBe(false);
    });
  });

  describe('getIncomeReferenceDate', () => {
    it('should use lastCycleDate if available', () => {
      const d = DateCycleEngine.getIncomeReferenceDate('2025-01-01', null, null, 'monthly');
      expect(d.toISOString().startsWith('2025-01-01')).toBe(true);
    });
    it('should calculate from nextExpectedDate for monthly', () => {
      const d = DateCycleEngine.getIncomeReferenceDate(null, '2025-02-01', null, 'monthly');
      expect(d.getMonth()).toBe(0); // Jan
    });
    it('should fallback to createdAt', () => {
      const d = DateCycleEngine.getIncomeReferenceDate(null, null, '2025-03-01', 'monthly');
      expect(d.toISOString().startsWith('2025-03-01')).toBe(true);
    });
  });

  describe('getCycleIdentifier', () => {
    it('should format monthly', () => {
      expect(DateCycleEngine.getCycleIdentifier('monthly', '2025-05-15')).toBe('2025-05');
    });
    it('should format yearly', () => {
      expect(DateCycleEngine.getCycleIdentifier('yearly', '2025-05-15')).toBe('2025');
    });
    it('should format weekly', () => {
      const w = DateCycleEngine.getCycleIdentifier('weekly', '2025-01-15');
      expect(w).toMatch(/^2025-W03$/);
    });
    it('should format biweekly', () => {
      const bw = DateCycleEngine.getCycleIdentifier('biweekly', '2025-01-15');
      expect(bw).toMatch(/^2025-BW02$/);
    });
    it('should fallback to monthly format for unknown', () => {
      expect(DateCycleEngine.getCycleIdentifier('unknown', '2025-05-15')).toBe('2025-05');
    });
  });
});
