const Transaction = require('../models/Transaction');

class TransactionRepository {
  /**
   * Finds transactions belonging to a specific user, optionally applying filters.
   * Expected to be called by TransactionService.
   * 
   * @param {string} userId - The user's ObjectId
   * @param {Object} [query] - Additional query filters (e.g., date ranges)
   * @returns {Promise<Array<Object>>} Array of Transaction documents
   */
  async findByUser(userId, query = {}) {
    throw new Error("Not implemented");
  }

  /**
   * Finds a single transaction by its MongoDB ObjectId.
   * Expected to be called by TransactionService.
   * 
   * @param {string} id - The MongoDB ObjectId
   * @returns {Promise<Object|null>} Transaction document or null if not found
   */
  async findById(id) {
    throw new Error("Not implemented");
  }

  /**
   * Finds a transaction by its external provider ID (e.g., from Plaid or Gmail).
   * Expected to be called by TransactionService or DeduplicationEngine.
   * 
   * @param {string} externalId - The external provider's transaction ID
   * @param {string} userId - The user's ObjectId
   * @returns {Promise<Object|null>} Transaction document or null if not found
   */
  async findByExternalId(externalId, userId) {
    throw new Error("Not implemented");
  }

  /**
   * Creates a new transaction.
   * Expected to be called by TransactionService.
   * 
   * @param {Object} transactionData - Data for the new transaction
   * @returns {Promise<Object>} The created Transaction document
   */
  async create(transactionData) {
    throw new Error("Not implemented");
  }

  /**
   * Updates multiple transactions matching a query.
   * Expected to be called by TransactionService.
   * 
   * @param {Object} query - The filter criteria
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Mongoose UpdateResult object
   */
  async updateMany(query, updateData) {
    throw new Error("Not implemented");
  }

  /**
   * Deletes multiple transactions matching a query.
   * Expected to be called by TransactionService or DeduplicationEngine.
   * 
   * @param {Object} query - The filter criteria
   * @returns {Promise<Object>} Mongoose DeleteResult object
   */
  async deleteMany(query) {
    throw new Error("Not implemented");
  }
}

module.exports = new TransactionRepository();
