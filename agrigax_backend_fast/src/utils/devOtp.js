module.exports.shouldExposeDevOtp = () =>
  process.env.NODE_ENV !== "production" || process.env.EXPOSE_OTP === "true";

module.exports.attachDevOtp = (data, otp) => {
  if (!module.exports.shouldExposeDevOtp() || !otp) {
    return data;
  }

  const payload = data ? { ...data } : {};
  payload.devOtp = otp;
  return payload;
};
