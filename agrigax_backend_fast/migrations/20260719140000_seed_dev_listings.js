// Development seed: 12 approved, available listings owned by the dev vendors
// (vendor1 / vendor2 from 20260719100000_seed_dev_accounts), spread across
// real Tanzanian locations with coordinates so the smart search, views,
// catalog pictures and "Near Me" features all have data to work with.
//
// Idempotent: skips any listing whose title already exists.

const CROPS_CATEGORY = {
  name: "Crops & Produce",
  slug: "crops-produce",
  description: "Harvested crops, grains, fruits and vegetables",
};

// vendor: 1 -> vendor1, 2 -> vendor2 (resolved to real ids at runtime)
const LISTINGS = [
  {
    vendor: 1, type: "product", category: "Crops & Produce",
    title: "Maharage ya Kigoma - Grade A",
    description: "Fresh red beans from Kigoma highlands, well dried and sorted. Available in 50kg and 100kg bags.",
    location: "Kigoma", latitude: -4.8828, longitude: 29.6615,
    price: 3500, image: "/catalog/beans.svg", views: 42,
  },
  {
    vendor: 1, type: "product", category: "Crops & Produce",
    title: "Mahindi Kavu - Wholesale",
    description: "Dry maize harvested this season, moisture-tested and clean. Minimum order 10 bags.",
    location: "Dodoma", latitude: -6.1722, longitude: 35.7395,
    price: 55000, image: "/catalog/maize.svg", views: 67,
  },
  {
    vendor: 1, type: "product", category: "Crops & Produce",
    title: "Mchele wa Mbeya - Super Grade",
    description: "Aromatic rice from Mbeya paddies. Polished and packed in 25kg bags.",
    location: "Mbeya", latitude: -8.9094, longitude: 33.4608,
    price: 62000, image: "/catalog/rice.svg", views: 89,
  },
  {
    vendor: 1, type: "product", category: "Crops & Produce",
    title: "Nyanya Fresh - Kila Siku",
    description: "Fresh tomatoes picked daily from our greenhouse in Morogoro. Crates of 20kg.",
    location: "Morogoro", latitude: -6.8278, longitude: 37.6591,
    price: 28000, image: "/catalog/tomatoes.svg", views: 31,
  },
  {
    vendor: 1, type: "livestock", category: "Livestock",
    title: "Kuku wa Kienyeji - Wazima",
    description: "Free-range local chickens, vaccinated and healthy. Sold per bird or in batches of 10.",
    location: "Buza, Temeke, Dar es Salaam", latitude: -6.8734, longitude: 39.2440,
    price: 15000, image: "/catalog/chicken.svg", views: 120,
  },
  {
    vendor: 1, type: "product", category: "Crops & Produce",
    title: "Mayai ya Kienyeji - Trei",
    description: "Organic free-range eggs collected daily. Sold per tray of 30.",
    location: "Kinondoni, Dar es Salaam", latitude: -6.7724, longitude: 39.2243,
    price: 12000, image: "/catalog/eggs.svg", views: 54,
  },
  {
    vendor: 2, type: "equipment", category: "Equipment",
    title: "Tractor Rental with Operator",
    description: "Massey Ferguson 385 with experienced operator. Ploughing, harrowing and planting services per acre.",
    location: "Arusha", latitude: -3.3869, longitude: 36.6830,
    price: 80000, image: "/catalog/tractor.svg", views: 156,
  },
  {
    vendor: 2, type: "equipment", category: "Irrigation",
    title: "Water Pump Hire - Honda 3 inch",
    description: "Petrol water pump for irrigation, comes with 50m of pipes. Daily and weekly rates.",
    location: "Moshi", latitude: -3.3516, longitude: 37.3389,
    price: 25000, image: "/catalog/water-pump.svg", views: 43,
  },
  {
    vendor: 2, type: "product", category: "Crops & Produce",
    title: "Mbolea ya Samadi - Composted",
    description: "Well-composted organic manure, ready for use. Sold per ton, delivery available.",
    location: "Iringa", latitude: -7.7700, longitude: 35.6900,
    price: 90000, image: "/catalog/fertilizer.svg", views: 28,
  },
  {
    vendor: 2, type: "service", category: "Technology",
    title: "Agronomist Farm Visit & Advice",
    description: "Certified agronomist for soil assessment, crop planning and pest management advice. Per visit.",
    location: "Mwanza", latitude: -2.5164, longitude: 32.9175,
    price: 50000, image: "/catalog/agronomist.svg", views: 74,
  },
  {
    vendor: 2, type: "service", category: "Technology",
    title: "Crop Doctor - Disease Diagnosis",
    description: "On-site plant disease diagnosis and treatment plan. Covers fungal, bacterial and pest damage.",
    location: "Tanga", latitude: -5.0703, longitude: 39.0993,
    price: 40000, image: "/catalog/crop-doctor.svg", views: 61,
  },
  {
    vendor: 2, type: "worker", category: "Labor",
    title: "Vibarua wa Shamba - Timu ya 5",
    description: "Experienced farm labor team of 5 for weeding, harvesting and planting. Daily rate per team.",
    location: "Morogoro", latitude: -6.8215, longitude: 37.6538,
    price: 60000, image: "/catalog/farm-labor.svg", views: 37,
  },
];

exports.up = async function (knex) {
  const vendor1 = await knex("users").where({ username: "vendor1" }).first();
  const vendor2 = await knex("users").where({ username: "vendor2" }).first();

  if (!vendor1 || !vendor2) {
    // Dev accounts not seeded (e.g. production) — skip silently
    return;
  }

  let crops = await knex("categories").where({ slug: CROPS_CATEGORY.slug }).first();
  if (!crops) {
    const [id] = await knex("categories").insert({ ...CROPS_CATEGORY, is_active: true });
    crops = { id };
  }

  const categoryIds = {};
  for (const row of await knex("categories").select("id", "name")) {
    categoryIds[row.name] = row.id;
  }

  for (const item of LISTINGS) {
    const existing = await knex("listings").where({ title: item.title }).first();
    if (existing) continue;

    const [listingId] = await knex("listings").insert({
      title: item.title,
      description: item.description,
      type: item.type,
      category_id: categoryIds[item.category] || crops.id,
      location: item.location,
      latitude: item.latitude,
      longitude: item.longitude,
      price: item.price,
      views: item.views,
      is_available: true,
      is_approved: true,
      provider_id: item.vendor === 1 ? vendor1.id : vendor2.id,
    });

    await knex("listing_images").insert({
      listing_id: listingId,
      url: item.image,
      is_primary: true,
    });
  }
};

exports.down = async function (knex) {
  const titles = LISTINGS.map((l) => l.title);
  const rows = await knex("listings").whereIn("title", titles).select("id");
  const ids = rows.map((r) => r.id);

  if (ids.length) {
    await knex("listing_images").whereIn("listing_id", ids).del();
    await knex("listings").whereIn("id", ids).del();
  }
};
