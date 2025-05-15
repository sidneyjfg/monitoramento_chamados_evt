function parseEmailDetails(subject, body) {
  if (!subject || !subject.includes('EVT -') || !subject.includes('Incident #')) {
    return {
      customerName: 'Desconhecido',
      evtNumber: 'Desconhecido',
      internalTicket: 'Desconhecido',
      responsible: 'Desconhecido'
    };
  }

  const customerNameMatch = subject.match(/B2C - (.+?) - Incident/);
  const evtNumberMatch = subject.match(/Incident #(\d+)/);
  const internalTicketMatch = subject.match(/ticket interno[\s#-]+(\d+)/i);
  
  // 📌 Capturar o responsável pelo ticket
  const signatureMatches = [...body.matchAll(/(?:att|atenciosamente|Atenciosamente|Att)[.,\s]*([\w\s]+)\*?/gim)];
  const responsible = signatureMatches.length > 0
    ? signatureMatches[signatureMatches.length - 1][1].replace(/\*+$/, '').trim()
    : 'Desconhecido';

  return {
    customerName: customerNameMatch ? customerNameMatch[1].trim() : 'Desconhecido',
    evtNumber: evtNumberMatch ? evtNumberMatch[1] : 'Desconhecido',
    internalTicket: internalTicketMatch ? internalTicketMatch[1] : 'Desconhecido',
    responsible,
  };
}

module.exports = { parseEmailDetails };
