const DateCycleEngine = require('./DateCycleEngine');

class IncomeCycleEngine {
  static getCycleId(frequency, date) {
    return DateCycleEngine.getCycleIdentifier(frequency, date);
  }
}
module.exports = IncomeCycleEngine;