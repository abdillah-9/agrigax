import { useState } from 'react';
import type { FormEvent } from 'react';
import { FaEnvelope, FaPhone, FaWhatsapp, FaLocationDot } from 'react-icons/fa6';
import { COMPANY } from '../../../config';
import { useLanguage } from '../../../context/LanguageContext';
import '../styles/contact.css';

import heroImg from '../../../assets/crew_container_4.jpeg';

function ContactPage() {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState('');
  const [message, setMessage] = useState('');

  const chosenService = service || t.contact.serviceOptions[0];

  const composed = () =>
    `Hello Kilele Electricals,\n\nMy name is ${name}${phone ? ` (${phone})` : ''}.\n` +
    `I am interested in: ${chosenService}.\n\n${message}`;

  const sendWhatsApp = (e: FormEvent) => {
    e.preventDefault();
    window.open(COMPANY.whatsapp(composed()), '_blank');
  };

  const sendEmail = () => {
    const subject = encodeURIComponent(`Quotation Request — ${chosenService}`);
    const body = encodeURIComponent(composed());
    window.location.href = `mailto:${COMPANY.email}?subject=${subject}&body=${body}`;
  };

  return (
    <main>
      <header className="pageHero" style={{ backgroundImage: `url(${heroImg})` }}>
        <div className="container fadeUp">
          <span className="kicker">{t.contact.heroKicker}</span>
          <h1>
            {t.contact.heroTitle.pre}
            <span style={{ color: 'var(--gold)' }}>{t.contact.heroTitle.accent}</span>
          </h1>
          <p>{t.contact.heroLead}</p>
        </div>
      </header>

      <section className="section" style={{ paddingTop: '40px' }}>
        <div className="container contactSplit">
          {/* Info cards */}
          <div className="infoCards">
            <div className="card infoCard">
              <div className="iconBadge">
                <FaPhone />
              </div>
              <div>
                <h4>{t.contact.callUs}</h4>
                <a href={`tel:${COMPANY.phone}`}>{COMPANY.phoneDisplay}</a>
              </div>
            </div>

            <div className="card infoCard">
              <div className="iconBadge">
                <FaWhatsapp />
              </div>
              <div>
                <h4>{t.contact.whatsapp}</h4>
                <a href={COMPANY.whatsapp()} target="_blank">
                  {t.contact.whatsappSub}
                </a>
              </div>
            </div>

            <div className="card infoCard">
              <div className="iconBadge">
                <FaEnvelope />
              </div>
              <div>
                <h4>{t.contact.email}</h4>
                <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
              </div>
            </div>

            <div className="card infoCard">
              <div className="iconBadge">
                <FaLocationDot />
              </div>
              <div>
                <h4>{t.contact.location}</h4>
                <span>{COMPANY.location}</span>
              </div>
            </div>
          </div>

          {/* Quote form */}
          <form className="card quoteForm" onSubmit={sendWhatsApp}>
            <h3>{t.contact.formTitle}</h3>
            <p className="sub">{t.contact.formSub}</p>

            <div className="formRow">
              <div className="field">
                <label htmlFor="name">{t.contact.nameLabel}</label>
                <input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.contact.namePlaceholder}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="phone">{t.contact.phoneLabel}</label>
                <input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t.contact.phonePlaceholder}
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="service">{t.contact.serviceLabel}</label>
              <select id="service" value={chosenService} onChange={(e) => setService(e.target.value)}>
                {t.contact.serviceOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="message">{t.contact.messageLabel}</label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t.contact.messagePlaceholder}
                required
              />
            </div>

            <div className="formBtns">
              <button type="submit" className="btn btnWhats">
                <FaWhatsapp /> {t.contact.sendWhatsApp}
              </button>
              <button type="button" className="btn btnGhost" onClick={sendEmail}>
                <FaEnvelope /> {t.contact.sendEmail}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}

export default ContactPage;
