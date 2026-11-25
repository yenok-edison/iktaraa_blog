import React, { useEffect, useState } from "react";
import {
    X,
    Mail,
    User,
    Building2,
    MapPin,
    FileText,
    ArrowLeft,
    ArrowRight,
    Check,
    CheckCircle2,
    Loader2,
    ShieldCheck,
    LogOut,
    AlertCircle,
    Phone,
    Lock
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { UserAccount } from "../types/event";
// import { IktaraaLogo } from "../../../shared/components/IktaraaLogo";
import { useAuth } from "../../../shared/auth/AuthContext";
import { useEventAuth } from "../context/EventAuthContext";
import { applyForEventHost } from "../services/eventApi";
import { IktaraaLogo } from "./IktaraaLogo";

import {
    registerReader,
    resendReaderOTP,
    loginReader,
    verifyReaderOTP,
    requestReaderPasswordReset,
    verifyReaderPasswordResetOTP,
    confirmReaderPasswordReset,
} from "../../blog/services/blogApi";

/* ─────────────────────────────────────────────────────────────
 * Types & constants
 * ───────────────────────────────────────────────────────────── */

interface LoginModalProps {
    currentUser: UserAccount | null;
    onClose: () => void;
    onLogin: (user: UserAccount) => void;
    onLogout: () => void;
    initialMode?: "login" | "signup";
    initialRole?: "host" | "attendee";
}

type ModalMode = "login" | "signup";
type ModalStep = "details" | "otp" | "host-profile" | "completed";
type ModalRole = "host" | "attendee";

const API_BASE_URL = (
    import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");

/** Shared Tailwind class strings so every control looks consistent. */
const INPUT_BASE =
    "w-full rounded-xl border border-neutral-200 bg-white text-sm text-neutral-800 placeholder:text-neutral-400 outline-none transition focus:border-[#231E59] focus:ring-4 focus:ring-[#231E59]/10";

/* ─────────────────────────────────────────────────────────────
 * Small presentational building blocks
 * (defined outside LoginModal so inputs never lose focus on re-render)
 * ───────────────────────────────────────────────────────────── */

/** Full-screen overlay + card. Handles backdrop click and the Escape key. */
const ModalFrame: React.FC<{
    onClose: () => void;
    maxWidth?: string;
    children: React.ReactNode;
}> = ({ onClose, maxWidth = "max-w-md", children }) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#0E0B2B]/75 p-4 backdrop-blur-sm"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                className={`relative my-auto w-full ${maxWidth} overflow-hidden rounded-3xl bg-white shadow-[0_30px_80px_rgba(0,0,0,0.45)]`}
            >
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full text-white/80 transition hover:bg-white/15 hover:text-white"
                >
                    <X size={20} />
                </button>

                {children}
            </div>
        </div>
    );
};

