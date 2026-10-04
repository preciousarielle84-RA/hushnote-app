const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Configuration Supabase
const SUPABASE_URL = 'https://xaetcojuoooqtbdcuyso.supabase.co';
const SUPABASE_KEY = 'sb_pub_xaetcojuoooqtbdcuyso';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

app.use(express.json());
app.use(express.static(__dirname));

// Route principale pour afficher la page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Route API pour récupérer les messages
app.get('/api/messages', async (req, res) => {
  try {
    const { data, error } = await supabase.from('messages').select('*');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route API pour les messages supprimés
app.get('/api/messages-deleted', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('is_deleted', true);
    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Serveur prêt sur le port ${PORT}`);
});

