
import React, { useState } from "react";
import {
  X,
  User,
  Mail,
  ShieldCheck,
  ArrowRight,
  Lock,
  ArrowLeft,
} from "lucide-react";

// interface UserProfile {
//   name: string;
//   email: string;
// }
// import type { ApiReader } from "../../features/blog/services/blogApi";
import {
  registerReader,
  loginReader,
  verifyReaderOTP,
  requestReaderPasswordReset,
  verifyReaderPasswordResetOTP,
  confirmReaderPasswordReset,
  resendReaderOTP,
} from "../../features/blog/services/blogApi";

import type { ApiIktaraaProfile } from "../../features/blog/services/blogApi";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  // onLoginSuccess: (user: UserProfile) => void;
  onLoginSuccess: (reader: ApiIktaraaProfile) => void;
}

type AuthMode = "login" | "register";

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [step, setStep] = useState<"details" | "otp">("details");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [otp, setOtp] = useState("");

  const [forgotPasswordStep, setForgotPasswordStep] = useState<
      "email" | "otp" | "password" | "success" | null
  >(null);

  const [resetOTP, setResetOTP] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const resetModal = () => {
    setMode("login");
    setStep("details");
    setName("");
    setEmail("");
    setOtp("");
    setError("");
    setMessage("");
    setLoading(false);
    setMobileNumber("");
    setPassword("");
    setPasswordConfirm("");
    setForgotPasswordStep(null);
    setResetOTP("");
    setNewPassword("");
    setNewPasswordConfirm("");
  };

  const closeModal = () => {
    resetModal();
    onClose();
  };

  const getErrorMessage = (data: any): string => {
    if (typeof data?.detail === "string") {
      return data.detail;
    }

    if (typeof data?.email === "string") {
      return data.email;
    }

    if (Array.isArray(data?.email)) {
      return data.email[0];
    }

    if (typeof data?.full_name === "string") {
      return data.full_name;
    }

    if (Array.isArray(data?.full_name)) {
      return data.full_name[0];
    }

    if (typeof data?.otp === "string") {
      return data.otp;
    }

    if (Array.isArray(data?.otp)) {
      return data.otp[0];
    }

    return "Something went wrong. Please try again.";
  };

  
  const requestOTP = async () => {
    setError("");
    setMessage("");

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (mode === "register") {
      if (!name.trim()) {
        setError("Please enter your full name.");
        return;
      }

      if (!mobileNumber.trim()) {
        setError("Please enter your mobile number.");
        return;
      }

      if (!password) {
        setError("Please enter a password.");
        return;
      }

      if (password !== passwordConfirm) {
        setError("Passwords do not match.");
        return;
      }
    }

    setLoading(true);

    try {
      await registerReader(
        name.trim(),
        email.trim(),
        mobileNumber.trim(),
        password,
        passwordConfirm
      );

      setEmail(email.trim().toLowerCase());
      setStep("otp");
      setMessage(
        "Your account has been created. We have sent a verification code to your email."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create your account."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
      setLoading(true);
      setError("");
      setMessage("");

      try {
          const response = await resendReaderOTP(email);
          setMessage(response.detail || "Verification code sent.");
      } catch (err) {
          setError(
              err instanceof Error
                  ? err.message
                  : "Unable to resend verification code."
          );
      } finally {
          setLoading(false);
      }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const response = await loginReader(
        email.trim(),
        password,
        "blog"
      );

      onLoginSuccess(response.reader);

      resetModal();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to sign in."
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordResetRequest = async () => {
      if (!email.trim()) {
          setError("Please enter your registered email address.");
          return;
      }

      setLoading(true);
      setError("");
      setMessage("");

      try {
          const response = await requestReaderPasswordReset(email);

          setForgotPasswordStep("otp");
          setMessage(response.detail);
      } catch (err) {
          setError(
              err instanceof Error
                  ? err.message
                  : "Unable to request password reset."
          );
      } finally {
          setLoading(false);
      }
  };


  const handlePasswordResetVerify = async () => {
      if (!/^\d{6}$/.test(resetOTP.trim())) {
          setError("Please enter a valid six-digit OTP.");
          return;
      }

      setLoading(true);
      setError("");
      setMessage("");

      try {
          const response = await verifyReaderPasswordResetOTP(
              email,
              resetOTP
          );

          setForgotPasswordStep("password");
          setMessage(response.detail);
      } catch (err) {
          setError(
              err instanceof Error
                  ? err.message
                  : "OTP verification failed."
          );
      } finally {
          setLoading(false);
      }
  };


  const handlePasswordResetConfirm = async () => {
      if (!newPassword || !newPasswordConfirm) {
          setError("Please enter and confirm your new password.");
          return;
      }

      if (newPassword !== newPasswordConfirm) {
          setError("Passwords do not match.");
          return;
      }

      setLoading(true);
      setError("");
      setMessage("");

      try {
          const response = await confirmReaderPasswordReset(
              email,
              resetOTP,
              newPassword,
              newPasswordConfirm
          );

          setForgotPasswordStep("success");
          setMessage(response.detail);

          setPassword("");
          setNewPassword("");
          setNewPasswordConfirm("");
          setResetOTP("");
      } catch (err) {
          setError(
              err instanceof Error
                  ? err.message
                  : "Unable to reset password."
          );
      } finally {
          setLoading(false);
      }
  };


  const verifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter the six-digit verification code.");
      return;
    }

    setLoading(true);

    try {
      const response = await verifyReaderOTP(
        email,
        otp,
        "blog"
      );

      onLoginSuccess(response.reader);

      resetModal();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to verify your code."
      );
    } finally {
      setLoading(false);
    }
  };


  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setStep("details");
    setName("");
    setEmail("");
    setOtp("");
    setError("");
    setMessage("");
    setMobileNumber("");
    setPassword("");
    setPasswordConfirm("");
    setForgotPasswordStep(null);
    setResetOTP("");
    setNewPassword("");
    setNewPasswordConfirm("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">

        {/* Close Button */}
        <button
          onClick={closeModal}
          disabled={loading}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
          aria-label="Close login dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <img
              src="/iktaraa.svg"
              alt="Iktaraa"
              className="h-8 sm:h-10 lg:h-12 w-auto object-contain"
            />
          </div>

          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {forgotPasswordStep !== null
              ? forgotPasswordStep === "email"
                ? "Forgot Password?"
                : forgotPasswordStep === "otp"
                  ? "Verify Reset Code"
                  : forgotPasswordStep === "password"
                    ? "Create New Password"
                    : "Password Reset Successful"
              : step === "otp"
                ? "Verify Your Email"
                : mode === "login"
                  ? "Sign In to Iktaraa"
                  : "Create Your Account"}
          </h3>

          <p className="text-xs text-slate-500">
            {step === "otp"
              ? `Enter the six-digit code sent to ${email}`
              : "Join the musician community, comment on stories, and bookmark guides"}
          </p>
        </div>

        {/* Account Information */}
        <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200/80 text-xs text-teal-900 space-y-1.5">
          <div className="font-bold flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-teal-700" />
            Blog Reader Account
          </div>

          <p className="text-[11px] text-teal-800 leading-relaxed">
            Your Iktaraa account is shared between Blog and Events.
            Sign in with the same email and password on both platforms.
            New accounts require email verification using a one-time password.
          </p>
        </div>

        {/* Messages */}
        {error && (
          <p className="text-xs text-rose-600 font-semibold bg-rose-50 p-2.5 rounded-xl border border-rose-200">
            {error}
          </p>
        )}

        {message && (
          <p className="text-xs text-teal-700 font-semibold bg-teal-50 p-2.5 rounded-xl border border-teal-200">
            {message}
          </p>
        )}


        {/* Forgot Password Flow */}
        {forgotPasswordStep !== null && (
          <div className="space-y-4">

            {forgotPasswordStep === "email" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void handlePasswordResetRequest();
                }}
                className="space-y-4"
              >
                <p className="text-xs text-slate-600">
                  Enter your registered email address. If an eligible account exists,
                  we will send you a password-reset code.
                </p>

                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter your registered email"
                  autoComplete="email"
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-[#189BA3] hover:bg-[#147e85] disabled:opacity-60 text-white font-bold text-xs"
                >
                  {loading ? "Sending..." : "Send Reset Code"}
                </button>
              </form>
            )}

            {forgotPasswordStep === "otp" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void handlePasswordResetVerify();
                }}
                className="space-y-4"
              >
                <p className="text-xs text-slate-600">
                  Enter the six-digit password-reset code sent to {email}.
                </p>

                <input
                  type="text"
                  required
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={resetOTP}
                  onChange={(e) => {
                    setResetOTP(e.target.value.replace(/\D/g, "").slice(0, 6));
                    setError("");
                  }}
                  placeholder="Enter six-digit OTP"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-center tracking-[0.5em] text-lg font-bold"
                />

                <button
                  type="submit"
                  disabled={loading || resetOTP.length !== 6}
                  className="w-full py-2.5 rounded-xl bg-[#189BA3] hover:bg-[#147e85] disabled:opacity-60 text-white font-bold text-xs"
                >
                  {loading ? "Verifying..." : "Verify Code"}
                </button>
              </form>
            )}

            {forgotPasswordStep === "password" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void handlePasswordResetConfirm();
                }}
                className="space-y-4"
              >
                <p className="text-xs text-slate-600">
                  Choose a new password for your Iktaraa account.
                </p>

                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="New password"
                  autoComplete="new-password"
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-xs"
                />

                <input
                  type="password"
                  required
                  value={newPasswordConfirm}
                  onChange={(e) => {
                    setNewPasswordConfirm(e.target.value);
                    setError("");
                  }}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-xs"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-[#189BA3] hover:bg-[#147e85] disabled:opacity-60 text-white font-bold text-xs"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            )}

            {forgotPasswordStep === "success" && (
              <div className="text-center space-y-4">
                <ShieldCheck className="w-12 h-12 text-teal-600 mx-auto" />

                <p className="text-sm font-bold text-slate-800">
                  Your password has been reset successfully.
                </p>

                <p className="text-xs text-slate-500">
                  Please sign in using your new password.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setForgotPasswordStep(null);
                    setResetOTP("");
                    setNewPassword("");
                    setNewPasswordConfirm("");
                    setPassword("");
                    setError("");
                    setMessage("");
                    setMode("login");
                    setStep("details");
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#189BA3] hover:bg-[#147e85] text-white font-bold text-xs"
                >
                  Back to Sign In
                </button>
              </div>
            )}

            {forgotPasswordStep !== "success" && (
              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  setForgotPasswordStep(null);
                  setResetOTP("");
                  setNewPassword("");
                  setNewPasswordConfirm("");
                  setError("");
                  setMessage("");
                }}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Sign In
              </button>
            )}

          </div>
        )}


        {/* Details Step */}
        {step === "details" && forgotPasswordStep === null && (
          <>
            
          <form
            onSubmit={(e) => {
              e.preventDefault();

              if (mode === "login") {
                void handlePasswordLogin(e);
              } else {
                void requestOTP();
              }
            }}
            className="space-y-4"
          >
            <div className="space-y-3">

              {/* Full Name - Registration Only */}
              {mode === "register" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Full Name
                  </label>

                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setError("");
                      }}
                      placeholder="Enter your full name"
                      autoComplete="name"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>
              )}

              {/* Mobile Number - Registration Only */}
              {mode === "register" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mobile Number
                  </label>

                  <input
                    type="tel"
                    required
                    value={mobileNumber}
                    onChange={(e) => {
                      setMobileNumber(e.target.value);
                      setError("");
                    }}
                    placeholder="Enter your mobile number"
                    autoComplete="tel"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address
                </label>

                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>

                {mode === "register" && (
                  <p className="text-[10px] text-slate-400 mt-1">
                    Your name and email will be displayed on your comments.
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password
                </label>

                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    placeholder="Enter your password"
                    autoComplete={
                      mode === "login" ? "current-password" : "new-password"
                    }
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>


              {mode === "login" && (
                <div className="flex justify-end -mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotPasswordStep("email");
                      setError("");
                      setMessage("");
                    }}
                    className="text-xs font-bold text-[#189BA3] hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}


              {/* Confirm Password - Registration Only */}
              {mode === "register" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Confirm Password
                  </label>

                  <input
                    type="password"
                    required
                    value={passwordConfirm}
                    onChange={(e) => {
                      setPasswordConfirm(e.target.value);
                      setError("");
                    }}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-[#189BA3] hover:bg-[#147e85] disabled:opacity-60 active:scale-95 text-white font-bold text-xs shadow-md shadow-teal-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {loading
                  ? mode === "login"
                    ? "Signing in..."
                    : "Creating account..."
                  : mode === "register"
                    ? "Create Account & Send OTP"
                    : "Sign In"}

                {!loading && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          </form>


            {/* Switch Login / Registration */}
            <div className="text-center text-xs text-slate-500">
              {mode === "login" ? (
                <>
                  New to Iktaraa Blog?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("register")}
                    className="font-bold text-[#189BA3] hover:underline"
                  >
                    Create an account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className="font-bold text-[#189BA3] hover:underline"
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>
          </>
        )}

        {/* OTP Verification Step */}
        {step === "otp" && forgotPasswordStep === null && (
          <form onSubmit={verifyOTP} className="space-y-4">

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Six-Digit Verification Code
              </label>

              <input
                type="text"
                required
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                  setError("");
                }}
                placeholder="Enter OTP"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-center tracking-[0.5em] text-lg font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-2.5 rounded-xl bg-[#189BA3] hover:bg-[#147e85] disabled:opacity-60 active:scale-95 text-white font-bold text-xs shadow-md shadow-teal-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {loading ? "Verifying..." : "Verify & Sign In"}
              {!loading && <ShieldCheck className="w-3.5 h-3.5" />}
            </button>

            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  setStep("details");
                  setOtp("");
                  setError("");
                  setMessage("");
                }}
                className="text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Change email
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={handleResendOTP}
                className="font-bold text-[#189BA3] hover:underline disabled:opacity-50"
              >
                {loading ? "Sending..." : "Resend OTP"}
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
          <span>Secure authentication for Iktaraa Blog Readers</span>
        </div>
      </div>
    </div>
  );
};

