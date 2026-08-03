const SubscriptionRepository = require('../../../repositories/SubscriptionRepository');
const Subscription = require('../../../models/Subscription');

jest.mock('../../../models/Subscription');

describe('SubscriptionRepository (Unit)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should call Subscription.findById', async () => {
      Subscription.findById.mockResolvedValue({ _id: '1' });
      const res = await SubscriptionRepository.findById('1');
      expect(Subscription.findById).toHaveBeenCalledWith('1', null);
      expect(res._id).toBe('1');
    });
  });
});
