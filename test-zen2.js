const { ZenEngine } = require('@gorules/zen-engine');
const fs = require('fs');

async function run() {
  const engine = new ZenEngine();
  const decision = engine.createDecision(fs.readFileSync('apps/api/src/integrations/gorules/loan-risk.json'));
  const result = await decision.evaluate({ loanAmount: 5000, existingLoanCount: 0 });
  console.log(result.result);
}
run().catch(console.error);
