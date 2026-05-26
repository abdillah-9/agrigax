import "../styles/listings.css";

const categoryServices = [
  { id: "1", title: "Tractor Rental", provider: "Kilimo Best", price: "TZS 120,000", rating: 4.8 },
  { id: "2", title: "Harvester Machine", provider: "Farm Help", price: "TZS 200,000", rating: 4.3 },
  { id: "3", title: "Irrigation Pump", provider: "Green Tech", price: "TZS 85,000", rating: 4.6 },
  { id: "4", title: "Plowing Service", provider: "AgriPro", price: "TZS 90,000", rating: 4.5 },
];

export default function CategoryServices() {
  return (
    <main className="p-xl">
      <div className="mb-xl">
        <h1 className="text-2xl fw-bold neutral-dark">Farm Equipment</h1>
        <p className="text-sm mt-sm">Browse equipment services in this category</p>
      </div>

      <section className="services-grid">
        {categoryServices.map(service => (
          <div key={service.id} className="service-card shadow-md radius-lg">
            <div className="service-image" />
            <div className="service-content">
              <h3 className="text-lg fw-semibold">{service.title}</h3>
              <p className="text-sm mt-sm">{service.provider} · ⭐ {service.rating}</p>
              <div className="service-footer">
                <span className="service-price">{service.price}</span>
                <button className="service-btn">View Details</button>
              </div>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
