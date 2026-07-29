const Subscription = require('../models/Subscription');

class SubscriptionRepository {
  /**
   * Finds all subscriptions belonging to a user.
   * Expected to be called by SubscriptionService.
   * 
   * @param {string} userId - The user's ObjectId
   * @returns {Promise<Array<Object>>} Array of Subscription documents
   */
  async findByUser(userId) {
    throw new Error("Not implemented");
  }

  /**
   * Finds a single subscription by its MongoDB ObjectId.
   * Expected to be called by SubscriptionService.
   * 
   * @param {string} id - The MongoDB ObjectId
   * @returns {Promise<Object|null>} Subscription document or null if not found
   */
  async findById(id) {
    throw new Error("Not implemented");
  }

  /**
   * Finds a subscription by its external provider ID.
   * Expected to be called by SubscriptionService or DeduplicationEngine.
   * 
   * @param {string} externalId - The external provider's subscription ID
   * @param {string} userId - The user's ObjectId
   * @returns {Promise<Object|null>} Subscription document or null if not found
   */
  async findByExternalId(externalId, userId) {
    throw new Error("Not implemented");
  }

  /**
   * Creates a new subscription.
   * Expected to be called by SubscriptionService.
   * 
   * @param {Object} subscriptionData - Data for the new subscription
   * @returns {Promise<Object>} The created Subscription document
   */
  async create(subscriptionData) {
    throw new Error("Not implemented");
  }

  /**
   * Updates a single subscription by its ID.
   * Expected to be called by SubscriptionService.
   * 
   * @param {string} id - The MongoDB ObjectId
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} The updated Subscription document
   */
  async update(id, updateData) {
    throw new Error("Not implemented");
  }

  /**
   * Updates multiple subscriptions matching a query.
   * Expected to be called by SubscriptionService.
   * 
   * @param {Object} query - The filter criteria
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Mongoose UpdateResult object
   */
  async updateMany(query, updateData) {
    throw new Error("Not implemented");
  }

  /**
   * Deletes a subscription by its ID.
   * Expected to be called by SubscriptionService.
   * 
   * @param {string} id - The MongoDB ObjectId
   * @returns {Promise<Object|null>} The deleted Subscription document
   */
  async delete(id) {
    throw new Error("Not implemented");
  }
}

module.exports = new SubscriptionRepository();
