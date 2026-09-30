const axios = require('axios');
async function run() {
  try {
    const token = await axios.post('http://localhost:8080/realms/bankcore/protocol/openid-connect/token', new URLSearchParams({client_id: 'bankcore-web', grant_type: 'password', username: 'customer@bankcore.local', password: 'customer'}).toString(), {headers: {'Content-Type': 'application/x-www-form-urlencoded'}}).then(res => res.data.access_token);
    
    // get my account
    const acc = await axios.get('http://localhost:3100/api/v1/accounts', {headers: {Authorization: `Bearer ${token}`}});
    const accountList = acc.data.data || acc.data;
    const fromId = accountList.find(a => a.balance > 0).id;
    
    // create transaction to customer2 (which is user 11111111-1111-4111-a111-111111111115)
    // customer2's account is 22222222-2222-4222-a222-222222222223
    const txn = await axios.post('http://localhost:3100/api/v1/transactions', {fromAccountId: fromId, toAccountId: '22222222-2222-4222-a222-222222222223', amount: 15, idempotencyKey: Date.now().toString()}, {headers: {Authorization: `Bearer ${token}`}});
    console.log("Transaction created:", txn.data.data?.id || txn.data.id);
    
    const loan = await axios.post('http://localhost:3100/api/v1/loans', {amount: 2500, termMonths: 12, purpose: 'Gate Test'}, {headers: {Authorization: `Bearer ${token}`}});
    console.log("Loan created:", loan.data.data?.id || loan.data.id);
  } catch (e) {
    if (e.response) {
      console.log(`HTTP ${e.response.status}:`, e.response.data);
    } else {
      console.log(e.message);
    }
  }
}
run();
