const User = require('../models/User');

class GmailSyncRepository {
  /**
   * Finds a single sync state (User) matching the given filter.
   * 
   * @param {Object} filter - The query filter
   * @returns {Promise<Object|null>} User document or null if not found
   */
  async findOne(filter) {
    return await User.findOne(filter);
  }

  /**
   * Finds a single sync state (User) by their MongoDB ObjectId.
   * 
   * @param {string} id - The MongoDB ObjectId
   * @param {string} [select] - Optional fields to select
   * @returns {Promise<Object|null>} User document or null if not found
   */
  async findById(id, select) {
    let query = User.findById(id);
    if (select) {
      query = query.select(select);
    }
    return await query;
  }

  /**
   * Finds multiple sync states matching the given filter.
   * 
   * @param {Object} filter - The query filter
   * @returns {Promise<Array<Object>>} Array of User documents
   */
  async findMany(filter) {
    return await User.find(filter);
  }

  /**
   * Creates a new sync state.
   * 
   * @param {Object} data - Data for the new sync state
   * @returns {Promise<Object>} The created User document
   */
  async create(data) {
    return await User.create(data);
  }

  /**
   * Updates a single sync state matching the filter.
   * 
   * @param {Object} filter - The query filter
   * @param {Object} data - Data to update
   * @param {Object} [options] - Additional options (e.g. { new: true })
   * @returns {Promise<Object|null>} The updated User document
   */
  async updateOne(filter, data, options = {}) {
    return await User.findOneAndUpdate(filter, data, options);
  }

  /**
   * Updates a single sync state by their MongoDB ObjectId.
   * 
   * @param {string} id - The MongoDB ObjectId
   * @param {Object} data - Data to update
   * @param {Object} [options] - Additional options (e.g. { new: true })
   * @returns {Promise<Object|null>} The updated User document
   */
  async updateById(id, data, options = {}) {
    return await User.findByIdAndUpdate(id, data, options);
  }

  /**
   * Deletes a single sync state matching the filter.
   * 
   * @param {Object} filter - The query filter
   * @returns {Promise<Object|null>} The deleted User document
   */
  async deleteOne(filter) {
    return await User.findOneAndDelete(filter);
  }

  /**
   * Deletes a single sync state by their MongoDB ObjectId.
   * 
   * @param {string} id - The MongoDB ObjectId
   * @returns {Promise<Object|null>} The deleted User document
   */
  async deleteById(id) {
    return await User.findByIdAndDelete(id);
  }

  /**
   * Checks if any sync state matches the filter.
   * 
   * @param {Object} filter - The query filter
   * @returns {Promise<Object|null>} Object containing the _id if found, otherwise null
   */
  async exists(filter) {
    return await User.exists(filter);
  }
}

module.exports = new GmailSyncRepository();
