const Transaction = require('../models/Transaction');

class TransactionRepository {
  async findById(id, projection = null) {
    return await Transaction.findById(id, projection);
  }

  async findOne(filter, projection = null) {
    return await Transaction.findOne(filter, projection);
  }

  async findMany(filter, options = {}) {
    let query = Transaction.find(filter);
    
    if (options.projection) query = query.select(options.projection);
    if (options.sort) query = query.sort(options.sort);
    if (options.limit) query = query.limit(options.limit);
    if (options.skip) query = query.skip(options.skip);
    if (options.populate) query = query.populate(options.populate);
    if (options.collation) query = query.collation(options.collation);
    if (options.lean) query = query.lean();

    return await query;
  }

  async aggregate(pipeline) {
    return await Transaction.aggregate(pipeline);
  }

  async count(filter) {
    return await Transaction.countDocuments(filter);
  }

  async exists(filter) {
    return await Transaction.exists(filter);
  }

  async distinct(field, filter = {}) {
    return await Transaction.distinct(field, filter);
  }

  async create(data) {
    return await Transaction.create(data);
  }

  async createMany(data) {
    return await Transaction.insertMany(data);
  }

  async updateOne(filter, update, options = {}) {
    return await Transaction.updateOne(filter, update, options);
  }

  async updateMany(filter, update, options = {}) {
    return await Transaction.updateMany(filter, update, options);
  }

  async deleteOne(filter) {
    return await Transaction.deleteOne(filter);
  }

  async deleteMany(filter) {
    return await Transaction.deleteMany(filter);
  }

  async findOneAndUpdate(filter, update, options = {}) {
    return await Transaction.findOneAndUpdate(filter, update, options);
  }

  async findByIdAndUpdate(id, update, options = {}) {
    return await Transaction.findByIdAndUpdate(id, update, options);
  }

  async findOneAndDelete(filter) {
    return await Transaction.findOneAndDelete(filter);
  }

  async findByIdAndDelete(id) {
    return await Transaction.findByIdAndDelete(id);
  }

  async bulkWrite(operations) {
    return await Transaction.bulkWrite(operations);
  }


}

module.exports = new TransactionRepository();

