const SavingsGoal = require('../models/SavingsGoal');

class GoalRepository {
  async findById(id) {
    return await SavingsGoal.findById(id);
  }

  async findOne(filter, projection = {}) {
    return await SavingsGoal.findOne(filter, projection);
  }

  async findMany(filter, options = {}) {
    let query = SavingsGoal.find(filter);
    
    if (options.sort) query = query.sort(options.sort);
    if (options.limit) query = query.limit(options.limit);
    if (options.skip) query = query.skip(options.skip);
    if (options.populate) query = query.populate(options.populate);
    if (options.projection) query = query.select(options.projection);
    if (options.lean) query = query.lean();
    
    return await query.exec();
  }

  async create(data) {
    const goal = new SavingsGoal(data);
    return await goal.save();
  }

  async createMany(data) {
    return await SavingsGoal.insertMany(data);
  }

  async updateOne(filter, update, options = {}) {
    return await SavingsGoal.updateOne(filter, update, options);
  }

  async updateMany(filter, update, options = {}) {
    return await SavingsGoal.updateMany(filter, update, options);
  }

  async deleteOne(filter) {
    return await SavingsGoal.deleteOne(filter);
  }

  async deleteMany(filter) {
    return await SavingsGoal.deleteMany(filter);
  }

  async findOneAndUpdate(filter, update, options = {}) {
    return await SavingsGoal.findOneAndUpdate(filter, update, options);
  }

  async findByIdAndUpdate(id, update, options = {}) {
    return await SavingsGoal.findByIdAndUpdate(id, update, options);
  }

  async findOneAndDelete(filter) {
    return await SavingsGoal.findOneAndDelete(filter);
  }

  async findByIdAndDelete(id) {
    return await SavingsGoal.findByIdAndDelete(id);
  }

  async aggregate(pipeline) {
    return await SavingsGoal.aggregate(pipeline);
  }

  async count(filter) {
    return await SavingsGoal.countDocuments(filter);
  }

  async exists(filter) {
    return await SavingsGoal.exists(filter);
  }

  async distinct(field, filter = {}) {
    return await SavingsGoal.distinct(field, filter);
  }

  async bulkWrite(ops, options = {}) {
    return await SavingsGoal.bulkWrite(ops, options);
  }
}

module.exports = new GoalRepository();
