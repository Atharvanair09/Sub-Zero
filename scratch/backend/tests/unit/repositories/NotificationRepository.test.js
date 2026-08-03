const NotificationRepository = require('../../../repositories/NotificationRepository');
const Notification = require('../../../models/Notification');

jest.mock('../../../models/Notification');

describe('NotificationRepository (Unit)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should call Notification.findById', async () => {
      Notification.findById.mockResolvedValue({ _id: '1' });
      const res = await NotificationRepository.findById('1');
      expect(Notification.findById).toHaveBeenCalledWith('1', null);
      expect(res._id).toBe('1');
    });
  });
});
