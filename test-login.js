const { exec } = require('child_process');

// Start iam-service and api-gateway
const iam = exec('npx nx serve iam-service');
const gw = exec('npx nx serve api-gateway');

setTimeout(async () => {
  try {
    const res = await fetch('http://localhost:3000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@bankcore.local', password: 'password123' })
    });
    console.log('Status:', res.status);
    console.log('Response:', await res.text());
  } catch(e) { console.error(e) }
  
  iam.kill();
  gw.kill();
  process.exit(0);
}, 10000); // wait 10s for boot
