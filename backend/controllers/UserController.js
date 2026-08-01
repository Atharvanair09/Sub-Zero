const userService = require('../services/UserService');

class UserController {
  static async login(req, res) {
    try {
      const user = await userService.login(req.body);
      res.json({ success: true, user });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = UserController;
