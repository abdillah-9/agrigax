const DEFAULT_CATEGORIES = [
  { name: "Farm Inputs", slug: "farm-inputs", description: "Seeds, fertilizers, and farm supplies" },
  { name: "Equipment", slug: "equipment", description: "Tractors, tools, and machinery" },
  { name: "Labor", slug: "labor", description: "Farm workers and skilled labor" },
  { name: "Livestock", slug: "livestock", description: "Animals and livestock services" },
  { name: "Irrigation", slug: "irrigation", description: "Water systems and irrigation setup" },
  { name: "Transport", slug: "transport", description: "Crop and goods transport" },
  { name: "Technology", slug: "technology", description: "Agri-tech and digital services" },
];

exports.up = async function (knex) {
  const [{ count }] = await knex("categories").count({ count: "*" });

  if (Number(count) > 0) {
    return;
  }

  await knex("categories").insert(
    DEFAULT_CATEGORIES.map((category) => ({
      ...category,
      is_active: true,
    }))
  );
};

exports.down = async function (knex) {
  await knex("categories")
    .whereIn(
      "slug",
      DEFAULT_CATEGORIES.map((category) => category.slug)
    )
    .del();
};
