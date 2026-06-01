import { FiTrendingUp, FiDatabase, FiClipboard, FiPieChart, FiUsers, FiBookOpen } from 'react-icons/fi';

const services = [
  {
    icon: <FiTrendingUp />,
    title: 'Statistical Modeling',
    description:
      'Building robust regression, time series, and multivariate models to uncover patterns and predict outcomes with precision.',
  },
  {
    icon: <FiDatabase />,
    title: 'Data Analysis & Wrangling',
    description:
      'Cleaning, transforming, and analyzing complex datasets using R, Python, Stata, and SPSS for reproducible research.',
  },
  {
    icon: <FiClipboard />,
    title: 'Research Design',
    description:
      'Designing surveys, experiments, and observational studies with proper sampling methodology and power analysis.',
  },
  {
    icon: <FiPieChart />,
    title: 'Data Visualization',
    description:
      'Creating compelling interactive visualizations and dashboards that communicate insights to technical and non-technical audiences.',
  },
  {
    icon: <FiUsers />,
    title: 'Consulting & Advisory',
    description:
      'Providing expert guidance on statistical methodology, data strategy, and evidence-based decision making for organizations.',
  },
  {
    icon: <FiBookOpen />,
    title: 'Training & Workshops',
    description:
      'Delivering hands-on training in statistical software, data literacy, and analytical thinking for teams and institutions.',
  },
];

function ServicesSection() {
  return (
    <section className="services-section" id="services">
      <div className="container">
        <h2 className="section-title text-center reveal">Services & Expertise</h2>
        <p className="section-subtitle text-center reveal">
          Comprehensive statistical and data science services tailored to your research and business needs
        </p>
        <div className="services-grid">
          {services.map((service, index) => (
            <div
              key={index}
              className="service-card reveal"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="service-icon">{service.icon}</div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ServicesSection;
