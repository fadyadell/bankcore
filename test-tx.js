const axios = require('axios');
async function test() {
  try {
    const res = await axios.post('http://localhost:8080/realms/bankcore/protocol/openid-connect/token', new URLSearchParams({
        client_id: 'bankcore-web',
        grant_type: 'password',
        username: 'customer@bankcore.local',
        password: 'customer'
    }).toString(), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
    
    const token = res.data.access_token;
    
    const idemKey = "idem-" + Date.now();
    const reqData = {
      fromAccountId: '22222222-2222-4222-a222-222222222222',
      toAccountId: '22222222-2222-4222-a222-222222222222',
      amount: 1
    };

    const txRes1 = await axios.post('http://localhost:3100/api/v1/transactions', reqData, { headers: { Authorization: `Bearer ${token}`, 'Idempotency-Key': idemKey } });
    console.log("SUCCESS 1:", txRes1.data);
    
    const txRes2 = await axios.post('http://localhost:3100/api/v1/transactions', reqData, { headers: { Authorization: `Bearer ${token}`, 'Idempotency-Key': idemKey } });
    console.log("SUCCESS 2:", txRes2.data);
  } catch (err) {
    console.log("FAIL:", JSON.stringify(err.response?.data, null, 2));
  }
}
test();
