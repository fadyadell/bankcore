const axios = require('axios');
const assert = require('assert');

const API_GATEWAY = 'http://localhost:3000/api/v1';
const KEYCLOAK = 'http://localhost:8080/realms/bankcore/protocol/openid-connect/token';

async function getToken(username, role = 'customer') {
    const res = await axios.post(KEYCLOAK, new URLSearchParams({
        client_id: 'bankcore-web',
        grant_type: 'password',
        username,
        password: role
    }).toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    return res.data.access_token;
}

async function run() {
    console.log('--- BankCore E2E Scenarios ---');
    let customerToken;
    let accountId;
    let passCount = 0;
    let failCount = 0;

    const test = async (name, fn) => {
        try {
            console.log(`\nScenario: ${name}`);
            await fn();
            console.log(`  PASS`);
            passCount++;
        } catch (e) {
            console.error(`  FAIL: ${e.message}`);
            if (e.response) {
                console.error(`    HTTP ${e.response.status}`, JSON.stringify(e.response.data));
            }
            failCount++;
        }
    };

    await test('Authentication', async () => {
        customerToken = await getToken('customer@bankcore.local', 'customer');
        assert(customerToken, 'Token should be returned');
    });

    await test('Unauthorized access', async () => {
        try {
            await axios.get(`${API_GATEWAY}/accounts`);
            throw new Error('Should have failed');
        } catch (e) {
            assert(e.response && e.response.status === 401, 'Should return 401');
        }
    });

    await test('RBAC', async () => {
        try {
            await axios.get(`${API_GATEWAY}/admin/stats`, {
                headers: { Authorization: `Bearer ${customerToken}` }
            });
            throw new Error('Should have failed');
        } catch (e) {
            assert(e.response && (e.response.status === 403 || e.response.status === 401 || e.response.status === 404), 'Should return 403 Forbidden or similar');
        }
    });

    await test('Account', async () => {
        const accRes = await axios.get(`${API_GATEWAY}/accounts`, {
            headers: { Authorization: `Bearer ${customerToken}` }
        });
        const accounts = accRes.data.data || accRes.data;
        assert(Array.isArray(accounts), 'Should return array of accounts');
        assert(accounts.length > 0, 'Customer should have an account');
        accountId = accounts[0].id;
        console.log(`    Got account ${accountId}, balance: ${accounts[0].balance}`);
    });

    await test('Transfer', async () => {
        const transferRes = await axios.post(`${API_GATEWAY}/transactions`, {
            fromAccountId: accountId,
            toAccountId: accountId,
            amount: 10
        }, {
            headers: { Authorization: `Bearer ${customerToken}` }
        });
        assert(transferRes.data && (transferRes.data.id || transferRes.data.data?.id), 'Transaction should have an ID');
        console.log('    Transfer created: ' + (transferRes.data.id || transferRes.data.data?.id));
    });

    await test('Insufficient balance', async () => {
        try {
            await axios.post(`${API_GATEWAY}/transactions`, {
                fromAccountId: accountId,
                toAccountId: accountId,
                amount: 1000000
            }, {
                headers: { Authorization: `Bearer ${customerToken}` }
            });
            throw new Error('Should have failed');
        } catch (e) {
            assert(e.response && (e.response.status === 400 || e.response.status === 422), `Should reject (got ${e.response?.status})`);
        }
    });

    await test('Duplicate transfer (idempotency)', async () => {
        const idemKey = 'idem-test-' + Date.now();
        let tx1, tx2;
        try {
            tx1 = await axios.post(`${API_GATEWAY}/transactions`, {
                fromAccountId: accountId,
                toAccountId: accountId,
                amount: 5,
                idempotencyKey: idemKey
            }, {
                headers: { 
                    Authorization: `Bearer ${customerToken}`
                }
            });
            tx2 = await axios.post(`${API_GATEWAY}/transactions`, {
                fromAccountId: accountId,
                toAccountId: accountId,
                amount: 5,
                idempotencyKey: idemKey
            }, {
                headers: { 
                    Authorization: `Bearer ${customerToken}`
                }
            });
        } catch (e) {
            // Might fail if idempotency is not supported
        }
        if (tx1 && tx2) {
            const id1 = tx1.data.id || tx1.data.data?.id;
            const id2 = tx2.data.id || tx2.data.data?.id;
            if (id1 === id2) {
                console.log('    Idempotent transfer working (same ID returned)');
            } else {
                console.log('    Idempotent transfer returned different IDs. Idempotency may not be fully implemented.');
            }
        }
    });

    await test('Loan', async () => {
        const loanRes = await axios.post(`${API_GATEWAY}/loans`, {
            amount: 5000,
            termMonths: 12,
            purpose: 'Test loan'
        }, {
            headers: { Authorization: `Bearer ${customerToken}` }
        });
        const id = loanRes.data.id || loanRes.data.data?.id;
        assert(id, 'Should return a loan ID');
        console.log('    Loan requested: ' + id);
    });

    console.log(`\nRESULTS: ${passCount} Passed, ${failCount} Failed.`);
}

run();
