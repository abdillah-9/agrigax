import { FiArrowRight, FiActivity, FiTrendingUp, FiDollarSign, FiBookOpen } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const projects = [
  {
    title: 'Maternal Health Outcomes Analysis',
    description:
      'Multi-level logistic regression analyzing factors associated with maternal mortality across 12 regions in Tanzania, informing national health policy.',
    tags: ['Logistic Regression', 'R', 'Public Health'],
    icon: <FiActivity size={48} />,
  },
  {
    title: 'Agricultural Yield Prediction Model',
    description:
      'Random forest and gradient boosting models predicting crop yields using satellite imagery, weather data, and soil characteristics for precision agriculture.',
    tags: ['Machine Learning', 'Python', 'Agriculture'],
    icon: <FiTrendingUp size={48} />,
  },
  {
    title: 'Financial Inclusion Index Construction',
    description:
      'Principal component analysis and structural equation modeling to develop a composite financial inclusion index for East African Community member states.',
    tags: ['PCA', 'SEM', 'Economics'],
    icon: <FiDollarSign size={48} />,
  },
  {
    title: 'Education Access Disparity Study',
    description:
      'Longitudinal data analysis examining gender and socioeconomic disparities in secondary education completion rates across urban and rural Tanzania.',
    tags: ['Panel Data', 'Stata', 'Education'],
    icon: <FiBookOpen size={48} />,
  },
];

function WorkShowcase() {
  return (
    <section className="work-section" id="work">
      <div className="container">
        <h2 className="section-title text-center reveal">Featured Projects</h2>
        <p className="section-subtitle text-center reveal">
          Selected work demonstrating statistical rigor and real-world impact
        </p>
        <div className="work-grid">
          {projects.map((project, index) => (
            <div
              key={index}
              className="work-card reveal"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="work-card-image">{project.icon}</div>
              <div className="work-card-body">
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <div className="work-tags">
                  {project.tags.map((tag, i) => (
                    <span key={i} className="work-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-xl">
          <Link to="/portfolio" className="btn btn-primary">
            View All Projects <FiArrowRight />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default WorkShowcase;
