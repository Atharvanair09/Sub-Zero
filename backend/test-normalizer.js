const { normalizeTitle } = require('./src/parser/normalizer');

const testCases = [
    "AMAZON SELLER SERVICES PRIVATE LIMITED",
    "SWIGGY LIMITED",
    "UBER INDIA SYSTEMS PRIVATE LIMITED",
    "ZOMATO MEDIA PRIVATE LIMITED",
    "NETFLIX INDIA",
    "UNKNOWN CAFE PVT LTD",
    "VPA amazonpay@ybl",
    "UPI ID zomato@hdfcbank"
];

for (const tc of testCases) {
    console.log(`Raw: "${tc}" -> Normalized: "${normalizeTitle(tc)}"`);
}
