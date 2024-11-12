// src/index.js
require('dotenv').config();
const { notifyNewEmails } = require('./controllers/notificationController');

const main = async () => {
  console.log('Iniciando verificação de e-mails...');
  await notifyNewEmails();
  console.log('Verificação concluída.');
};

main();
