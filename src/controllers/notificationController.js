// src/controllers/notificationController.js
const { listEmails } = require('../services/emailService');
const { sendToGoogleChat } = require('../services/googleChatService');
const { parseEmailSubject } = require('../services/parseEmailService');
const { logInfo, logError } = require('../utils/logger');

const notifyNewEmails = async (lastProcessedEmailId) => {
  try {
    const emails = await listEmails();

    // Ordenar os e-mails do mais antigo para o mais recente com base no `internalDate`
    emails.sort((a, b) => new Date(a.internalDate) - new Date(b.internalDate));

    // Encontrar o índice do último e-mail processado
    const lastProcessedIndex = lastProcessedEmailId
      ? emails.findIndex(email => email.id === lastProcessedEmailId)
      : -1;

    // Se encontrar o último processado, pegue os e-mails após ele
    const newEmails = lastProcessedIndex !== -1 ? emails.slice(lastProcessedIndex + 1) : emails;
    console.log("Novos emails? ", newEmails);

    let latestEmailId = lastProcessedEmailId;

    // Processa os novos e-mails do mais antigo para o mais recente
    for (const email of newEmails) {
      const { subject, body } = email;
      const { customerName, evtNumber, internalTicket } = parseEmailSubject(subject);

      const responsibleMatch = body.match(/(?:atenciosamente|att)[.,\s\r\n]*([\w\s]+)\.?/i);
      const responsibleName = responsibleMatch ? responsibleMatch[1].trim() : 'Desconhecido';
      const changesMatch = body.match(/Tarefa.*?\r\r\n([\s\S]*?)\r\r\n\r\r\n/);
      const changes = changesMatch ? changesMatch[1].trim() : 'Sem alterações';
      
      const message = `<b>Cliente:</b> ${customerName}<br><b>Número EVT:</b> #${evtNumber}<br><b>Ticket Interno:</b> ${internalTicket}<br><br><b>Responsável:</b> ${responsibleName}<br><b>Alterações:</b><br><i>${changes}</i>`;

      console.log("Email Id: ", email.id, "\nAssunto: ", subject);
      try {
        await sendToGoogleChat(message, evtNumber);
        console.log('Mensagem enviada ao Google Chat com sucesso');
      } catch (error) {
        console.error('Erro ao enviar mensagem ao Google Chat:', error.message);
        if (error.response && error.response.status === 429) {
          console.log('Atingido o limite de taxa. Aguardando antes de recomeçar...');
          await new Promise(resolve => setTimeout(resolve, 60000)); // Espera 60 segundos
        }
      }

      // Definir este e-mail como o último processado
      latestEmailId = email.id;

      // Intervalo entre solicitações para evitar o limite de taxa
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    logInfo('Processamento de e-mails concluído');
    console.log("Último e-mail recebido: ", latestEmailId);
    return latestEmailId;
  } catch (error) {
    logError(`Erro ao processar e-mails: ${error.message}`);
    console.error(error.stack);
    return lastProcessedEmailId; // Retornar o ID anterior em caso de erro
  }
};

module.exports = { notifyNewEmails };
