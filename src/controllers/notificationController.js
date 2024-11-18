// src/controllers/notificationController.js
const { listEmails } = require('../services/emailService');
const { sendToGoogleChat } = require('../services/googleChatService');
const { parseEmailSubject } = require('../services/parseEmailService');
const { logInfo, logError } = require('../utils/logger');

const notifyNewEmails = async (lastProcessedEmailId) => {
  try {
    const emails = await listEmails();
    console.log("[LOG] Todos os Emails: ", emails);
    // Ordena e-mails do mais antigo para o mais recente
    emails.sort((a, b) => parseInt(a.internalDate) - parseInt(b.internalDate));
    console.log("[INFO] Emails Organizado");
    emails.forEach(email => {
      console.log(`[LOG] ID: ${email.id}, internalDate: ${email.internalDate}, Date: ${new Date(parseInt(email.internalDate))}`);
    });

    const lastProcessedIndex = lastProcessedEmailId
      ? emails.findIndex(email => email.id === lastProcessedEmailId)
      : -1;

    // Seleciona os e-mails novos após o último processado
    const newEmails = lastProcessedIndex !== -1 ? emails.slice(lastProcessedIndex + 1) : emails;
    console.log("Novos emails? ", newEmails);

    // Processa os novos e-mails do mais antigo para o mais recente
    for (const email of newEmails) {
      const { subject, body } = email;
      const { customerName, evtNumber, internalTicket } = parseEmailSubject(subject);

      const responsibleMatch = [...body.matchAll(/(?:atenciosamente|att)[.,\s\r\n]*([\w\s]+)\.?/gi)];
      const responsibleName = responsibleMatch.length > 0
        ? responsibleMatch[responsibleMatch.length - 1][1].trim()
        : 'Desconhecido';

      console.log("ResponsibleMatch", responsibleMatch);
      const changesMatch = body.match(/Tarefa.*?\r\r\n([\s\S]*?)\r\r\n\r\r\n/);
      const changes = changesMatch ? changesMatch[1].trim() : 'Sem alterações';

      const message = `<b>Cliente:</b> ${customerName}<br><b>Número EVT:</b> #${evtNumber}<br><b>Ticket Interno:</b> ${internalTicket}<br><br><b>Responsável:</b> ${responsibleName}<br><b>Alterações:</b><br><i>${changes}</i>`;

      console.log(`Email Id: ", ${email.id},\nResponsável: ${responsibleName} , "\nAssunto: ", ${subject}`);
      console.log("Messagem: ", message);
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
    }

    // Atualiza `latestEmailId` para o ID do e-mail mais recente processado
    if (newEmails.length > 0) {
      latestEmailId = newEmails[newEmails.length - 1].id;
    }

    logInfo('Processamento de e-mails concluído');
    console.log("Último e-mail recebido: ", latestEmailId);
    return latestEmailId;
  } catch (error) {
    logError(`Erro ao processar e-mails: ${error.message}`);
    console.error(error.stack);
    return lastProcessedEmailId; // Retorna o ID anterior em caso de erro
  }
};

module.exports = { notifyNewEmails };
