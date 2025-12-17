require('dotenv').config();
const express = require('express');
const cors = require('cors');
const twilio = require('twilio');

const app = express();
app.use(cors());
app.use(express.json());

if (!process.env.TWILIO_SID || !process.env.TWILIO_TOKEN || !process.env.TWILIO_PHONE) {
  console.warn('Twilio não configurado. Defina TWILIO_SID, TWILIO_TOKEN e TWILIO_PHONE no .env.');
}

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

app.post('/send-sms', async (req, res) => {
  const { to, message } = req.body;
  if (!to || !message) {
    return res.status(400).json({ error: 'Os campos to e message são obrigatórios.' });
  }
  try {
    const sms = await client.messages.create({
      from: process.env.TWILIO_PHONE,
      to,
      body: message,
    });
    res.json({ success: true, sid: sms.sid });
  } catch (error) {
    console.error('Erro ao enviar SMS', error.message);
    res.status(500).json({ error: error.message || 'Falha no envio.' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ Backend SMS rodando na porta ${port}`);
});
