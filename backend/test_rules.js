const { extractCreditSender } = require('./src/parser/index');
const emails = [
    `Greetings from HDFC Bank! Rs.532.00 credited. Sender: VIKRAM RATHORE (VPA: vikramrathore23@okaxis) c. UPI Ref: 123`,
    `Your account is credited by Rs 100 from AMIT SHARMA (VPA: amit@upi) on 12th Aug.`,
    `Credited Rs 50 from VPA testuser.123@icici to your acct.`,
    `Greetings from HDFC Bank! Rs 500 has been credited.`,
    `Received from: JOHN DOE on 12th Aug`,
    `Transferred by: JANE SMITH. Rs 100`,
    `Beneficiary: ALICE WONDERLAND, Rs 200`,
    `Salary credited by TECH CORP PVT LTD`,
    `Refund from AMAZON INDIA`,
    `Interest credited by HDFC Bank`
];
emails.forEach(e => console.log(extractCreditSender(e)));
