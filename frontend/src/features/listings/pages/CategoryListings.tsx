import { useNavigate } from "react-router-dom";
import { HiStar } from "react-icons/hi2";
import "../styles/listings.css";

const categoryServices = [
  { id: "1", title: "Tractor Rental", provider: "Kilimo Best", price: "TZS 120,000", rating: 4.8 },
  { id: "2", title: "Harvester Machine", provider: "Farm Help", price: "TZS 200,000", rating: 4.3 },
  { id: "3", title: "Irrigation Pump", provider: "Green Tech", price: "TZS 85,000", rating: 4.6 },
  { id: "4", title: "Plowing Service", provider: "AgriPro", price: "TZS 90,000", rating: 4.5 },
];

export default function CategoryListings() {
  const navigate = useNavigate();

  return (
    <main className="customer-page">
      <div className="customer-page-header">
        <h1 className="customer-page-title">Farm Equipment</h1>
        <p className="customer-page-subtitle">Browse equipment services in this category</p>
      </div>

      <section className="services-grid">
        {categoryServices.map(service => (
          <div key={service.id} className="service-card">
            <div className="service-image" />
            <div className="service-content">
              <h3 className="service-title">{service.title}</h3>
              <p className="service-provider">
                {service.provider} ·{" "}
                <span className="service-rating">
                  <HiStar className="service-rating-icon" /> {service.rating}
                </span>
              </p>
              <div className="service-footer">
                <span className="service-price">{service.price}</span>
                <button className="service-btn" onClick={() => navigate(`/app/listings/${service.id}`)}>
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
