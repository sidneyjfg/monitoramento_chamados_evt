require('dotenv').config();
const { notifyNewEmails } = require('./controllers/notificationController');

const CHECK_INTERVAL = 60000; // Intervalo de 1 minuto (em milissegundos) - ajuste conforme necessário

const main = async () => {
  console.log('Iniciando monitoramento de e-mails...');
  try {
    while (true) {
      console.log('Iniciando verificação de e-mails...');
      await notifyNewEmails();
      console.log('Verificação concluída. Aguardando o próximo ciclo...');
      await new Promise((resolve) => setTimeout(resolve, CHECK_INTERVAL)); // Aguardar o intervalo definido
    }
  } catch (error) {
    console.error(`Erro no monitoramento: ${error.message}`);
    console.error(error.stack);
  }
};

main();
