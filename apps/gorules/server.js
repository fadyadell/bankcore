const express = require('express');
const { ZenEngine } = require('@gorules/zen-engine');
const fs = require('fs');

const app = express();
app.use(express.json());

const modelBuffer = fs.readFileSync(__dirname + '/decision.json');

const engine = new ZenEngine();
const decision = engine.createDecision(modelBuffer);

app.post('/api/evaluate', async (req, res) => {
  try {
    const input = req.body.context || {};
    const result = await decision.evaluate(input);
    res.json({ result: result.result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.listen(4000, () => {
  console.log('Zen-Engine running on port 4000');
});
