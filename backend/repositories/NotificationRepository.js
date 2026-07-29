const Notification = require('../models/Notification');

class NotificationRepository {
  /**
   * Finds notifications belonging to a specific user.
   * Expected to be called by NotificationService.
   * 
   * @param {string} userId - The user's ObjectId
   * @returns {Promise<Array<Object>>} Array of Notification documents
   */
  async findByUser(userId) {
    throw new Error("Not implemented");
  }

  /**
   * Creates a new notification.
   * Expected to be called by NotificationService.
   * 
   * @param {Object} notificationData - Data for the new notification
   * @returns {Promise<Object>} The created Notification document
   */
  async create(notificationData) {
    throw new Error("Not implemented");
  }

  /**
   * Updates a single notification by its MongoDB ObjectId.
   * Expected to be called by NotificationService.
   * 
   * @param {string} id - The MongoDB ObjectId
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} The updated Notification document
   */
  async update(id, updateData) {
    throw new Error("Not implemented");
  }

  /**
   * Finds one notification matching a query and updates it.
   * Expected to be called by NotificationService.
   * 
   * @param {Object} query - The filter criteria
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} The updated Notification document
   */
  async updateByQuery(query, updateData) {
    throw new Error("Not implemented");
  }

  /**
   * Updates multiple notifications matching a query.
   * Expected to be called by NotificationService.
   * 
   * @param {Object} query - The filter criteria
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Mongoose UpdateResult object
   */
  async updateMany(query, updateData) {
    throw new Error("Not implemented");
  }

  /**
   * Deletes multiple notifications matching a query.
   * Expected to be called by NotificationService.
   * 
   * @param {Object} query - The filter criteria
   * @returns {Promise<Object>} Mongoose DeleteResult object
   */
  async deleteMany(query) {
    throw new Error("Not implemented");
  }
}

module.exports = new NotificationRepository();
