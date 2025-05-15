// Refatoração do sistema de notificação de e-mails para Google Chat
// Código reorganizado e com nomes mais intuitivos

// Ponto de Entrada da Aplicação (index.js)
require('dotenv').config();
const { processNewEmails } = require('./controllers/notificationController');
const { logInfo, logError } = require('./utils/logger');

const EMAIL_CHECK_INTERVAL = 30000; // Intervalo de 30 segundos
let lastProcessedEmailId = null;

async function startEmailMonitoring() {
  logInfo('Iniciando monitoramento de e-mails...');
  try {
    while (true) {
      logInfo('Verificando novos e-mails...');
      const newLastProcessedId = await processNewEmails(lastProcessedEmailId);

      if (newLastProcessedId && newLastProcessedId !== lastProcessedEmailId) {
        lastProcessedEmailId = newLastProcessedId;
        logInfo(`Atualizado último ID processado para: ${lastProcessedEmailId}`);
      }

      logInfo('Ciclo de verificação concluído. Aguardando próximo ciclo...');
      await new Promise((resolve) => setTimeout(resolve, EMAIL_CHECK_INTERVAL));
    }
  } catch (error) {
    logError(`Erro no monitoramento de e-mails: ${error.message}`);
    logError(error.stack);
  }
}

startEmailMonitoring();
