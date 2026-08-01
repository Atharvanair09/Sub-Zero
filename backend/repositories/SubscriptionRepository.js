const Subscription = require('../models/Subscription');

class SubscriptionRepository {
  async findById(id, projection = null) {
    return await Subscription.findById(id, projection);
  }

  async findOne(filter, projection = null) {
    return await Subscription.findOne(filter, projection);
  }

  async findMany(filter, options = {}) {
    let query = Subscription.find(filter);
    
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
    return await Subscription.aggregate(pipeline);
  }

  async count(filter) {
    return await Subscription.countDocuments(filter);
  }

  async exists(filter) {
    return await Subscription.exists(filter);
  }

  async distinct(field, filter = {}) {
    return await Subscription.distinct(field, filter);
  }

  async create(data) {
    return await Subscription.create(data);
  }

  async createMany(data) {
    return await Subscription.insertMany(data);
  }

  async updateOne(filter, update, options = {}) {
    return await Subscription.updateOne(filter, update, options);
  }

  async updateMany(filter, update, options = {}) {
    return await Subscription.updateMany(filter, update, options);
  }

  async deleteOne(filter) {
    return await Subscription.deleteOne(filter);
  }

  async deleteMany(filter) {
    return await Subscription.deleteMany(filter);
  }

  async findOneAndUpdate(filter, update, options = {}) {
    return await Subscription.findOneAndUpdate(filter, update, options);
  }

  async findByIdAndUpdate(id, update, options = {}) {
    return await Subscription.findByIdAndUpdate(id, update, options);
  }

  async findOneAndDelete(filter) {
    return await Subscription.findOneAndDelete(filter);
  }

  async findByIdAndDelete(id) {
    return await Subscription.findByIdAndDelete(id);
  }

  async bulkWrite(operations) {
    return await Subscription.bulkWrite(operations);
  }
}

module.exports = new SubscriptionRepository();
