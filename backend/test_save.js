require("dotenv").config();
const mongoose = require("mongoose");
const IncomeSource = require("./models/IncomeSource");

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  try {
    const data = {
      id: "171239812938129",
      userId: "668d279af02e882ec8f85f52", // sample objectId
      name: "Test",
      expectedSender: "Test Sender",
      amount: 100,
      frequency: "monthly",
      status: "active"
    };
    const src = new IncomeSource(data);
    await src.save();
    console.log("Success! ID saved as:", src._id);
  } catch (e) {
    console.log("Error:", e.message);
  }
  process.exit(0);
}
test();
