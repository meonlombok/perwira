/* Shared message formatter. Local only; this module makes no network requests. */
(function (root) {
  'use strict';
  const labels = {
    name: 'Name', email: 'Email', phone: 'WhatsApp', nationality: 'Nationality',
    location: 'Current location', status: 'Current immigration status',
    company: 'Company', website: 'Website', need: 'Website support',
    property: 'Property location', message: 'My plans'
  };
  function prepare(number, service, entries) {
    if (!/^[1-9]\d{7,14}$/.test(number)) throw new Error('Invalid WhatsApp destination.');
    const lines = ['ENQUIRY FOR PERWIRA VISA', `Service: ${service}`];
    for (const [key, value] of entries) {
      if (Object.prototype.hasOwnProperty.call(labels, key) && String(value).trim()) {
        lines.push(`${labels[key]}: ${String(value).trim()}`);
      }
    }
    const message = lines.join('\n\n');
    return {message, url: `https://wa.me/${number}?text=${encodeURIComponent(message)}`};
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = {prepare};
  else root.PerwiraEnquiry = {prepare};
})(typeof globalThis !== 'undefined' ? globalThis : this);
