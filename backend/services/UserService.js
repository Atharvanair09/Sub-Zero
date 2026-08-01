const userRepository = require('../repositories/UserRepository');

class UserService {
  static async login(data) {
    const { name, email, googleId, picture } = data;
    const user = await userRepository.findOneAndUpdate(
      { email },
      { name, googleId, picture, lastLogin: new Date() },
      { upsert: true, new: true }
    );
    return user;
  }
}

module.exports = UserService;
