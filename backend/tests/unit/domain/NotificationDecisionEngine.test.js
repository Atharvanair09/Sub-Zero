const NotificationDecisionEngine = require('../../../domain/engines/NotificationDecisionEngine');
const DateCycleEngine = require('../../../domain/engines/DateCycleEngine');

jest.mock('../../../domain/engines/DateCycleEngine');

describe('NotificationDecisionEngine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('shouldSendRenewalAlert', () => {
    it('should return true if days until billing is 1 or 2', () => {
      DateCycleEngine.getDaysUntil.mockReturnValue(2);
      expect(NotificationDecisionEngine.shouldSendRenewalAlert('2025-05-15')).toBe(true);

      DateCycleEngine.getDaysUntil.mockReturnValue(1);
      expect(NotificationDecisionEngine.shouldSendRenewalAlert('2025-05-15')).toBe(true);
    });

    it('should return false if days until billing is 0 or less', () => {
      DateCycleEngine.getDaysUntil.mockReturnValue(0);
      expect(NotificationDecisionEngine.shouldSendRenewalAlert('2025-05-15')).toBe(false);

      DateCycleEngine.getDaysUntil.mockReturnValue(-1);
      expect(NotificationDecisionEngine.shouldSendRenewalAlert('2025-05-15')).toBe(false);
    });

    it('should return false if days until billing > 2', () => {
      DateCycleEngine.getDaysUntil.mockReturnValue(3);
      expect(NotificationDecisionEngine.shouldSendRenewalAlert('2025-05-15')).toBe(false);
    });
  });

  describe('shouldSendUsageAlert', () => {
    it('should return true if no usage logs and over 15 days since creation', () => {
      DateCycleEngine.isOver15Days.mockReturnValue(true);
      expect(NotificationDecisionEngine.shouldSendUsageAlert([], '2025-04-01')).toBe(true);
      expect(NotificationDecisionEngine.shouldSendUsageAlert(null, '2025-04-01')).toBe(true);
    });

    it('should return false if there are usage logs', () => {
      DateCycleEngine.isOver15Days.mockReturnValue(true);
      expect(NotificationDecisionEngine.shouldSendUsageAlert(['2025-04-10'], '2025-04-01')).toBe(false);
    });

    it('should return false if not over 15 days', () => {
      DateCycleEngine.isOver15Days.mockReturnValue(false);
      expect(NotificationDecisionEngine.shouldSendUsageAlert([], '2025-04-01')).toBe(false);
    });
  });

  describe('shouldSendPriceIncreaseAlert', () => {
    it('should return true if current price > last price', () => {
      const history = [{ price: 100 }, { price: 120 }]; // last price is index 0: 100
      expect(NotificationDecisionEngine.shouldSendPriceIncreaseAlert(150, history)).toBe(true);
    });

    it('should return false if current price <= last price', () => {
      const history = [{ price: 100 }, { price: 150 }]; 
      expect(NotificationDecisionEngine.shouldSendPriceIncreaseAlert(150, history)).toBe(false);
    });

    it('should return false if history is too short', () => {
      expect(NotificationDecisionEngine.shouldSendPriceIncreaseAlert(150, [{ price: 150 }])).toBe(false);
      expect(NotificationDecisionEngine.shouldSendPriceIncreaseAlert(150, null)).toBe(false);
    });
  });

  describe('getLastPrice', () => {
    it('should return the last price before current', () => {
      const history = [{ price: 100 }, { price: 150 }]; // [n-2] is 100
      expect(NotificationDecisionEngine.getLastPrice(history)).toBe(100);
    });

    it('should return 0 if history is empty or short', () => {
      expect(NotificationDecisionEngine.getLastPrice([])).toBe(0);
      expect(NotificationDecisionEngine.getLastPrice([{ price: 100 }])).toBe(0);
      expect(NotificationDecisionEngine.getLastPrice(null)).toBe(0);
    });
  });
});
