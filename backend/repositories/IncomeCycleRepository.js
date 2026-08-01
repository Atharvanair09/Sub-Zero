const IncomeCycle = require('../models/IncomeCycle');

class IncomeCycleRepository {
  async findById(id) {
    return await IncomeCycle.findById(id);
  }

  async findOne(filter, projection = null, options = {}) {
    return await IncomeCycle.findOne(filter, projection, options);
  }

  async findMany(filter, options = {}) {
    let query = IncomeCycle.find(filter);
    
    if (options.projection) query = query.select(options.projection);
    if (options.sort) query = query.sort(options.sort);
    if (options.limit) query = query.limit(options.limit);
    if (options.skip) query = query.skip(options.skip);
    if (options.populate) query = query.populate(options.populate);
    if (options.collation) query = query.collation(options.collation);
    if (options.lean) query = query.lean();

    return await query;
  }

  async create(data) {
    return await IncomeCycle.create(data);
  }

  async createMany(data) {
    return await IncomeCycle.insertMany(data);
  }

  async updateOne(filter, update, options = {}) {
    return await IncomeCycle.updateOne(filter, update, options);
  }

  async updateMany(filter, update, options = {}) {
    return await IncomeCycle.updateMany(filter, update, options);
  }

  async deleteOne(filter) {
    return await IncomeCycle.deleteOne(filter);
  }

  async deleteMany(filter) {
    return await IncomeCycle.deleteMany(filter);
  }

  async findOneAndUpdate(filter, update, options = {}) {
    return await IncomeCycle.findOneAndUpdate(filter, update, options);
  }

  async findByIdAndUpdate(id, update, options = {}) {
    return await IncomeCycle.findByIdAndUpdate(id, update, options);
  }

  async findOneAndDelete(filter) {
    return await IncomeCycle.findOneAndDelete(filter);
  }

  async findByIdAndDelete(id) {
    return await IncomeCycle.findByIdAndDelete(id);
  }

  async aggregate(pipeline) {
    return await IncomeCycle.aggregate(pipeline);
  }

  async count(filter) {
    return await IncomeCycle.countDocuments(filter);
  }

  async exists(filter) {
    return await IncomeCycle.exists(filter);
  }

  async distinct(field, filter = {}) {
    return await IncomeCycle.distinct(field, filter);
  }
}

module.exports = new IncomeCycleRepository();
