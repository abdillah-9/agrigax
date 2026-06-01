import { FiMail, FiCalendar } from 'react-icons/fi';
import { Link } from 'react-router-dom';

function CTASection() {
  return (
    <section className="cta-section">
      <div className="cta-content">
        <h2 className="reveal">Ready to Unlock Your Data's Potential?</h2>
        <p className="reveal">
          Whether you need statistical consulting, data analysis, or research design,
          let's collaborate to transform your data into meaningful insights.
        </p>
        <div className="cta-btns reveal">
          <Link to="/contact" className="btn btn-secondary">
            <FiMail /> Get in Touch
          </Link>
          <a href="#" className="btn btn-outline" style={{ borderColor: '#fff', color: '#fff' }}>
            <FiCalendar /> Schedule Consultation
          </a>
        </div>
      </div>
    </section>
  );
}

export default CTASection;
