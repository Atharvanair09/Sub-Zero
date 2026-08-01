const GoalAllocation = require('../models/GoalAllocation');

class GoalAllocationRepository {
  async findById(id) {
    return await GoalAllocation.findById(id);
  }

  async findOne(filter, projection = {}) {
    return await GoalAllocation.findOne(filter, projection);
  }

  async findMany(filter, options = {}) {
    let query = GoalAllocation.find(filter);
    
    if (options.sort) query = query.sort(options.sort);
    if (options.limit) query = query.limit(options.limit);
    if (options.skip) query = query.skip(options.skip);
    if (options.populate) query = query.populate(options.populate);
    if (options.projection) query = query.select(options.projection);
    if (options.lean) query = query.lean();
    
    return await query.exec();
  }

  async create(data) {
    const allocation = new GoalAllocation(data);
    return await allocation.save();
  }

  async createMany(data) {
    return await GoalAllocation.insertMany(data);
  }

  async updateOne(filter, update, options = {}) {
    return await GoalAllocation.updateOne(filter, update, options);
  }

  async updateMany(filter, update, options = {}) {
    return await GoalAllocation.updateMany(filter, update, options);
  }

  async deleteOne(filter) {
    return await GoalAllocation.deleteOne(filter);
  }

  async deleteMany(filter) {
    return await GoalAllocation.deleteMany(filter);
  }

  async findOneAndUpdate(filter, update, options = {}) {
    return await GoalAllocation.findOneAndUpdate(filter, update, options);
  }

  async findByIdAndUpdate(id, update, options = {}) {
    return await GoalAllocation.findByIdAndUpdate(id, update, options);
  }

  async findOneAndDelete(filter) {
    return await GoalAllocation.findOneAndDelete(filter);
  }

  async findByIdAndDelete(id) {
    return await GoalAllocation.findByIdAndDelete(id);
  }

  async aggregate(pipeline) {
    return await GoalAllocation.aggregate(pipeline);
  }

  async count(filter) {
    return await GoalAllocation.countDocuments(filter);
  }

  async exists(filter) {
    return await GoalAllocation.exists(filter);
  }

  async distinct(field, filter = {}) {
    return await GoalAllocation.distinct(field, filter);
  }
}

module.exports = new GoalAllocationRepository();
