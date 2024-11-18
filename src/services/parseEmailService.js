// src/services/parseEmailService.js

const parseEmailSubject = (subject) => {
  if (!subject || !subject.includes("EVT -") || !subject.includes("Incident #")) {
    // Se o assunto não tiver os padrões esperados, retorna "Desconhecido"
    return {
      customerName: 'Desconhecido',
      evtNumber: 'Desconhecido',
      internalTicket: 'Desconhecido',
    };
  }

  const customerNameMatch = subject.match(/B2C - (.+?) - Incident/);
  const evtNumberMatch = subject.match(/Incident #(\d+)/);
  const internalTicketMatch = subject.match(/ticket interno[\s#-]+(\d+)/i);

  return {
    customerName: customerNameMatch ? customerNameMatch[1].trim() : 'Desconhecido',
    evtNumber: evtNumberMatch ? evtNumberMatch[1] : 'Desconhecido',
    internalTicket: internalTicketMatch ? internalTicketMatch[1] : 'Desconhecido',
  };
};

module.exports = { parseEmailSubject };
