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
}

module.exports = new TransactionRepository();

