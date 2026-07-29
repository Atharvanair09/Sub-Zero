const CategoryBudget = require('../models/CategoryBudget');
const BudgetUsage = require('../models/BudgetUsage');

class BudgetRepository {
  async findById(id) {
    return await CategoryBudget.findById(id);
  }

  async findOne(filter, projection = {}) {
    return await CategoryBudget.findOne(filter, projection);
  }

  async findMany(filter, options = {}) {
    let query = CategoryBudget.find(filter);
    
    if (options.sort) query = query.sort(options.sort);
    if (options.limit) query = query.limit(options.limit);
    if (options.skip) query = query.skip(options.skip);
    if (options.populate) query = query.populate(options.populate);
    if (options.projection) query = query.select(options.projection);
    if (options.lean) query = query.lean();
    
    return await query.exec();
  }

  async create(data) {
    const budget = new CategoryBudget(data);
    return await budget.save();
  }

  async createMany(data) {
    return await CategoryBudget.insertMany(data);
  }

  async updateOne(filter, update, options = {}) {
    return await CategoryBudget.updateOne(filter, update, options);
  }

  async updateMany(filter, update, options = {}) {
    return await CategoryBudget.updateMany(filter, update, options);
  }

  async deleteOne(filter) {
    return await CategoryBudget.deleteOne(filter);
  }

  async deleteMany(filter) {
    return await CategoryBudget.deleteMany(filter);
  }

  async findOneAndUpdate(filter, update, options = {}) {
    return await CategoryBudget.findOneAndUpdate(filter, update, options);
  }

  async findByIdAndUpdate(id, update, options = {}) {
    return await CategoryBudget.findByIdAndUpdate(id, update, options);
  }

  async findOneAndDelete(filter) {
    return await CategoryBudget.findOneAndDelete(filter);
  }

  async findByIdAndDelete(id) {
    return await CategoryBudget.findByIdAndDelete(id);
  }

  async aggregate(pipeline) {
    return await CategoryBudget.aggregate(pipeline);
  }

  async count(filter) {
    return await CategoryBudget.countDocuments(filter);
  }

  async exists(filter) {
    return await CategoryBudget.exists(filter);
  }

  async distinct(field, filter = {}) {
    return await CategoryBudget.distinct(field, filter);
  }
}

module.exports = new BudgetRepository();
