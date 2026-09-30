const token = process.argv[2];
const payload = token.split('.')[1];
console.log(Buffer.from(payload, "base64").toString());
