const Notification = require('../models/Notification');

class NotificationRepository {
  async findById(id) {
    return await Notification.findById(id);
  }

  async findOne(filter, projection = null) {
    return await Notification.findOne(filter, projection);
  }

  async findMany(filter, options = {}) {
    const query = Notification.find(filter);
    if (options.projection) query.select(options.projection);
    if (options.sort) query.sort(options.sort);
    if (options.limit) query.limit(options.limit);
    if (options.skip) query.skip(options.skip);
    if (options.lean) query.lean();
    return await query.exec();
  }

  async create(data) {
    const notification = new Notification(data);
    return await notification.save();
  }

  async createMany(data) {
    return await Notification.insertMany(data);
  }

  async updateOne(filter, update, options = {}) {
    return await Notification.updateOne(filter, update, options);
  }

  async updateMany(filter, update, options = {}) {
    return await Notification.updateMany(filter, update, options);
  }

  async deleteOne(filter) {
    return await Notification.deleteOne(filter);
  }

  async deleteMany(filter) {
    return await Notification.deleteMany(filter);
  }

  async findOneAndUpdate(filter, update, options = {}) {
    return await Notification.findOneAndUpdate(filter, update, options);
  }

  async findByIdAndUpdate(id, update, options = {}) {
    return await Notification.findByIdAndUpdate(id, update, options);
  }

  async findOneAndDelete(filter) {
    return await Notification.findOneAndDelete(filter);
  }

  async findByIdAndDelete(id) {
    return await Notification.findByIdAndDelete(id);
  }

  async aggregate(pipeline) {
    return await Notification.aggregate(pipeline);
  }

  async count(filter) {
    return await Notification.countDocuments(filter);
  }

  async exists(filter) {
    return await Notification.exists(filter);
  }

  async distinct(field, filter = {}) {
    return await Notification.distinct(field, filter);
  }
}

module.exports = new NotificationRepository();
