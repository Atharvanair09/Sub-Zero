const GmailSyncRepository = require('../../../repositories/GmailSyncRepository');
const GmailSync = require('../../../models/GmailSync');

jest.mock('../../../models/GmailSync');

describe('GmailSyncRepository (Unit)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should call GmailSync.findById', async () => {
      GmailSync.findById.mockResolvedValue({ _id: '1' });
      const res = await GmailSyncRepository.findById('1');
      expect(GmailSync.findById).toHaveBeenCalledWith('1', null);
      expect(res._id).toBe('1');
    });
  });
});