/** Brand header (#231E59) with logo, title, subtitle and optional step tracker. */
const ModalHeader: React.FC<{
    title: string;
    subtitle: string;
    steps?: string[];
    currentStep?: number;
}> = ({ title, subtitle, steps, currentStep = 0 }) => (
    <div className="relative overflow-hidden bg-[#231E59] px-6 pb-7 pt-8 text-center text-white sm:px-8">
        {/* soft brand glows */}
        {/* <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-[#E34060]/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-14 -left-10 h-40 w-40 rounded-full bg-[#23A2B3]/25 blur-3xl" /> */}

        <div className="relative">
            <div className="mb-5 flex justify-center">
                <IktaraaLogo variant="light" />
            </div>

            <h2 className="text-xl font-bold leading-tight sm:text-2xl">{title}</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-white/70">
                {subtitle}
            </p>

            {steps && steps.length > 1 && (
                <ol className="mx-auto mt-6 flex max-w-xs items-center justify-center">
                    {steps.map((label, index) => {
                        const isDone = index < currentStep;
                        const isCurrent = index === currentStep;

                        return (
                            <li key={label} className="flex items-center">
                                <div className="flex flex-col items-center gap-1.5">
                                    <span
                                        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition ${
                                            isDone
                                                ? "bg-[#23A2B3] text-white"
                                                : isCurrent
                                                  ? "bg-[#E34060] text-white shadow-[0_0_0_4px_rgba(227,64,96,0.25)]"
                                                  : "bg-white/15 text-white/60"
                                        }`}
                                    >
                                        {isDone ? <Check size={14} /> : index + 1}
                                    </span>
                                    <span
                                        className={`text-[10px] font-semibold uppercase tracking-wider ${
                                            isCurrent ? "text-white" : "text-white/50"
                                        }`}
                                    >
                                        {label}
                                    </span>
                                </div>

                                {index < steps.length - 1 && (
                                    <span
                                        className={`mx-2 mb-5 h-px w-8 sm:w-10 ${
                                            isDone ? "bg-[#23A2B3]" : "bg-white/20"
                                        }`}
                                    />
                                )}
                            </li>
                        );
                    })}
                </ol>
            )}
        </div>
    </div>
);

/** Labelled text input with a leading icon. */
const TextField: React.FC<
    React.InputHTMLAttributes<HTMLInputElement> & {
        label: string;
        icon: LucideIcon;
    }
> = ({ label, icon: Icon, className = "", ...inputProps }) => (
    <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-neutral-700">
            {label}
        </span>
        <span className="relative block">
            <Icon
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
                {...inputProps}
                className={`${INPUT_BASE} h-12 pl-11 pr-4 ${className}`}
            />
        </span>
    </label>
);

/** Labelled textarea with a leading icon. */
const TextAreaField: React.FC<
    React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
        label: string;
        icon: LucideIcon;
    }
> = ({ label, icon: Icon, ...textareaProps }) => (
    <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-neutral-700">
            {label}
        </span>
        <span className="relative block">
            <Icon
                size={18}
                className="pointer-events-none absolute left-4 top-4 text-neutral-400"
            />
            <textarea
                {...textareaProps}
                className={`${INPUT_BASE} resize-none py-3 pl-11 pr-4`}
            />
        </span>
    </label>
);

const ErrorNote: React.FC<{ message: string }> = ({ message }) => (
    <div
        role="alert"
        className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 p-3.5 text-sm text-red-700"
    >
        <AlertCircle size={17} className="mt-0.5 shrink-0" />
        <span>{message}</span>
    </div>
);

const InfoNote: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="flex items-start gap-3 rounded-xl border border-[#231E59]/10 bg-[#231E59]/5 p-4 text-sm leading-relaxed text-[#231E59]">
        <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#23A2B3]" />
        <div>{children}</div>
    </div>
);

const PrimaryButton: React.FC<
    React.ButtonHTMLAttributes<HTMLButtonElement> & {
        loading?: boolean;
        loadingText?: string;
    }
> = ({ loading, loadingText = "Please wait...", children, disabled, ...props }) => (
    <button
        {...props}
        disabled={disabled || loading}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#231E59] text-sm font-bold text-white shadow-lg shadow-[#231E59]/25 transition hover:bg-[#2f2677] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
    >
        {loading ? (
            <>
                <Loader2 size={18} className="animate-spin" />
                {loadingText}
            </>
        ) : (
            children
        )}
    </button>
);

const SecondaryButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
    children,
    ...props
}) => (
    <button
        {...props}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-600 transition hover:bg-neutral-50"
    >
        {children}
    </button>
);

/** Centered icon + title + text + action, used for "completed" and "under review". */
const StatusPanel: React.FC<{
    tone: "success" | "pending";
    title: string;
    text: React.ReactNode;
    actionLabel: string;
    onAction: () => void;
}> = ({ tone, title, text, actionLabel, onAction }) => (
    <div className="py-2 text-center">
        <div
            className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full ${
                tone === "success"
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-amber-50 text-amber-600"
            }`}
        >
            {tone === "success" ? <CheckCircle2 size={34} /> : <ShieldCheck size={32} />}
        </div>

        <h3 className="text-xl font-bold text-[#231E59]">{title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-neutral-500">{text}</p>

        <div className="mt-7">
            <PrimaryButton type="button" onClick={onAction}>
                {actionLabel}
                <ArrowRight size={17} />
            </PrimaryButton>
        </div>
    </div>
);

/** Option card used for the Attendee / Event Host choice. */
const RoleCard: React.FC<{
    selected: boolean;
    icon: LucideIcon;
    title: string;
    description: string;
    onSelect: () => void;
}> = ({ selected, icon: Icon, title, description, onSelect }) => (
    <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className={`relative rounded-2xl border-2 p-4 text-left transition ${
            selected
                ? "border-[#E34060] bg-[#E34060]/5"
                : "border-neutral-200 hover:border-neutral-300"
        }`}
    >
        {selected && (
            <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#E34060] text-white">
                <Check size={12} />
            </span>
        )}
        <span
            className={`mb-2.5 flex h-9 w-9 items-center justify-center rounded-xl ${
                selected ? "bg-[#E34060] text-white" : "bg-neutral-100 text-neutral-500"
            }`}
        >
            <Icon size={18} />
        </span>
        <span className="block text-sm font-bold text-[#231E59]">{title}</span>
        <span className="mt-0.5 block text-xs text-neutral-500">{description}</span>
    </button>
);

/* ─────────────────────────────────────────────────────────────
 * Header copy per step
 * ───────────────────────────────────────────────────────────── */

const getHeaderCopy = (step: ModalStep, mode: ModalMode) => {
    switch (step) {
        case "otp":
            return {
                title: "Verify your email",
                subtitle: "Enter the six-digit code sent to your email address.",
            };
        case "host-profile":
            return {
                title: "Host application",
                subtitle: "Tell us about your organization.",
            };
        case "completed":
            return {
                title: "Application submitted",
                subtitle: "Thank you for applying to become an Iktaraa event host.",
            };
        default:
            return {
                title: mode === "login" ? "Welcome back" : "Create your account",
                subtitle:
                    "Discover, book and experience cultural events with Iktaraa.",
            };
    }
};

/* ─────────────────────────────────────────────────────────────
 * Main component
 * ───────────────────────────────────────────────────────────── */

const LoginModal: React.FC<LoginModalProps> = ({
    currentUser,
    onClose,
    onLogout,
    initialMode = "login",
    initialRole = "attendee",
}) => {
    const { login } = useAuth();
    const { refreshHostProfile, hostProfile } = useEventAuth();

    /* ── State ── */
    const [mode, setMode] = useState<ModalMode>(initialMode);
    const [step, setStep] = useState<ModalStep>(
        currentUser && initialRole === "host" ? "host-profile" : "details"
    );
    const [role, setRole] = useState<ModalRole>(initialRole);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [otp, setOtp] = useState("");

    const [organization, setOrganization] = useState("");
    const [city, setCity] = useState("");
    const [bio, setBio] = useState("");

    const [forgotPasswordStep, setForgotPasswordStep] = useState<
        "email" | "otp" | "password" | "success" | null
    >(null);

    const [resetOTP, setResetOTP] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newPasswordConfirm, setNewPasswordConfirm] = useState("");

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    /* ── Helpers ── */
    const getErrorMessage = (err: unknown) => {
        if (err instanceof Error) return err.message;
        return "Something went wrong. Please try again.";
    };

    /* ── Handlers (API behaviour unchanged) ── */
    
    const handleRequestOTP = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();
        setError("");
        setMessage("");

        if (!email.trim()) {
            setError("Please enter your email address.");
            return;
        }

        setLoading(true);

        try {
            if (mode === "signup") {
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

                await registerReader(
                    name.trim(),
                    email.trim(),
                    mobileNumber.trim(),
                    password,
                    passwordConfirm
                );

                setMessage(
                    "Your account has been created. We have sent a verification code to your email."
                );

                setStep("otp");
            }
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };


    const handlePasswordLogin = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();
        setError("");
        setMessage("");

        if (!email.trim()) {
            setError("Please enter your email address.");
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
                "events"
            );

            // The API helper has already stored the shared Django token.
            login(response.reader);

            await refreshHostProfile();

            onClose();
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };


    const handlePasswordResetRequest = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();
        setError("");
        setMessage("");

        if (!email.trim()) {
            setError("Please enter your registered email address.");
            return;
        }

        setLoading(true);

        try {
            const response = await requestReaderPasswordReset(email);
            setForgotPasswordStep("otp");
            setMessage(response.detail);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordResetVerify = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();
        setError("");
        setMessage("");

        if (!/^\d{6}$/.test(resetOTP.trim())) {
            setError("Please enter a valid six-digit OTP.");
            return;
        }

        setLoading(true);

        try {
            const response = await verifyReaderPasswordResetOTP(
                email,
                resetOTP
            );

            setForgotPasswordStep("password");
            setMessage(response.detail);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordResetConfirm = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();
        setError("");
        setMessage("");

        if (!newPassword || !newPasswordConfirm) {
            setError("Please enter and confirm your new password.");
            return;
        }

        if (newPassword !== newPasswordConfirm) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

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
            setResetOTP("");
            setNewPassword("");
            setNewPasswordConfirm("");
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setError("");
        setMessage("");
        setLoading(true);

        try {
            const response = await resendReaderOTP(email);
            setMessage(response.detail || "Verification code sent.");
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };


    const handleVerifyOTP = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");

        if (!/^\d{6}$/.test(otp.trim())) {
            setError("Please enter the six-digit verification code.");
            return;
        }

        setLoading(true);

        try {
            const response = await verifyReaderOTP(email, otp, "events");

            // The API helper has already stored the Django token.
            login(response.reader);

            if (mode === "signup" && role === "host") {
                setMessage(
                    "Your email is verified. Please complete your host application."
                );
                setStep("host-profile");
            } else {
                onClose();
            }
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const handleHostApplication = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            await applyForEventHost({
                organization: organization.trim(),
                bio: bio.trim(),
                city: city.trim(),
            });

            await refreshHostProfile();

            setMessage(
                "Your host application has been submitted successfully. Your profile will become a host profile after admin approval."
            );

            setStep("completed");
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        setError("");
        setMessage("");
        setStep("details");
        setOtp("");
    };

    const handleLogout = () => {
        onLogout();
        onClose();
    };

    const switchMode = (nextMode: ModalMode) => {
        setMode(nextMode);
        setStep("details");
        setError("");
        setMessage("");
        setOtp("");
    };

    /* ─────────────────────────────────────────────
     * View 1 — already signed in
     * ───────────────────────────────────────────── */
    if (currentUser && !(initialRole === "host" && step === "host-profile")) {
        const initial = (currentUser.name || currentUser.email || "?")
            .trim()
            .charAt(0)
            .toUpperCase();

        return (
            <ModalFrame onClose={onClose}>
                <div className="relative overflow-hidden bg-[#231E59] px-8 pb-8 pt-10 text-center text-white">
                    <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-[#E34060]/25 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-14 -left-10 h-40 w-40 rounded-full bg-[#23A2B3]/25 blur-3xl" />

                    <div className="relative">
                        <div className="mb-5 flex justify-center">
                            <IktaraaLogo variant="light" />
                        </div>

                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#E34060] to-[#C02D6F] text-2xl font-black shadow-lg ring-4 ring-white/15">
                            {initial}
                        </div>

                        <h2 className="text-xl font-bold sm:text-2xl">
                            Welcome, {currentUser.name}
                        </h2>
                        <p className="mt-1.5 text-sm text-white/70">Your Iktaraa account</p>
                    </div>
                </div>

                <div className="space-y-6 p-7 sm:p-8">
                    <dl className="divide-y divide-neutral-100 rounded-2xl border border-neutral-200">
                        <div className="flex items-center justify-between gap-4 px-4 py-3.5">
                            <dt className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                                Email
                            </dt>
                            <dd className="break-all text-right text-sm font-medium text-neutral-800">
                                {currentUser.email}
                            </dd>
                        </div>
                        <div className="flex items-center justify-between gap-4 px-4 py-3.5">
                            <dt className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                                Account type
                            </dt>
                            <dd className="rounded-full bg-[#231E59]/10 px-3 py-1 text-xs font-bold capitalize text-[#231E59]">
                                {currentUser.role}
                            </dd>
                        </div>
                    </dl>

                    <div className="space-y-3">
                        <PrimaryButton type="button" onClick={onClose}>
                            Continue
                            <ArrowRight size={17} />
                        </PrimaryButton>

                        <SecondaryButton type="button" onClick={handleLogout}>
                            <LogOut size={17} />
                            Sign out
                        </SecondaryButton>
                    </div>
                </div>
            </ModalFrame>
        );
    }

    /* ─────────────────────────────────────────────
     * View 2 — sign in / sign up / verify / host application
     * ───────────────────────────────────────────── */
    const headerCopy = getHeaderCopy(step, mode);

    const title =
        forgotPasswordStep === "email"
            ? "Forgot Password?"
            : forgotPasswordStep === "otp"
            ? "Verify Reset Code"
            : forgotPasswordStep === "password"
            ? "Create New Password"
            : forgotPasswordStep === "success"
            ? "Password Updated"
            : headerCopy.title;

    const subtitle =
        forgotPasswordStep !== null
            ? "Securely recover access to your Iktaraa account."
            : headerCopy.subtitle;

    const isHostFlow =
        role === "host" && (mode === "signup" || step === "host-profile");
    const flowSteps = isHostFlow
        ? ["Account", "Verify", "Host"]
        : mode === "login"
        ? ["Sign In"]
        : ["Account", "Verify"];
    const currentStepIndex =
        step === "details" ? 0 : step === "otp" ? 1 : step === "host-profile" ? 2 : 0;

    return (
        <ModalFrame onClose={onClose} maxWidth="max-w-lg">
            <ModalHeader
                title={title}
                subtitle={subtitle}
                steps={forgotPasswordStep === null ? flowSteps : []}
                currentStep={currentStepIndex}
            />

            <div className="p-6 sm:p-8">
                {/* ── Step: details (sign in / create account) ── */}
                {forgotPasswordStep !== null && (
                    <div className="space-y-5">

                        {forgotPasswordStep === "email" && (
                            <form onSubmit={handlePasswordResetRequest} className="space-y-4">
                                <p className="text-sm text-neutral-600">
                                    Enter your registered email address to receive a password-reset code.
                                </p>

                                <TextField
                                    label="Email Address"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    icon={Mail}
                                    required
                                />

                                {error && (
                                    <p className="text-sm text-red-600">{error}</p>
                                )}

                                <PrimaryButton type="submit" loading={loading} loadingText="Sending...">
                                    Send Reset Code
                                </PrimaryButton>

                                <SecondaryButton
                                    type="button"
                                    onClick={() => {
                                        setForgotPasswordStep(null);
                                        setError("");
                                        setMessage("");
                                    }}
                                >
                                    Back to Login
                                </SecondaryButton>
                            </form>
                        )}

                        {forgotPasswordStep === "otp" && (
                            <form onSubmit={handlePasswordResetVerify} className="space-y-4">
                                <p className="text-sm text-neutral-600">
                                    Enter the six-digit code sent to <strong>{email}</strong>.
                                </p>

                                <TextField
                                    label="Verification Code"
                                    value={resetOTP}
                                    onChange={(e) =>
                                        setResetOTP(e.target.value.replace(/\D/g, "").slice(0, 6))
                                    }
                                    placeholder="000000"
                                    icon={ShieldCheck}
                                    required
                                />

                                {message && (
                                    <p className="text-sm text-emerald-600">{message}</p>
                                )}

                                {error && (
                                    <p className="text-sm text-red-600">{error}</p>
                                )}

                                <PrimaryButton type="submit" loading={loading} loadingText="Verifying...">
                                    Verify Code
                                </PrimaryButton>

                                <SecondaryButton
                                    type="button"
                                    disabled={loading}
                                    onClick={async () => {
                                        setError("");
                                        setMessage("");
                                        setLoading(true);

                                        try {
                                            const response = await requestReaderPasswordReset(email);
                                            setMessage(response.detail);
                                        } catch (err) {
                                            setError(getErrorMessage(err));
                                        } finally {
                                            setLoading(false);
                                        }
                                    }}
                                >
                                    Resend Reset Code
                                </SecondaryButton>

                                <SecondaryButton
                                    type="button"
                                    onClick={() => {
                                        setForgotPasswordStep("email");
                                        setResetOTP("");
                                        setError("");
                                        setMessage("");
                                    }}
                                >
                                    Back
                                </SecondaryButton>
                            </form>
                        )}

                        {forgotPasswordStep === "password" && (
                            <form onSubmit={handlePasswordResetConfirm} className="space-y-4">
                                <p className="text-sm text-neutral-600">
                                    Enter your new password.
                                </p>

                                <TextField
                                    label="New Password"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    icon={Lock}
                                    required
                                />

                                <TextField
                                    label="Confirm New Password"
                                    type="password"
                                    value={newPasswordConfirm}
                                    onChange={(e) => setNewPasswordConfirm(e.target.value)}
                                    placeholder="Confirm new password"
                                    icon={Lock}
                                    required
                                />

                                {error && (
                                    <p className="text-sm text-red-600">{error}</p>
                                )}

                                <PrimaryButton type="submit" loading={loading} loadingText="Updating...">
                                    Reset Password
                                </PrimaryButton>

                                <SecondaryButton
                                    type="button"
                                    onClick={() => {
                                        setForgotPasswordStep("otp");
                                        setError("");
                                        setMessage("");
                                    }}
                                >
                                    Back
                                </SecondaryButton>
                            </form>
                        )}

                        {forgotPasswordStep === "success" && (
                            <StatusPanel
                                tone="success"
                                title="Password Reset Successful"
                                text="Your password has been updated. Please sign in again."
                                actionLabel="Back to Login"
                                onAction={() => {
                                    setForgotPasswordStep(null);
                                    setMode("login");
                                    setStep("details");
                                    setPassword("");
                                    setResetOTP("");
                                    setNewPassword("");
                                    setNewPasswordConfirm("");
                                    setError("");
                                    setMessage("");
                                }}
                            />
                        )}
                    </div>
                )}


                {step === "details" && forgotPasswordStep === null && (
                    <>
                        <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-neutral-100 p-1">
                            {(
                                [
                                    { id: "login", label: "Sign In" },
                                    { id: "signup", label: "Create Account" },
                                ] as { id: ModalMode; label: string }[]
                            ).map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => switchMode(tab.id)}
                                    className={`h-10 rounded-lg text-sm font-semibold transition ${
                                        mode === tab.id
                                            ? "bg-white text-[#231E59] shadow-sm"
                                            : "text-neutral-500 hover:text-neutral-700"
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {mode === "signup" && (
                            <div className="mb-6">
                                <p className="mb-3 text-sm font-semibold text-neutral-700">
                                    I want to register as
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                    <RoleCard
                                        selected={role === "attendee"}
                                        icon={User}
                                        title="Attendee"
                                        description="Book and attend events"
                                        onSelect={() => setRole("attendee")}
                                    />
                                    <RoleCard
                                        selected={role === "host"}
                                        icon={Building2}
                                        title="Event Host"
                                        description="Apply to publish events"
                                        onSelect={() => setRole("host")}
                                    />
                                </div>
                            </div>
                        )}

                        {/* <form onSubmit={handleRequestOTP} className="space-y-4">
                            {mode === "signup" && (
                                <TextField
                                    label="Full name"
                                    icon={User}
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your full name"
                                    required
                                    autoComplete="name"
                                />
                            )}

                            <TextField
                                label="Email address"
                                icon={Mail}
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                autoComplete="email"
                            />

                            {error && <ErrorNote message={error} />}

                            <div className="pt-1">
                                <PrimaryButton type="submit" loading={loading}>
                                    {mode === "login" ? "Send Login Code" : "Create Account"}
                                    <ArrowRight size={17} />
                                </PrimaryButton>
                            </div>
                        </form> */}

                        <form
                            onSubmit={mode === "login" ? handlePasswordLogin : handleRequestOTP}
                            className="space-y-4"
                        >
                            {mode === "signup" && (
                                <>
                                    <TextField
                                        label="Full name"
                                        icon={User}
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter your full name"
                                        required
                                        autoComplete="name"
                                    />

                                    <TextField
                                        label="Mobile number"
                                        icon={Phone}
                                        type="tel"
                                        value={mobileNumber}
                                        onChange={(e) => setMobileNumber(e.target.value)}
                                        placeholder="Enter your mobile number"
                                        required
                                        autoComplete="tel"
                                    />
                                </>
                            )}

                            <TextField
                                label="Email address"
                                icon={Mail}
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                autoComplete="email"
                            />

                            <TextField
                                label="Password"
                                icon={Lock}
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                                autoComplete={mode === "login" ? "current-password" : "new-password"}
                            />

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

                            {mode === "signup" && (
                                <TextField
                                    label="Confirm password"
                                    icon={Lock}
                                    type="password"
                                    value={passwordConfirm}
                                    onChange={(e) => setPasswordConfirm(e.target.value)}
                                    placeholder="Re-enter your password"
                                    required
                                    autoComplete="new-password"
                                />
                            )}

                            {error && <ErrorNote message={error} />}

                            <div className="pt-1">
                                <PrimaryButton type="submit" loading={loading}>
                                    {mode === "login" ? "Sign In" : "Create Account"}
                                    <ArrowRight size={17} />
                                </PrimaryButton>
                            </div>
                        </form>


                        <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-xs text-neutral-400">
                            <ShieldCheck size={14} className="text-[#23A2B3]" />
                            {mode === "login"
                            ? "Sign in securely using your email and password."
                            : "Your email will be verified using a one-time verification code."}
                        </p>
                    </>
                )}

                {/* ── Step: OTP verification ── */}
                {step === "otp" && forgotPasswordStep === null && (
                    <form onSubmit={handleVerifyOTP} className="space-y-5">
                        <div className="rounded-2xl border border-[#231E59]/10 bg-[#231E59]/5 p-4 text-center">
                            <span className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#231E59] text-white">
                                <Mail size={18} />
                            </span>
                            <p className="text-sm text-neutral-600">
                                Verification code sent to
                            </p>
                            <p className="mt-0.5 break-all font-bold text-[#231E59]">
                                {email}
                            </p>
                        </div>

                        {message && (
                            <p className="text-center text-sm leading-relaxed text-neutral-500">
                                {message}
                            </p>
                        )}

                        <label className="block">
                            <span className="mb-1.5 block text-center text-sm font-semibold text-neutral-700">
                                Six-digit verification code
                            </span>
                            <input
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                maxLength={6}
                                value={otp}
                                onChange={(e) =>
                                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                                }
                                placeholder="000000"
                                required
                                className={`${INPUT_BASE} h-16 px-4 text-center text-3xl font-black tracking-[0.5em] text-[#231E59]`}
                            />
                        </label>

                        {error && <ErrorNote message={error} />}

                        <PrimaryButton
                            type="submit"
                            loading={loading}
                            loadingText="Verifying..."
                            disabled={otp.length !== 6}
                        >
                            Verify Email
                            <ShieldCheck size={18} />
                        </PrimaryButton>
                        <SecondaryButton
                            type="button"
                            disabled={loading}
                            onClick={handleResendOTP}
                        >
                            {loading ? "Sending..." : "Resend Verification Code"}
                        </SecondaryButton>

                        <button
                            type="button"
                            onClick={handleBack}
                            className="flex w-full items-center justify-center gap-2 py-1 text-sm font-medium text-neutral-500 transition hover:text-[#231E59]"
                        >
                            <ArrowLeft size={16} />
                            Back
                        </button>

                        <p className="text-center text-xs text-neutral-400">
                            The verification code expires after 5 minutes.
                        </p>
                    </form>
                )}

                {/* ── Step: host application ── */}
                {step === "host-profile" &&
                    (hostProfile ? (
                        <StatusPanel
                            tone="pending"
                            title="Host Application Under Review"
                            text={
                                <>
                                    Your host application for{" "}
                                    <strong className="text-neutral-700">
                                        {hostProfile.organization}
                                    </strong>{" "}
                                    has already been submitted. Our team will review your
                                    application and approve your host account.
                                </>
                            }
                            actionLabel="Continue to Events"
                            onAction={onClose}
                        />
                    ) : (
                        <form onSubmit={handleHostApplication} className="space-y-4">
                            <InfoNote>
                                Your reader account is verified. Complete these details to
                                apply as an event host.
                            </InfoNote>

                            <TextField
                                label="Organization name"
                                icon={Building2}
                                type="text"
                                value={organization}
                                onChange={(e) => setOrganization(e.target.value)}
                                placeholder="Organization or institution"
                                required
                            />

                            <TextField
                                label="City"
                                icon={MapPin}
                                type="text"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                placeholder="Your city"
                                required
                            />

                            <TextAreaField
                                label="About your organization"
                                icon={FileText}
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="Briefly describe your organization and the events you organize."
                                rows={4}
                                required
                            />

                            {error && <ErrorNote message={error} />}

                            <div className="pt-1">
                                <PrimaryButton
                                    type="submit"
                                    loading={loading}
                                    loadingText="Submitting..."
                                >
                                    Submit Host Application
                                    <ArrowRight size={17} />
                                </PrimaryButton>
                            </div>
                        </form>
                    ))}

                {/* ── Step: completed ── */}
                {step === "completed" && (
                    <StatusPanel
                        tone="success"
                        title="Thank you for applying!"
                        text={message}
                        actionLabel="Continue to Events"
                        onAction={onClose}
                    />
                )}
            </div>
        </ModalFrame>
    );
};

export { LoginModal };
export default LoginModal;