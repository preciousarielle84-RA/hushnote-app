const express = require('express');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.static(__dirname));

// Route principale
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// APIs factices pour éviter toute erreur du serveur
app.get('/api/messages', (req, res) => {
  res.json([]);
});

app.post('/api/messages', (req, res) => {
  res.json({ success: true });
});

app.get('/api/messages-deleted', (req, res) => {
  res.json([]);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur prêt sur le port ${PORT}`);
});
  
