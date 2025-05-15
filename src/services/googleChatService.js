const axios = require('axios');
const { googleChatWebhookUrl } = require('../config/googleChatConfig');

async function sendToGoogleChat(customerName, evtNumber, internalTicket, responsible, message) {
  try {
    const cardMessage = {
      cards: [
        {
          header: {
            title: '⚠️ Atualização de Chamado ⚠️',
            subtitle: `<b>Número EVT:</b> #${evtNumber}`.trim(),
          },
          sections: [
            {
              widgets: [
                { textParagraph: { text: `<b>Cliente:</b> ${customerName}` } },
                { textParagraph: { text: `<b>Número EVT:</b> #${evtNumber}` } },
                { textParagraph: { text: `<b>Ticket Interno:</b> ${internalTicket || 'Desconhecido'}` } },
                { textParagraph: { text: `<b>Responsável:</b> ${responsible || 'Desconhecido'}` } },
                { textParagraph: { text: message } },
                {
                  buttons: [
                    {
                      textButton: {
                        text: 'Visualizar Chamado',
                        onClick: { openLink: { url: `https://redmine.evtit.com/issues/${evtNumber}` } },
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    await axios.post(googleChatWebhookUrl, cardMessage);
    console.log('[INFO] Mensagem enviada ao Google Chat com sucesso');
  } catch (error) {
    console.error('[ERROR] Falha ao enviar mensagem ao Google Chat:', error.message);
  }
}

module.exports = { sendToGoogleChat };
