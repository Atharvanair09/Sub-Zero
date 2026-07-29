require("dotenv").config();
const mongoose = require("mongoose");
const incomeRepository = require("./repositories/IncomeRepository");

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected DB name:", mongoose.connection.name);
    console.log("Host:", mongoose.connection.host);
    const sources = await incomeRepository.findMany({});
    console.log("Income Sources count:", sources.length);
    console.log(sources);
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
check();
