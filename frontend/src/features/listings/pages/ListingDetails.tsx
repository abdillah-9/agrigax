import { useNavigate } from "react-router-dom";
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
    description: "We provide high-quality tractor rental services suitable for small and large farms with experienced operators and affordable pricing. Our tractors are well-maintained and available for both short and long-term rental periods. Includes fuel and operator.",
    availability: "Available",
    responseTime: "12 min",
  };

  const handleBook = () => {
    alert("Booking request sent to provider!");
    navigate(-1);
  };

  return (
    <main className="p-xl">
      {/* Back Button */}
      <button
        className="btn btn-outline btn-sm mb-lg flex items-center gap-sm"
        onClick={() => navigate(-1)}
      >
        ← Back to Listings
      </button>

      <section className="service-details-card shadow-md radius-lg">
        <div className="service-details-image" />
        <div className="service-details-content">
          <div className="flex gap-sm mb-md">
            <span className="badge badge-info">{listing.type}</span>
            <span className="badge badge-default">{listing.category}</span>
          </div>

          <h1 className="text-2xl fw-bold neutral-dark">{listing.title}</h1>
          <p className="text-sm mt-sm">
            by <span className="fw-medium">{listing.provider}</span> · ⭐ {listing.rating} ({listing.reviews} reviews) · ⏱ {listing.responseTime} response
          </p>

          <p className="service-details-text mt-lg">{listing.description}</p>

          <div className="service-meta mt-xl">
            <div className="service-meta-item">
              <span className="fw-semibold">Category:</span>
              <span>{listing.category}</span>
            </div>
            <div className="service-meta-item">
              <span className="fw-semibold">Location:</span>
              <span>{listing.location}</span>
            </div>
            <div className="service-meta-item">
              <span className="fw-semibold">Price:</span>
              <span className="primary-base fw-bold">TZS {listing.price.toLocaleString()}</span>
            </div>
            <div className="service-meta-item">
              <span className="fw-semibold">Availability:</span>
              <span className="badge badge-success">{listing.availability}</span>
            </div>
          </div>

          <div className="flex gap-md mt-xl">
            <button className="book-service-btn" onClick={handleBook}>Book Now</button>
            <button className="btn btn-outline" onClick={() => navigate(-1)}>Back</button>
          </div>
        </div>
      </section>
    </main>
  );
}
