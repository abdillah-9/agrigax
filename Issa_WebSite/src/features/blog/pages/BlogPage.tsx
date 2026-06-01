import { useEffect } from 'react';
import {
  FiArrowRight,
  FiCalendar,
  FiClock,
  FiBarChart2,
  FiTarget,
  FiSearch,
  FiCpu,
  FiTrendingUp,
  FiZap,
} from 'react-icons/fi';
import '../styles/blog.css';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  icon: React.ReactNode;
}

const posts: BlogPost[] = [
  {
    id: 1,
    title: 'Understanding Multi-Level Modeling for Hierarchical Data',
    excerpt:
      'A comprehensive guide to multi-level (hierarchical) modeling techniques, their applications in public health research, and implementation in R using the lme4 package.',
    category: 'Statistical Methods',
    date: 'May 15, 2026',
    readTime: '12 min read',
    icon: <FiBarChart2 size={40} />,
  },
  {
    id: 2,
    title: 'Propensity Score Matching: A Practical Guide',
    excerpt:
      'Learn how propensity score matching can reduce selection bias in observational studies, with step-by-step implementation in R and Stata using real-world examples.',
    category: 'Causal Inference',
    date: 'April 28, 2026',
    readTime: '15 min read',
    icon: <FiTarget size={40} />,
  },
  {
    id: 3,
    title: 'Handling Missing Data: From Simple to Multiple Imputation',
    excerpt:
      'An exploration of missing data mechanisms and modern imputation techniques, comparing complete case analysis, MICE, and Bayesian approaches with practical code.',
    category: 'Data Wrangling',
    date: 'March 12, 2026',
    readTime: '10 min read',
    icon: <FiSearch size={40} />,
  },
  {
    id: 4,
    title: 'Introduction to Bayesian Statistics for Frequentist Practitioners',
    excerpt:
      'Bridging the gap between frequentist and Bayesian paradigms, this article introduces Bayesian concepts using intuitive examples and Stan code for common models.',
    category: 'Statistical Methods',
    date: 'February 20, 2026',
    readTime: '18 min read',
    icon: <FiCpu size={40} />,
  },
  {
    id: 5,
    title: 'Machine Learning vs. Traditional Statistics in Agriculture',
    excerpt:
      'A comparative analysis of random forest, XGBoost, and traditional regression approaches for crop yield prediction, discussing when each method is most appropriate.',
    category: 'Machine Learning',
    date: 'January 8, 2026',
    readTime: '14 min read',
    icon: <FiTrendingUp size={40} />,
  },
  {
    id: 6,
    title: 'Power Analysis and Sample Size Determination Made Practical',
    excerpt:
      'A hands-on guide to conducting power analysis using G*Power and R, covering t-tests, ANOVA, regression, and complex survey designs with practical examples.',
    category: 'Research Design',
    date: 'December 15, 2025',
    readTime: '11 min read',
    icon: <FiZap size={40} />,
  },
];

function BlogPage() {
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
    <div className="blog-page">
      {/* Header */}
      <div className="blog-header">
        <h1 className="reveal">
          Statistical <span className="highlight">Insights</span>
        </h1>
        <p className="reveal">
          Articles, tutorials, and thoughts on statistics, data science, and research methodology
        </p>
      </div>

      {/* Blog Grid */}
      <div className="blog-grid">
        {posts.map((post, index) => (
          <article
            key={post.id}
            className="blog-card reveal"
            style={{ animationDelay: `${index * 0.08}s` }}
          >
            <div className="blog-card-image">
              {post.icon}
              <span className="blog-card-category">{post.category}</span>
            </div>
            <div className="blog-card-body">
              <div className="blog-card-meta">
                <span>
                  <FiCalendar size={12} /> {post.date}
                </span>
                <span>
                  <FiClock size={12} /> {post.readTime}
                </span>
              </div>
              <h3>{post.title}</h3>
              <p>{post.excerpt}</p>
              <a href="#" className="blog-read-more">
                Read Article <FiArrowRight size={13} />
              </a>
            </div>
          </article>
        ))}
      </div>

      {/* Newsletter */}
      <div className="newsletter-section reveal">
        <h2>Stay Updated</h2>
        <p>
          Subscribe to receive notifications about new articles, statistical tips,
          and workshop announcements.
        </p>
        <div className="newsletter-form">
          <input type="email" placeholder="Your email address" />
          <button type="submit">Subscribe</button>
        </div>
      </div>
    </div>
  );
}

export default BlogPage;
