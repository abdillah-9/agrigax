import { useNavigate } from "react-router-dom";
import {
  HiArrowLeft,
  HiStar,
  HiClock,
  HiTag,
  HiMapPin,
  HiCurrencyDollar,
  HiCheckCircle,
} from "react-icons/hi2";
import "../styles/listings.css";

export default function ListingDetails() {
  const navigate = useNavigate();

  const listing = {
    id: "1",
    title: "Tractor Rental Service",
    provider: "Kilimo Best Supplies",
    category: "Farm Equipment",
    type: "equipment",
    price: 120000,
    rating: 4.8,
    reviews: 24,
    location: "Dar es Salaam",
    description:
      "We provide high-quality tractor rental services suitable for small and large farms with experienced operators and affordable pricing. Our tractors are well-maintained and available for both short and long-term rental periods. Includes fuel and operator.",
    availability: "Available",
    responseTime: "12 min",
  };

  const handleBook = () => {
    alert("Booking request sent to provider!");
    navigate(-1);
  };

  return (
    <main className="customer-page">
      {/* Back Button */}
      <button className="back-nav-btn" onClick={() => navigate(-1)}>
        <HiArrowLeft />
        Back to Listings
      </button>

      <section className="service-details-card">
        <div className="service-details-image" />
        <div className="service-details-content">
          <div className="service-details-badges">
            <span className="badge badge-info">{listing.type}</span>
            <span className="badge badge-default">{listing.category}</span>
          </div>

          <h1 className="customer-page-title" style={{ marginTop: 8 }}>{listing.title}</h1>
          <p className="customer-page-subtitle">
            by <span className="fw-medium">{listing.provider}</span>
            {" · "}
            <span className="service-rating">
              <HiStar className="service-rating-icon" /> {listing.rating}
            </span>
            {" "}({listing.reviews} reviews)
            {" · "}
            <HiClock className="details-inline-icon" /> {listing.responseTime} response
          </p>

          <p className="service-details-text">{listing.description}</p>

          <div className="service-meta">
            <div className="service-meta-item">
              <HiTag className="details-meta-icon" />
              <span className="fw-semibold">Category:</span>
              <span>{listing.category}</span>
            </div>
            <div className="service-meta-item">
              <HiMapPin className="details-meta-icon" />
              <span className="fw-semibold">Location:</span>
              <span>{listing.location}</span>
            </div>
            <div className="service-meta-item">
              <HiCurrencyDollar className="details-meta-icon" />
              <span className="fw-semibold">Price:</span>
              <span className="primary-base fw-bold">TZS {listing.price.toLocaleString()}</span>
            </div>
            <div className="service-meta-item">
              <HiCheckCircle className="details-meta-icon" />
              <span className="fw-semibold">Availability:</span>
              <span className="badge badge-success">{listing.availability}</span>
            </div>
          </div>

          <div className="service-actions">
            <button className="book-service-btn" onClick={handleBook}>Book Now</button>
            <button className="back-outline-btn" onClick={() => navigate(-1)}>Back</button>
          </div>
        </div>
      </section>
    </main>
  );
}
