const IncomeSource = require('../models/IncomeSource');

class IncomeRepository {
  async findById(id, projection = null) {
    return await IncomeSource.findById(id, projection);
  }

  async findOne(filter, projection = null) {
    return await IncomeSource.findOne(filter, projection);
  }

  async findMany(filter, options = {}) {
    let query = IncomeSource.find(filter);
    if (options.sort) query = query.sort(options.sort);
    if (options.limit) query = query.limit(options.limit);
    if (options.skip) query = query.skip(options.skip);
    if (options.populate) query = query.populate(options.populate);
    return await query.exec();
  }

  async create(data) {
    return await IncomeSource.create(data);
  }

  async createMany(data) {
    return await IncomeSource.insertMany(data);
  }

  async updateOne(filter, update, options = {}) {
    return await IncomeSource.updateOne(filter, update, options);
  }

  async updateMany(filter, update, options = {}) {
    return await IncomeSource.updateMany(filter, update, options);
  }

  async deleteOne(filter) {
    return await IncomeSource.deleteOne(filter);
  }

  async deleteMany(filter) {
    return await IncomeSource.deleteMany(filter);
  }

  async findOneAndUpdate(filter, update, options = {}) {
    return await IncomeSource.findOneAndUpdate(filter, update, options);
  }

  async findByIdAndUpdate(id, update, options = {}) {
    return await IncomeSource.findByIdAndUpdate(id, update, options);
  }

  async findOneAndDelete(filter) {
    return await IncomeSource.findOneAndDelete(filter);
  }

  async findByIdAndDelete(id) {
    return await IncomeSource.findByIdAndDelete(id);
  }

  async aggregate(pipeline) {
    return await IncomeSource.aggregate(pipeline);
  }

  async count(filter) {
    return await IncomeSource.countDocuments(filter);
  }

  async exists(filter) {
    return await IncomeSource.exists(filter);
  }

  async distinct(field, filter) {
    return await IncomeSource.distinct(field, filter);
  }
}

module.exports = new IncomeRepository();
