export function logDevOtp(otp: string | undefined, context: string) {
  if (!import.meta.env.DEV || !otp) return;
  console.info(`[AgriGax dev OTP · ${context}]`, otp);
}

export function isDevOtpVisible() {
  return import.meta.env.DEV;
}
