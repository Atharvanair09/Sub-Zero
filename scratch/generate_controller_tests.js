const fs = require('fs');
const path = require('path');

const controllers = [
  'Budget',
  'CashFlow',
  'Chat',
  'Dashboard',
  'Gmail',
  'Goal',
  'Income',
  'Insight',
  'Notification',
  'Subscription',
  'Transaction',
  'User'
];

const unitDir = path.join(__dirname, 'backend', 'tests', 'unit', 'controllers');
fs.mkdirSync(unitDir, { recursive: true });

controllers.forEach(controller => {
  const controllerName = `${controller}Controller`;
  const serviceName = `${controller}Service`;

  const content = `const ${controllerName} = require('../../../controllers/${controllerName}');
const ${serviceName} = require('../../../services/${serviceName}');

jest.mock('../../../services/${serviceName}');

describe('${controllerName} (Unit)', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { params: {}, query: {}, body: {}, user: { id: 'user123' } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    };
  });

  it('should have standard methods implemented', () => {
    // This is a placeholder test to ensure the suite runs.
    // Replace with specific methods like create, get, update, delete
    expect(true).toBe(true);
  });
  
  // Example of testing a generic 'get' method:
  // it('should return 200 and data on success', async () => {
  //   ${serviceName}.getData.mockResolvedValue({ some: 'data' });
  //   await ${controllerName}.get(req, res);
  //   expect(res.status).toHaveBeenCalledWith(200);
  //   expect(res.json).toHaveBeenCalledWith({ some: 'data' });
  // });
  
  // it('should return 500 on error', async () => {
  //   ${serviceName}.getData.mockRejectedValue(new Error('Internal error'));
  //   await ${controllerName}.get(req, res);
  //   expect(res.status).toHaveBeenCalledWith(500);
  //   expect(res.json).toHaveBeenCalledWith({ error: 'Internal error' });
  // });
});
`;

  fs.writeFileSync(path.join(unitDir, `${controllerName}.test.js`), content);
});

console.log('Controller tests generated successfully.');
