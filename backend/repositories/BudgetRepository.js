const CategoryBudget = require('../models/CategoryBudget');
const BudgetUsage = require('../models/BudgetUsage');

class BudgetRepository {
  /**
   * Finds all category budgets for a user.
   * Expected to be called by BudgetService.
   * 
   * @param {string} userId - The user's ObjectId
   * @returns {Promise<Array<Object>>} Array of CategoryBudget documents
   */
  async findBudgetsByUser(userId) {
    throw new Error("Not implemented");
  }

  /**
   * Updates an existing category budget by its ID.
   * Expected to be called by BudgetService.
   * 
   * @param {string} id - The MongoDB ObjectId of the CategoryBudget
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} The updated CategoryBudget document
   */
  async updateBudget(id, updateData) {
    throw new Error("Not implemented");
  }

  /**
   * Finds a single category budget matching a query and updates it.
   * Expected to be called by CashflowEngine.
   * 
   * @param {Object} query - The filter criteria
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} The updated CategoryBudget document
   */
  async findAndUpdateBudget(query, updateData) {
    throw new Error("Not implemented");
  }

  /**
   * Finds a single category budget based on a query.
   * Expected to be called by BudgetService or CashflowEngine.
   * 
   * @param {Object} query - The filter criteria
   * @returns {Promise<Object|null>} CategoryBudget document or null
   */
  async findBudget(query) {
    throw new Error("Not implemented");
  }
}

module.exports = new BudgetRepository();
