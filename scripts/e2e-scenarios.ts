import axios, { AxiosError } from 'axios';
import assert from 'assert';

const API_GATEWAY = 'http://localhost:3100/api/v1';
const KEYCLOAK = 'http://localhost:8080/realms/bankcore/protocol/openid-connect/token';

async function getToken(username: string, role: string = 'customer'): Promise<string> {
    const res = await axios.post(KEYCLOAK, new URLSearchParams({
        client_id: 'bankcore-web',
        grant_type: 'password',
        username,
        password: role // seed data uses role as password (e.g. customer/customer)
    }).toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    return res.data.access_token;
}

async function run() {
    console.log('--- BankCore E2E Scenarios ---');
    let customerToken: string;
    let adminToken: string;
    let accountId: string;

    try {
        console.log('\nScenario 1: Authentication');
        customerToken = await getToken('customer@bankcore.local', 'customer');
        assert(customerToken, 'Token should be returned');
        console.log('  PASS - Got customer token');

        console.log('\nScenario 2: Unauthorized access');
        try {
            await axios.get(`${API_GATEWAY}/accounts`);
            throw new Error('Should have failed');
        } catch (e) {
            const err = e as AxiosError;
            assert(err.response?.status === 401, 'Should return 401');
            console.log('  PASS - 401 Unauthorized');
        }

        console.log('\nScenario 3: RBAC');
        try {
            await axios.get(`${API_GATEWAY}/admin/stats`, {
                headers: { Authorization: `Bearer ${customerToken}` }
            });
            throw new Error('Should have failed');
        } catch (e) {
            const err = e as AxiosError;
            // Depending on implementation, it might be 403 or 401 or 404
            console.log(`  Expected 403, got ${err.response?.status}`);
            assert(err.response?.status === 403, 'Should return 403 Forbidden');
            console.log('  PASS - 403 Forbidden');
        }

        console.log('\nScenario 4: Account');
        const accRes = await axios.get(`${API_GATEWAY}/accounts`, {
            headers: { Authorization: `Bearer ${customerToken}` }
        });
        console.log(accRes.data);
        assert(Array.isArray(accRes.data) || Array.isArray(accRes.data.data), 'Should return array of accounts or data property');
        const accounts = accRes.data.data || accRes.data;
        assert(accounts.length > 0, 'Customer should have an account');
        accountId = accounts[0].id;
        console.log(`  PASS - Got account ${accountId}, balance: ${accounts[0].balance}`);

        console.log('\nScenario 5: Transfer');
        const transferRes = await axios.post(`${API_GATEWAY}/transactions`, {
            fromAccountId: accountId,
            toAccountId: accountId, // transferring to self for simplicity
            amount: 10
        }, {
            headers: { Authorization: `Bearer ${customerToken}` }
        });
        const txData = transferRes.data.data || transferRes.data;
        assert(txData && txData.id, 'Transaction should have an ID');
        console.log('  PASS - Transfer created: ' + txData.id);

        console.log('\nScenario 6: Insufficient balance');
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
            const err = e as AxiosError;
            console.log(`  Got status ${err.response?.status} for insufficient balance`);
            assert(err.response?.status === 400 || err.response?.status === 422, 'Should reject');
            console.log('  PASS - Transfer rejected');
        }

        console.log('\nScenario 7: Duplicate transfer (idempotency)');
        const idemKey = 'idem-test-' + Date.now();
        const tx1 = await axios.post(`${API_GATEWAY}/transactions`, {
            fromAccountId: accountId,
            toAccountId: accountId,
            amount: 5,
            idempotencyKey: idemKey
        }, {
            headers: { 
                Authorization: `Bearer ${customerToken}`
            }
        });
        const tx2 = await axios.post(`${API_GATEWAY}/transactions`, {
            fromAccountId: accountId,
            toAccountId: accountId,
            amount: 5,
            idempotencyKey: idemKey
        }, {
            headers: { 
                Authorization: `Bearer ${customerToken}`
            }
        });
        const tx1Data = tx1.data.data || tx1.data;
        const tx2Data = tx2.data.data || tx2.data;
        assert(tx1Data.id === tx2Data.id, 'Should return the same transaction ID');
        console.log('  PASS - Idempotent transfer working');

        console.log('\nScenario 10: Loan');
        const loanRes = await axios.post(`${API_GATEWAY}/loans`, {
            amount: 5000,
            termMonths: 12,
            purpose: 'Test loan'
        }, {
            headers: { Authorization: `Bearer ${customerToken}` }
        });
        const loanData = loanRes.data.data || loanRes.data;
        assert(loanData && loanData.id, 'Should return a loan ID');
        console.log('  PASS - Loan requested: ' + loanData.id);
        
    } catch (e) {
        const err = e as AxiosError;
        if (err.response) {
            console.error(`FAIL: HTTP ${err.response.status}`, JSON.stringify(err.response.data, null, 2));
        } else {
            console.error('FAIL:', err);
        }
        process.exit(1);
    }
}

run();
