// src/index.js
require('dotenv').config();
const { notifyNewEmails } = require('./controllers/notificationController');

const CHECK_INTERVAL = 30000; // Intervalo de 30 segundos
let lastEmailId = null; // Variável para armazenar o ID do último e-mail processado

const main = async () => {
  console.log('Iniciando monitoramento de e-mails...');
  try {
    while (true) {
      console.log('Iniciando verificação de e-mails...');
      console.log('Versão mais atualizada');
      const newLastEmailId = await notifyNewEmails(lastEmailId);
      console.log("Ultimo email recebido no Index: ",newLastEmailId);

      // Atualizar `lastEmailId` com o último ID processado
      if (newLastEmailId) {
        lastEmailId = newLastEmailId;
      }

      console.log('Verificação concluída. Aguardando o próximo ciclo...');
      await new Promise((resolve) => setTimeout(resolve, CHECK_INTERVAL)); // Aguardar o intervalo definido
    }
  } catch (error) {
    console.error(`Erro no monitoramento: ${error.message}`);
    console.error(error.stack);
  }
};

main();
