const mongoose = require('mongoose');
const { connect, closeDatabase, clearDatabase } = require('./setup-mongo');
const UserRepository = require('../../repositories/UserRepository');

describe('UserRepository (Integration)', () => {
  beforeAll(async () => {
    await connect();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  it('should create and find a user', async () => {
    const userData = { email: 'test@example.com', name: 'Test User' };
    const createdUser = await UserRepository.create(userData);
    
    expect(createdUser._id).toBeDefined();
    expect(createdUser.email).toBe(userData.email);

    const foundUser = await UserRepository.findById(createdUser._id);
    expect(foundUser.email).toBe(userData.email);
  });

  it('should update a user', async () => {
    const user = await UserRepository.create({ email: 'old@example.com', name: 'Old' });
    
    await UserRepository.updateById(user._id, { email: 'new@example.com' });
    const updatedUser = await UserRepository.findById(user._id);
    
    expect(updatedUser.email).toBe('new@example.com');
  });

  it('should delete a user', async () => {
    const user = await UserRepository.create({ email: 'delete@example.com', name: 'Delete' });
    
    await UserRepository.deleteById(user._id);
    const deletedUser = await UserRepository.findById(user._id);
    
    expect(deletedUser).toBeNull();
  });

  it('should find many users and count', async () => {
    await UserRepository.create({ email: 'user1@example.com', name: 'User 1' });
    await UserRepository.create({ email: 'user2@example.com', name: 'User 2' });

    const users = await UserRepository.findMany({});
    expect(users).toHaveLength(2);

    const count = await UserRepository.count({});
    expect(count).toBe(2);
  });
});
