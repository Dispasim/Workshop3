const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/getServer', (req, res) => {
  const serverUrl = `http://localhost:${port}`;
  res.json({ code: 200, server: serverUrl });
});

app.listen(port, () => {
  console.log(`DNS Registry Server is running on port ${port}`);
});
