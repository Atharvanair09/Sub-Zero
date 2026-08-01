require("dotenv").config();
const mongoose = require("mongoose");
const incomeRepository = require("./repositories/IncomeRepository");
const incomeCycleRepository = require("./repositories/IncomeCycleRepository");
const goalAllocationRepository = require("./repositories/GoalAllocationRepository");

async function clearData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const sourceRes = await incomeRepository.deleteMany({});
    const cycleRes = await incomeCycleRepository.deleteMany({});
    const allocRes = await goalAllocationRepository.deleteMany({});
    
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
