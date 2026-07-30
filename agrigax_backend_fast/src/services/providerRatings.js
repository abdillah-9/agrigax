const AppError = require("../errors/AppError");
const { getUserById } = require("../repositories/users");
const {
  upsertRating,
  findByProviderAndCustomer,
  getAggregateForProvider,
  hasInteraction,
} = require("../repositories/providerRatings");

const assertProvider = async (providerId) => {
  const provider = await getUserById(providerId);

  if (!provider || provider.is_suspended || provider.active_role !== "provider") {
    throw new AppError("Provider not found", 404);
  }

  return provider;
};

// Aggregate rating for a vendor, plus (when a viewer is authenticated) their
// own rating and whether they're allowed to rate — the frontend uses this to
// decide whether to show the rating control.
module.exports.getProviderRating = async (providerId, viewerId = null) => {
  await assertProvider(providerId);

  const aggregate = await getAggregateForProvider(providerId);

  let myRating = null;
  let canRate = false;

  if (viewerId && Number(viewerId) !== Number(providerId)) {
    const [existing, interacted] = await Promise.all([
      findByProviderAndCustomer(providerId, viewerId),
      hasInteraction(providerId, viewerId),
    ]);

    myRating = existing ? Number(existing.rating) : null;
    canRate = interacted;
  }

  return { ...aggregate, myRating, canRate };
};

// Customer rates a vendor they've interacted with (accepted/completed booking).
module.exports.rateProvider = async (customerId, providerId, body) => {
  await assertProvider(providerId);

  if (Number(customerId) === Number(providerId)) {
    throw new AppError("You cannot rate yourself", 400);
  }

  const interacted = await hasInteraction(providerId, customerId);

  if (!interacted) {
    throw new AppError("You can only rate a vendor after a booking with them", 403);
  }

  await upsertRating({
    provider_id: providerId,
    customer_id: customerId,
    rating: body.rating,
    comment: body.comment || null,
  });

  return module.exports.getProviderRating(providerId, customerId);
};
