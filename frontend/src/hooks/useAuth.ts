import { useState } from "react";
import apiClient from "../api/client";
import { AUTH } from "../api/endpoints";
import { useAuthContext } from "../contexts/AuthContext";
import { logDevOtp } from "../utils/authDev";
import type {
  LoginPayload,
  RegisterPayload,
  AuthResponse,
  ApiResponse,
  DevOtpResponse,
  ForgotPasswordPayload,
  VerifyOtpPayload,
  ResetPasswordPayload,
  User,
} from "../types/api.types";

export function useAuth() {
  const { setUser, clearSession } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (payload: LoginPayload): Promise<AuthResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.post<ApiResponse<AuthResponse>>(AUTH.LOGIN, payload);
      setUser(data.data.user);
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload: RegisterPayload): Promise<AuthResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.post<ApiResponse<AuthResponse>>(AUTH.REGISTER, payload);
      logDevOtp(data.data.devOtp, "registration");
      setUser(data.data.user);
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await apiClient.post(AUTH.LOGOUT);
    } catch {
      // cookie may already be cleared
    } finally {
      clearSession();
      setLoading(false);
      window.location.href = "/login";
    }
  };

  const getMe = async (): Promise<User | null> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get<ApiResponse<AuthResponse>>(AUTH.ME);
      setUser(data.data.user);
      return data.data.user;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch user");
      clearSession();
      return null;
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (payload: ForgotPasswordPayload) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.post<ApiResponse<DevOtpResponse | null>>(AUTH.FORGOT_PASSWORD, payload);
      logDevOtp(data.data?.devOtp, "password reset");
      return { message: data.message || "OTP sent", devOtp: data.data?.devOtp };
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send reset OTP");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async (phone: string, purpose: VerifyOtpPayload["purpose"] = "registration") => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.post<ApiResponse<DevOtpResponse | null>>(AUTH.RESEND_OTP, {
        phone,
        purpose,
      });
      logDevOtp(data.data?.devOtp, purpose);
      return data.data?.devOtp ?? null;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to resend OTP");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (payload: VerifyOtpPayload) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.post<ApiResponse<AuthResponse | null>>(AUTH.VERIFY_OTP, payload);
      if (data.data?.user) {
        setUser(data.data.user);
      }
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || "OTP verification failed");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (payload: ResetPasswordPayload) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.post<ApiResponse<AuthResponse>>(AUTH.RESET_PASSWORD, payload);
      setUser(data.data.user);
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Password reset failed");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    login,
    register,
    logout,
    getMe,
    forgotPassword,
    resendOtp,
    verifyOtp,
    resetPassword,
    loading,
    error,
  };
}
