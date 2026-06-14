module.exports.normalizePhone = (phone = "") => {
  const digits = String(phone).replace(/\D/g, "");

  if (digits.startsWith("255")) {
    return `+${digits}`;
  }

  if (digits.startsWith("0")) {
    return `+255${digits.slice(1)}`;
  }

  if (digits.length === 9) {
    return `+255${digits}`;
  }

  return phone.trim();
};
