const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Configuration Supabase avec ton URL et ta clé secrète
const SUPABASE_URL = 'https://xaetcojuoooqtbdcuyso.supabase.co'; 
const SUPABASE_KEY = 'sb_pub_xaetcojuoooqtbdcuyso
  ';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

app.use(express.json());
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

io.on('connection', async (socket) => {
  // Charger les messages enregistrés dans Supabase au démarrage
  try {
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true });

    if (!error && messages) {
      socket.emit('load_messages', messages);
    }
  } catch (err) {
    console.error('Erreur chargement Supabase:', err);
  }

  // Envoyer un nouveau message
  socket.on('send_message', async (data) => {
    try {
      const { data: newMessage, error } = await supabase
        .from('messages')
        .insert([{ text: data.text, sender: data.sender || 'Moi', is_deleted: false }])
        .select()
        .single();

      if (!error && newMessage) {
        io.emit('new_message', newMessage);
      }
    } catch (err) {
      console.error('Erreur envoi message:', err);
    }
  });

  // Supprimer un message
  socket.on('delete_message', async (messageId) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_deleted: true })
        .eq('id', messageId);

      if (!error) {
        io.emit('message_deleted', messageId);
      }
    } catch (err) {
      console.error('Erreur suppression:', err);
    }
  });

  // Récupérer les messages supprimés (Réservé VIP)
  socket.on('recover_messages', async (data) => {
    if (!data || !data.isVip) {
      socket.emit('access_denied', '🔒 ACCÈS REFUSÉ !\n\nVous devez obligatoirement souscrire à l\'abonnement VIP (640 XAF / mois) avant de pouvoir récupérer les messages supprimés.');
      return;
    }

    try {
      const { data: deletedMessages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('is_deleted', true);

      if (!error) {
        socket.emit('recovered_messages', deletedMessages);
      }
    } catch (err) {
      console.error('Erreur récupération:', err);
    }
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Serveur prêt et connecté à Supabase sur http://localhost:${PORT}`);
});
