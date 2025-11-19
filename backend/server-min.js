import express from 'express';

const app = express();
app.get('/ping', (req,res) => {
  res.json({ ok: true, ts: Date.now() });
});

const PORT = 5100;
app.listen(PORT, () => console.log('[MIN] listening', PORT));
