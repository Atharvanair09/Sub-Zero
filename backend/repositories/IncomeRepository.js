const IncomeSource = require('../models/IncomeSource');
const IncomeCycle = require('../models/IncomeCycle');

class IncomeRepository {
  /**
   * Finds all income sources for a user.
   * Expected to be called by IncomeService.
   * 
   * @param {string} userId - The user's ObjectId
   * @returns {Promise<Array<Object>>} Array of IncomeSource documents
   */
  async findSourcesByUser(userId) {
    throw new Error("Not implemented");
  }

  /**
   * Finds a single income source by its ID.
   * Expected to be called by IncomeService.
   * 
   * @param {string} id - The MongoDB ObjectId of the IncomeSource
   * @returns {Promise<Object|null>} IncomeSource document or null
   */
  async findSourceById(id) {
    throw new Error("Not implemented");
  }

  /**
   * Creates a new income source.
   * Expected to be called by IncomeService.
   * 
   * @param {Object} sourceData - Data for the new IncomeSource
   * @returns {Promise<Object>} The created IncomeSource document
   */
  async createSource(sourceData) {
    throw new Error("Not implemented");
  }

  /**
   * Updates an existing income source.
   * Expected to be called by IncomeService.
   * 
   * @param {string} id - The MongoDB ObjectId of the IncomeSource
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} The updated IncomeSource document
   */
  async updateSource(id, updateData) {
    throw new Error("Not implemented");
  }

  /**
   * Deletes a single income source by its ID.
   * Expected to be called by IncomeService.
   * 
   * @param {string} id - The MongoDB ObjectId of the IncomeSource
   * @returns {Promise<Object|null>} The deleted IncomeSource document
   */
  async deleteSource(id) {
    throw new Error("Not implemented");
  }

  /**
   * Deletes multiple income sources matching a query.
   * Expected to be called by IncomeService.
   * 
   * @param {Object} query - The filter criteria
   * @returns {Promise<Object>} Mongoose DeleteResult object
   */
  async deleteSources(query) {
    throw new Error("Not implemented");
  }

  /**
   * Finds a single income cycle based on a query.
   * Expected to be called by CashflowEngine or IncomeService.
   * 
   * @param {Object} query - The filter criteria
   * @returns {Promise<Object|null>} IncomeCycle document or null
   */
  async findCycle(query) {
    throw new Error("Not implemented");
  }

  /**
   * Creates a new income cycle.
   * Expected to be called by CashflowEngine.
   * 
   * @param {Object} cycleData - Data for the new IncomeCycle
   * @returns {Promise<Object>} The created IncomeCycle document
   */
  async createCycle(cycleData) {
    throw new Error("Not implemented");
  }

  /**
   * Deletes multiple income cycles matching a query.
   * Expected to be called by IncomeService.
   * 
   * @param {Object} query - The filter criteria
   * @returns {Promise<Object>} Mongoose DeleteResult object
   */
  async deleteCycles(query) {
    throw new Error("Not implemented");
  }
}

module.exports = new IncomeRepository();
