const { normalizePhone } = require("./phone");

module.exports.normalizeLoginIdentifier = (identifier = "") => {
  const value = String(identifier).trim();

  if (value.includes("@")) {
    return { type: "email", value: value.toLowerCase() };
  }

  if (/^\+?\d[\d\s-]{7,}$/.test(value)) {
    return { type: "phone", value: normalizePhone(value) };
  }

  return { type: "username", value: value.toLowerCase() };
};
