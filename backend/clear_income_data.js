require("dotenv").config();
const mongoose = require("mongoose");
const IncomeSource = require("./models/IncomeSource");
const IncomeCycle = require("./models/IncomeCycle");
const GoalAllocation = require("./models/GoalAllocation");

async function clearData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const sourceRes = await IncomeSource.deleteMany({});
    const cycleRes = await IncomeCycle.deleteMany({});
    const allocRes = await GoalAllocation.deleteMany({});
    
    console.log(`Deleted ${sourceRes.deletedCount} Income Sources.`);
    console.log(`Deleted ${cycleRes.deletedCount} Income Cycles.`);
    console.log(`Deleted ${allocRes.deletedCount} Goal Allocations.`);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    process.exit(0);
  }
}
clearData();
