// Central place for company contact details — edit here once and the whole
// site (header, footer, contact page, WhatsApp links) updates.
export const COMPANY = {
  name: 'Kilele Electricals',
  slogan: 'Tunafika Kileleni Kwa Usalama',
  email: 'suleshroja@kileleelectricals.co.tz',
  phone: '+255764066665',
  phoneDisplay: '+255 764 066 665',
  location: 'Dar es Salaam, Tanzania',
  instagram: '',
  whatsapp: (message = 'Hello Kilele Electricals, I would like a quote.') =>
    `https://wa.me/${COMPANY.phone.replace('+', '')}?text=${encodeURIComponent(message)}`,
};
