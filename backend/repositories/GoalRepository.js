const SavingsGoal = require('../models/SavingsGoal');
const GoalAllocation = require('../models/GoalAllocation');

class GoalRepository {
  /**
   * Finds all savings goals for a user.
   * Expected to be called by GoalService.
   * 
   * @param {string} userId - The user's ObjectId
   * @returns {Promise<Array<Object>>} Array of SavingsGoal documents
   */
  async findGoalsByUser(userId) {
    throw new Error("Not implemented");
  }

  /**
   * Updates an existing savings goal by its ID.
   * Expected to be called by GoalService or CashflowEngine.
   * 
   * @param {string} id - The MongoDB ObjectId of the SavingsGoal
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} The updated SavingsGoal document
   */
  async updateGoal(id, updateData) {
    throw new Error("Not implemented");
  }

  /**
   * Creates a new savings goal.
   * Expected to be called by GoalService.
   * 
   * @param {Object} goalData - Data for the new SavingsGoal
   * @returns {Promise<Object>} The created SavingsGoal document
   */
  async createGoal(goalData) {
    throw new Error("Not implemented");
  }

  /**
   * Finds goal allocations matching a query.
   * Expected to be called by GoalService or CashflowEngine.
   * 
   * @param {Object} query - The filter criteria
   * @returns {Promise<Array<Object>>} Array of GoalAllocation documents
   */
  async findAllocations(query) {
    throw new Error("Not implemented");
  }

  /**
   * Creates a new goal allocation.
   * Expected to be called by CashflowEngine.
   * 
   * @param {Object} allocationData - Data for the new GoalAllocation
   * @returns {Promise<Object>} The created GoalAllocation document
   */
  async createAllocation(allocationData) {
    throw new Error("Not implemented");
  }

  /**
   * Deletes multiple goal allocations matching a query.
   * Expected to be called by GoalService.
   * 
   * @param {Object} query - The filter criteria
   * @returns {Promise<Object>} Mongoose DeleteResult object
   */
  async deleteAllocations(query) {
    throw new Error("Not implemented");
  }
}

module.exports = new GoalRepository();
