import "../styles/bookings.css";

export default function BookingDetails() {
  return (
    <main className="p-xl">
      <div className="mb-xl">
        <h1 className="text-2xl fw-bold neutral-dark">Booking Details</h1>
        <p className="text-sm mt-sm">Booking #BK-001</p>
      </div>

      <section className="service-details-card shadow-md radius-lg">
        <div className="service-details-content">
          <h2 className="text-xl fw-bold neutral-dark">Tractor Rental Service</h2>
          <p className="text-sm mt-sm">Provided by Kilimo Best Supplies</p>

          <div className="service-meta mt-xl">
            <div className="service-meta-item">
              <span className="fw-semibold">Status:</span>
              <span className="badge badge-success">Confirmed</span>
            </div>
            <div className="service-meta-item">
              <span className="fw-semibold">Date:</span>
              <span>20 May 2026</span>
            </div>
            <div className="service-meta-item">
              <span className="fw-semibold">Location:</span>
              <span>Morogoro</span>
            </div>
            <div className="service-meta-item">
              <span className="fw-semibold">Amount:</span>
              <span className="primary-base fw-bold">TZS 120,000</span>
            </div>
            <div className="service-meta-item">
              <span className="fw-semibold">Payment Status:</span>
              <span className="badge badge-success">Paid</span>
            </div>
          </div>

          <div className="flex gap-md mt-xl">
            <button className="booking-outline-btn">Contact Provider</button>
            <button className="booking-danger-btn">Cancel Booking</button>
          </div>
        </div>
      </section>
    </main>
  );
}
