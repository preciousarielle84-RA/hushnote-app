const express = require('express');
const http = require('http');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const server = http.createServer(app);

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

// Route API pour récupérer tous les messages non supprimés
app.get('/api/messages', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or('is_deleted.is.null,is_deleted.eq.false');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route API pour poster un nouveau message
app.post('/api/messages', async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Contenu vide' });

    const { data, error } = await supabase
      .from('messages')
      .insert([{ content: content, is_deleted: false }]);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route API pour récupérer les messages marqués comme supprimés
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
  
