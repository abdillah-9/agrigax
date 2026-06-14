import { type FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  HiArrowLeft,
  HiStar,
  HiTag,
  HiMapPin,
  HiCurrencyDollar,
  HiCheckCircle,
  HiXMark,
  HiHeart,
} from "react-icons/hi2";
import { useListings } from "../../../hooks/useListings";
import { useCategories } from "../../../hooks/useCategories";
import { useUsers } from "../../../hooks/useUsers";
import { useBookings } from "../../../hooks/useBookings";
import { useFavorites } from "../../../hooks/useFavorites";
import { useReviews } from "../../../hooks/useReviews";
import { useAuthContext } from "../../../contexts/AuthContext";
import {
  categoryNameById,
  formatListingType,
  listingImageStyle,
} from "../../../api/listingHelpers";
import {
  clearReviewLookupCache,
  enrichReviews,
  formatReviewDate,
} from "../../../api/reviewHelpers";
import type { Category, EnrichedReview, Listing } from "../../../types/api.types";
import "../styles/listings.css";

export default function ListingDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthContext();
  const { fetchListingById, loading, error } = useListings();
  const { fetchCategories } = useCategories();
  const { fetchUserById } = useUsers();
  const { createBooking, loading: bookingLoading, error: bookingError } = useBookings();
  const { fetchFavorites, toggleFavorite, loading: favoriteLoading } = useFavorites();
  const { fetchReviews, createReview, deleteReview, loading: reviewLoading, error: reviewError } = useReviews();

  const [listing, setListing] = useState<Listing | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [providerName, setProviderName] = useState<string>("Provider");
  const [isFavorited, setIsFavorited] = useState(false);
  const [reviews, setReviews] = useState<EnrichedReview[]>([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [showBookModal, setShowBookModal] = useState(false);
  const [bookDate, setBookDate] = useState("");
  const [bookNotes, setBookNotes] = useState("");
  const [bookMessage, setBookMessage] = useState<string | null>(null);

  const backPath = location.pathname.includes("/provider") ? "/provider/browse" : "/app/listings";

  useEffect(() => {
    if (!id) return;

    fetchListingById(id).then(setListing);
    fetchCategories().then(setCategories);
  }, [id, fetchListingById, fetchCategories]);

  useEffect(() => {
    if (!listing?.providerId) return;
    fetchUserById(listing.providerId).then((provider) => {
      if (provider) setProviderName(provider.fullName);
    });
  }, [listing?.providerId, fetchUserById]);

  useEffect(() => {
    if (!user || !listing?.id) {
      setIsFavorited(false);
      return;
    }

    fetchFavorites().then((favs) => {
      setIsFavorited(favs.some((f) => f.listingId === listing.id));
    });
  }, [user, listing?.id, fetchFavorites]);

  useEffect(() => {
    if (!listing?.id) return;

    clearReviewLookupCache();
    fetchReviews(listing.id).then(async (rows) => {
      setReviews(await enrichReviews(rows));
    });
  }, [listing?.id, fetchReviews]);

  async function loadReviews() {
    if (!listing?.id) return;
    clearReviewLookupCache();
    const rows = await fetchReviews(listing.id);
    setReviews(await enrichReviews(rows));
    fetchListingById(listing.id).then(setListing);
  }

  async function handleToggleFavorite() {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!listing) return;

    const ok = await toggleFavorite(listing.id, isFavorited);
    if (ok) setIsFavorited(!isFavorited);
  }

  async function handleSubmitReview(e: FormEvent) {
    e.preventDefault();
    if (!user?.isVerified) {
      navigate("/verify-otp", { state: { phone: user?.phone, purpose: "registration" } });
      return;
    }
    if (!listing) return;

    const result = await createReview({
      listingId: listing.id,
      rating: reviewRating,
      comment: reviewComment.trim() || undefined,
    });

    if (!result) return;

    setReviewComment("");
    setReviewRating(5);
    await loadReviews();
  }

  async function handleDeleteReview(reviewId: string) {
    const ok = await deleteReview(reviewId);
    if (ok) await loadReviews();
  }

  const myReview = user ? reviews.find((r) => r.userId === user.id) : undefined;

  if (loading && !listing) {
    return (
      <main className="customer-page">
        <p className="listings-count-text">Loading listing...</p>
      </main>
    );
  }

  if (error || !listing) {
    return (
      <main className="customer-page">
        <button className="back-nav-btn" onClick={() => navigate(backPath)}>
          <HiArrowLeft />
          Back to Listings
        </button>
        <div className="listings-empty">
          <h3 className="listings-empty-title">Listing not found</h3>
          <p className="listings-empty-text">{error || "This listing may have been removed."}</p>
        </div>
      </main>
    );
  }

  const handleBook = () => {
    if (!user?.isVerified) {
      navigate("/verify-otp", { state: { phone: user?.phone, purpose: "registration" } });
      return;
    }
    if (user?.id === listing?.providerId) {
      setBookMessage("You cannot book your own listing.");
      return;
    }
    setBookMessage(null);
    setShowBookModal(true);
  };

  async function handleSubmitBooking(e: FormEvent) {
    e.preventDefault();
    if (!listing || !bookDate) return;

    const result = await createBooking({
      listingId: listing.id,
      date: bookDate,
      notes: bookNotes.trim() || undefined,
    });

    if (!result) return;

    setShowBookModal(false);
    navigate("/app/bookings");
  }

  const minDate = new Date().toISOString().split("T")[0];

  return (
    <main className="customer-page">
      <button className="back-nav-btn" onClick={() => navigate(backPath)}>
        <HiArrowLeft />
        Back to Listings
      </button>

      <section className="service-details-card">
        <div className="service-details-image" style={listingImageStyle(listing)} />
        <div className="service-details-content">
          <div className="service-details-badges">
            <span className="badge badge-info">{formatListingType(listing.type)}</span>
            <span className="badge badge-default">
              {categoryNameById(categories, listing.categoryId)}
            </span>
          </div>

          <h1 className="customer-page-title" style={{ marginTop: 8 }}>{listing.title}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <p className="customer-page-subtitle" style={{ margin: 0 }}>
              by <span className="fw-medium">{providerName}</span>
              {" · "}
              <span className="service-rating">
                <HiStar className="service-rating-icon" /> {listing.ratingAvg.toFixed(1)}
              </span>
              {" "}({reviews.length || listing.ratingCount} reviews)
            </p>
            <button
              type="button"
              className="back-outline-btn"
              onClick={handleToggleFavorite}
              disabled={favoriteLoading}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                color: isFavorited ? "#c2410c" : undefined,
              }}
            >
              <HiHeart style={{ fill: isFavorited ? "currentColor" : "none" }} />
              {isFavorited ? "Saved" : "Save"}
            </button>
          </div>

          <p className="service-details-text">{listing.description}</p>

          <div className="service-meta">
            <div className="service-meta-item">
              <HiTag className="details-meta-icon" />
              <span className="fw-semibold">Category:</span>
              <span>{categoryNameById(categories, listing.categoryId)}</span>
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
              <span className={`badge ${listing.isAvailable ? "badge-success" : "badge-default"}`}>
                {listing.isAvailable ? "Available" : "Unavailable"}
              </span>
            </div>
          </div>

          <div className="service-actions">
            {bookMessage && (
              <p className="listings-count-text" style={{ color: "#b42318", marginBottom: 8 }}>{bookMessage}</p>
            )}
            <button className="book-service-btn" onClick={handleBook} disabled={!listing.isAvailable}>
              Book Now
            </button>
            <button className="back-outline-btn" onClick={() => navigate(backPath)}>Back</button>
          </div>
        </div>
      </section>

      <section className="service-details-card" style={{ marginTop: 24 }}>
        <div className="service-details-content">
          <h2 className="customer-page-title" style={{ fontSize: "1.25rem" }}>Reviews</h2>

          {reviewLoading && reviews.length === 0 ? (
            <p className="listings-count-text">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p className="listings-count-text">No reviews yet. Be the first to review this listing.</p>
          ) : (
            <div className="flex flex-col gap-md" style={{ marginTop: 16 }}>
              {reviews.map((review) => (
                <div
                  key={review.id}
                  style={{
                    padding: "12px 0",
                    borderBottom: "1px solid rgba(0,0,0,0.06)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <strong>{review.authorName}</strong>
                    <span className="service-rating">
                      <HiStar className="service-rating-icon" /> {review.rating}/5
                    </span>
                  </div>
                  <p className="text-sm" style={{ margin: "6px 0" }}>
                    {review.comment || "No comment provided."}
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="text-sm">{formatReviewDate(review.createdAt)}</span>
                    {user?.id === review.userId && (
                      <button
                        type="button"
                        className="booking-danger-btn"
                        onClick={() => handleDeleteReview(review.id)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {user && !myReview && (
            <form onSubmit={handleSubmitReview} style={{ marginTop: 20 }}>
              <h3 className="text-lg fw-semibold">Write a review</h3>
              {!user.isVerified && (
                <p className="listings-count-text">Verify your account to leave a review.</p>
              )}
              {reviewError && (
                <p className="listings-count-text" style={{ color: "#b42318" }}>{reviewError}</p>
              )}
              <div className="listing-form-field" style={{ maxWidth: 200, marginTop: 12 }}>
                <label className="label">Rating</label>
                <select
                  className="input-select"
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                  disabled={!user.isVerified}
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>{n} stars</option>
                  ))}
                </select>
              </div>
              <div className="listing-form-field listing-form-field-full" style={{ marginTop: 12 }}>
                <label className="label">Comment (optional)</label>
                <textarea
                  className="input-textarea"
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  disabled={!user.isVerified}
                />
              </div>
              <button
                type="submit"
                className="btn-withdraw"
                style={{ marginTop: 12 }}
                disabled={!user.isVerified || reviewLoading}
              >
                {reviewLoading ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          )}

          {myReview && (
            <p className="listings-count-text" style={{ marginTop: 16 }}>
              You already reviewed this listing.
            </p>
          )}
        </div>
      </section>

      {showBookModal && (
        <div className="provider-modal-backdrop" onClick={() => setShowBookModal(false)}>
          <div className="provider-modal" onClick={(e) => e.stopPropagation()}>
            <div className="provider-modal-header">
              <div className="provider-modal-header-left">
                <div>
                  <h3 className="provider-modal-title">Book Service</h3>
                  <p className="provider-modal-subtitle">{listing.title}</p>
                </div>
              </div>
              <button className="provider-modal-close" onClick={() => setShowBookModal(false)}>
                <HiXMark />
              </button>
            </div>
            <form className="provider-modal-body" onSubmit={handleSubmitBooking}>
              {bookingError && (
                <p className="listings-count-text" style={{ color: "#b42318" }}>{bookingError}</p>
              )}
              <div className="listing-form-field listing-form-field-full">
                <label className="label label-required">Preferred date</label>
                <input
                  className="input-text"
                  type="date"
                  min={minDate}
                  value={bookDate}
                  onChange={(e) => setBookDate(e.target.value)}
                  required
                />
              </div>
              <div className="listing-form-field listing-form-field-full">
                <label className="label">Notes (optional)</label>
                <textarea
                  className="input-textarea"
                  rows={3}
                  placeholder="Any special instructions..."
                  value={bookNotes}
                  onChange={(e) => setBookNotes(e.target.value)}
                />
              </div>
              <div className="provider-modal-footer">
                <button type="button" className="btn-report" onClick={() => setShowBookModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-withdraw" disabled={bookingLoading}>
                  {bookingLoading ? "Submitting..." : "Confirm Booking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
