import { useEffect, useState } from 'react';
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiLinkedin,
  FiTwitter,
  FiGithub,
  FiSend,
  FiClock,
} from 'react-icons/fi';
import '../styles/contact.css';

function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    service: '',
    message: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Thank you for your message! I will get back to you within 24 hours.');
    setFormData({ name: '', email: '', subject: '', service: '', message: '' });
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="contact-page">
      {/* Header */}
      <div className="contact-header">
        <h1 className="reveal">
          Get in <span className="highlight">Touch</span>
        </h1>
        <p className="reveal">
          Have a statistical challenge? Let's discuss how I can help with your research or data needs
        </p>
      </div>

      <div className="contact-grid">
        {/* Left: Info */}
        <div className="contact-info">
          <div className="contact-info-card reveal">
            <div className="contact-icon-circle">
              <FiMail />
            </div>
            <div className="contact-info-text">
              <h3>Email</h3>
              <p>
                <a href="mailto:issa.mbombwe@email.com">issa.mbombwe@email.com</a>
              </p>
              <p className="sub-text">Response within 24 hours</p>
            </div>
          </div>

          <div className="contact-info-card reveal">
            <div className="contact-icon-circle">
              <FiPhone />
            </div>
            <div className="contact-info-text">
              <h3>Phone</h3>
              <p>
                <a href="tel:+255123456789">+255 123 456 789</a>
              </p>
              <p className="sub-text">Monday – Friday, 9:00 AM – 5:00 PM EAT</p>
            </div>
          </div>

          <div className="contact-info-card reveal">
            <div className="contact-icon-circle">
              <FiMapPin />
            </div>
            <div className="contact-info-text">
              <h3>Location</h3>
              <p>Department of Statistics</p>
              <p>University of Dar es Salaam</p>
              <p>Dar es Salaam, Tanzania</p>
            </div>
          </div>

          <div className="contact-info-card reveal">
            <div className="contact-icon-circle">
              <FiClock />
            </div>
            <div className="contact-info-text">
              <h3>Availability</h3>
              <p>Currently accepting new projects</p>
              <div className="availability-badge">
                <span className="availability-dot" />
                Available for Consulting
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="social-links-row reveal">
            <a href="#" className="social-link-item" aria-label="LinkedIn">
              <FiLinkedin />
            </a>
            <a href="#" className="social-link-item" aria-label="Twitter">
              <FiTwitter />
            </a>
            <a href="#" className="social-link-item" aria-label="GitHub">
              <FiGithub />
            </a>
            <a href="#" className="social-link-item" aria-label="ResearchGate">
              RG
            </a>
          </div>

          {/* Map placeholder */}
          <div className="map-placeholder reveal">
            <FiMapPin size={18} style={{ marginRight: 8 }} />
            Dar es Salaam, Tanzania
          </div>
        </div>

        {/* Right: Form */}
        <div className="contact-form-card reveal">
          <h2>Send a Message</h2>
          <p className="form-subtitle">Fill out the form below and I'll get back to you promptly.</p>
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Dr. Jane Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="jane@organization.org"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="subject">Subject *</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  placeholder="Statistical consulting inquiry"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="service">Service Needed</label>
                <select
                  id="service"
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                >
                  <option value="">Select a service...</option>
                  <option value="consulting">Statistical Consulting</option>
                  <option value="analysis">Data Analysis</option>
                  <option value="research">Research Design</option>
                  <option value="training">Training & Workshop</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="message">Message *</label>
              <textarea
                id="message"
                name="message"
                placeholder="Describe your project, research question, or data challenge..."
                value={formData.message}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="form-submit-btn">
              <FiSend /> Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;
