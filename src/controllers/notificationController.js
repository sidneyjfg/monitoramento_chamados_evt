// src/controllers/notificationController.js
const { listEmails } = require('../services/emailService');
const { sendToGoogleChat } = require('../services/googleChatService');
const { parseEmailSubject } = require('../services/parseEmailService');
const { logInfo, logError } = require('../utils/logger');

const notifyNewEmails = async () => {
  try {
    const emails = await listEmails();

    // Ordenar os e-mails do mais antigo para o mais recente com base no `internalDate`
    emails.sort((a, b) => new Date(a.internalDate) - new Date(b.internalDate));

    console.log("Emails organizados do mais antigo para o mais recente -> ", emails);

    // Enviar do mais antigo para o mais recente
    for (let i = emails.length - 1; i >= 0; i--) {
      const email = emails[i];
      const { subject, body } = email;
      const { customerName, evtNumber, internalTicket } = parseEmailSubject(subject);

      // Extrair o nome do responsável e as alterações
      const responsibleMatch = body.match(/Atenciosamente,\s*([\w\s]+)\r\r\n/);
      const responsibleName = responsibleMatch ? responsibleMatch[1].trim() : 'Desconhecido';

      const changesMatch = body.match(/Tarefa.*?\r\r\n([\s\S]*?)\r\r\n\r\r\n/);
      const changes = changesMatch ? changesMatch[1].trim() : 'Sem alterações';

      // Mensagem formatada para o Google Chat
      const message = `<b>Cliente:</b> ${customerName}<br><b>Número EVT:</b> #${evtNumber}<br><b>Ticket Interno:</b> ${internalTicket}<br><br><b>Responsável:</b> ${responsibleName}<br><b>Alterações:</b><br><i>${changes}</i>`;
      
      // Enviar a notificação para o Google Chat
      await sendToGoogleChat(message, evtNumber);
    }

    logInfo('Processamento de e-mails concluído');
  } catch (error) {
    logError(`Erro ao processar e-mails: ${error.message}`);
    console.error(error.stack);
  }
};

module.exports = { notifyNewEmails };
