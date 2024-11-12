// src/controllers/notificationController.js
const { listEmails } = require('../services/emailService');
const { sendToGoogleChat } = require('../services/googleChatService');
const { parseEmailSubject } = require('../services/parseEmailService');
const { logInfo, logError } = require('../utils/logger');

const notifyNewEmails = async () => {
  try {
    const emails = await listEmails();
    for (const email of emails) {
      const { subject, body } = email; // Inclua o 'body' do e-mail
      const { customerName, evtNumber, internalTicket } = parseEmailSubject(subject);

      // Extrair o nome do responsável após "Atenciosamente"
      const responsibleMatch = body.match(/Atenciosamente,\s*([\w\s]+)\r\r\n/); //Adicionar Att, conferir se minusculo e maiuscula funciona
      const responsibleName = responsibleMatch ? responsibleMatch[1].trim() : 'Desconhecido';

      // Extrair as alterações e mensagens
      const changesMatch = body.match(/Tarefa.*?\r\r\n([\s\S]*?)\r\r\n\r\r\n/);
      const changes = changesMatch ? changesMatch[1].trim() : 'Sem alterações';

      // Construir a mensagem de notificação com Markdown para negrito e itálico
      const message = `<b>Cliente</b>: ${customerName}\n<b>Número EVT</b>: #${evtNumber}\n<b>Ticket Interno</b>: ${internalTicket}\n\n<b>Responsável:</b> ${responsibleName}\n<b>Alterações:</b>\n<i>${changes}</i>`;
      
      // Enviar a notificação para o Google Chat
      await sendToGoogleChat(message, evtNumber);
    }
    logInfo('Processamento de e-mails concluído');
  } catch (error) {
    logError(`Erro ao processar e-mails: ${error.message}`);
    console.error(error.stack); // Exibe o stack trace completo do erro
  }
};

module.exports = { notifyNewEmails };
