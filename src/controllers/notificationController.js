const { fetchUnreadEmails } = require('../services/emailService');
const { sendToGoogleChat } = require('../services/googleChatService');
const { parseEmailDetails } = require('../services/parseEmailService');
const { logInfo, logError } = require('../utils/logger');

async function processNewEmails(lastProcessedEmailId) {
  try {
    const emails = await fetchUnreadEmails();
    emails.sort((a, b) => parseInt(a.internalDate) - parseInt(b.internalDate));

    const lastProcessedIndex = lastProcessedEmailId ? emails.findIndex(email => email.id === lastProcessedEmailId) : -1;
    const newEmails = lastProcessedIndex !== -1 ? emails.slice(lastProcessedIndex + 1) : emails;

    for (const email of newEmails) {
      const { subject, body, responsible } = email;
      const { customerName, evtNumber, internalTicket } = parseEmailDetails(subject, body);

      // 🔄 Ajuste no cabeçalho do card
      const message = `<b>Mensagem:</b><br><i>${body}</i>`;
      
      await sendToGoogleChat(customerName, evtNumber, internalTicket, responsible, message);
    }

    if (newEmails.length > 0) {
      return newEmails[newEmails.length - 1].id;
    }
    return lastProcessedEmailId;
  } catch (error) {
    logError(`Erro ao processar e-mails: ${error.message}`);
    return lastProcessedEmailId;
  }
}

module.exports = { processNewEmails };
