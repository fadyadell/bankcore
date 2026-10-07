const { ZenEngine } = require('@gorules/zen-engine');
const fs = require('fs');

const model = {
  contentType: 'application/vnd.gorules.decision',
  nodes: [
    { id: 'request', name: 'Request', type: 'inputNode', position: { x: 0, y: 0 } },
    { id: 'response', name: 'Response', type: 'outputNode', position: { x: 0, y: 0 } },
    {
      id: 'risk_table',
      name: 'Risk Table',
      type: 'decisionTableNode',
      position: { x: 0, y: 0 },
      content: {
        hitPolicy: 'first',
        inputs: [
          { id: 'i1', name: 'Loan Amount', field: 'loanAmount' },
          { id: 'i2', name: 'Term Months', field: 'termMonths' }
        ],
        outputs: [
          { id: 'o1', name: 'Risk Score', field: 'riskScore' },
          { id: 'o2', name: 'Risk Level', field: 'riskLevel' },
          { id: 'o3', name: 'Decision', field: 'decision' },
          { id: 'o4', name: 'Reasons', field: 'reasons' }
        ],
        rules: [
          {
            id: 'r1',
            _description: 'High loan amount',
            cells: { i1: '> 100000', i2: '', o1: '80', o2: '"HIGH"', o3: '"REJECT"', o4: '["Amount too high"]' }
          },
          {
            id: 'r2',
            _description: 'Default',
            cells: { i1: '', i2: '', o1: '20', o2: '"LOW"', o3: '"AUTO_APPROVE"', o4: '["Standard"]' }
          }
        ]
      }
    }
  ],
  edges: [
    { id: 'e1', type: 'edge', sourceId: 'request', targetId: 'risk_table' },
    { id: 'e2', type: 'edge', sourceId: 'risk_table', targetId: 'response' }
  ]
};

async function test() {
  const engine = new ZenEngine();
  const decision = engine.createDecision(Buffer.from(JSON.stringify(model)));
  
  const result = await decision.evaluate({
    loanAmount: 150000,
    termMonths: 12
  });
  
  console.log(JSON.stringify(result.result, null, 2));
}

test().catch(console.error);
