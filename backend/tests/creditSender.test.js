const assert = require('assert');
const { extractCreditSender } = require('../src/parser/index');

function runTests() {
    console.log("Running Credit Sender Extraction Tests...\n");

    // Test 1: HDFC Format
    const hdfcEmail = `
Dear Customer,
Greetings from HDFC Bank!
We're writing to inform you that Rs.532.00 has been successfully credited to your HDFC Bank account ending in 2860.
Transaction Details:
a. Date: 26-06-26
b. Sender: VIKRAM RATHORE (VPA: vikramrathore23@okaxis)
c. UPI Reference No.: 438274823749
`;
    const res1 = extractCreditSender(hdfcEmail);
    assert.strictEqual(res1.displayTitle, 'Vikram Rathore', 'Test 1 Failed: displayTitle');
    assert.strictEqual(res1.rawTitle, 'vikramrathore23@okaxis', 'Test 1 Failed: rawTitle');
    assert.strictEqual(res1.transactionType, 'Credit', 'Test 1 Failed: transactionType');
    assert.strictEqual(res1.confidence, 0.99, 'Test 1 Failed: confidence');
    console.log("✅ Test 1 Passed: HDFC Format");

    // Test 2: Generic Inline VPA with Name
    const inlineEmail = `Your account is credited by Rs 100 from AMIT SHARMA (VPA: amit@upi) on 12th Aug.`;
    const res2 = extractCreditSender(inlineEmail);
    assert.strictEqual(res2.displayTitle, 'Amit Sharma', 'Test 2 Failed: displayTitle');
    assert.strictEqual(res2.rawTitle, 'amit@upi', 'Test 2 Failed: rawTitle');
    assert.strictEqual(res2.transactionType, 'Credit', 'Test 2 Failed: transactionType');
    assert.strictEqual(res2.confidence, 0.9, 'Test 2 Failed: confidence');
    console.log("✅ Test 2 Passed: Generic Inline VPA with Name");

    // Test 3: Generic Inline VPA Only
    const vpaOnlyEmail = `Credited Rs 50 from VPA testuser.123@icici to your acct.`;
    const res3 = extractCreditSender(vpaOnlyEmail);
    assert.strictEqual(res3.displayTitle, 'Testuser 123', 'Test 3 Failed: displayTitle');
    assert.strictEqual(res3.rawTitle, 'testuser.123@icici', 'Test 3 Failed: rawTitle');
    assert.strictEqual(res3.transactionType, 'Credit', 'Test 3 Failed: transactionType');
    assert.strictEqual(res3.confidence, 0.8, 'Test 3 Failed: confidence');
    console.log("✅ Test 3 Passed: Generic Inline VPA Only");

    // Test 4: No Match (Fallback)
    const fallbackEmail = `Your account balance is Rs 500.`;
    const res4 = extractCreditSender(fallbackEmail);
    assert.strictEqual(res4.displayTitle, 'Unknown Sender', 'Test 4 Failed: displayTitle');
    assert.strictEqual(res4.rawTitle, null, 'Test 4 Failed: rawTitle');
    assert.strictEqual(res4.transactionType, 'Credit', 'Test 4 Failed: transactionType');
    assert.strictEqual(res4.confidence, 0.0, 'Test 4 Failed: confidence');
    console.log("✅ Test 4 Passed: Fallback");

    console.log("\nAll tests passed successfully! 🎉");
}

runTests();
