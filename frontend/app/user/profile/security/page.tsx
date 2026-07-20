"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";
import {
  HiArrowLeft,
  HiShieldCheck,
  HiShieldExclamation,
  HiQrcode,
  HiKey,
  HiTrash,
  HiCheck,
  HiExclamation,
} from "react-icons/hi";
import {
  setupMFA,
  verifyAndEnableMFA,
  disableMFA,
  getMFAStatus,
} from "@/lib/api/mfa";

type MFAPhase = "idle" | "loading" | "setup" | "enabling" | "disabling";

export default function SecurityPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [mfaEnabled, setMfaEnabled] = useState<boolean | null>(null);
  const [phase, setPhase] = useState<MFAPhase>("idle");
  const [qrCode, setQrCode] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [totpCode, setTotpCode] = useState<string>("");
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);

  // ── Redirect if not authenticated ──
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [user, authLoading, router]);

  // ── Fetch MFA status on mount ──
  const fetchStatus = useCallback(async () => {
    try {
      const status = await getMFAStatus();
      setMfaEnabled(status.enabled);
    } catch {
      setMfaEnabled(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchStatus();
  }, [user, fetchStatus]);

  // ── Start MFA setup ──
  const handleSetup = async () => {
    setPhase("loading");
    try {
      const result = await setupMFA();
      setQrCode(result.qrCode);
      setSecret(result.secret);
      setPhase("setup");
    } catch (err: any) {
      toast.error(err.message || "Failed to setup MFA");
      setPhase("idle");
    }
  };

  // ── Verify & Enable MFA ──
  const handleVerifyAndEnable = async () => {
    if (!totpCode || totpCode.length < 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }
    setPhase("enabling");
    try {
      await verifyAndEnableMFA(totpCode);
      toast.success("MFA has been enabled successfully!");
      setMfaEnabled(true);
      setPhase("idle");
      setQrCode("");
      setSecret("");
      setTotpCode("");
    } catch (err: any) {
      toast.error(err.message || "Failed to verify MFA code");
      setPhase("setup");
    }
  };

  // ── Disable MFA (requires current TOTP code) ──
  const handleDisable = async () => {
    if (!totpCode || totpCode.length < 6) {
      toast.error("Please enter a valid 6-digit code from your authenticator app");
      return;
    }
    setPhase("disabling");
    try {
      await disableMFA(totpCode);
      toast.success("MFA has been disabled");
      setMfaEnabled(false);
      setPhase("idle");
      setShowDisableConfirm(false);
      setTotpCode("");
    } catch (err: any) {
      toast.error(err.message || "Failed to disable MFA");
      setPhase("idle");
    }
  };

  // ── Cancel setup ──
  const handleCancelSetup = () => {
    setPhase("idle");
    setQrCode("");
    setSecret("");
    setTotpCode("");
  };

  if (authLoading || mfaEnabled === null) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1B2A4F]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/user/profile"
          className="inline-flex items-center gap-2 text-[#E85D4A] hover:text-[#d04a38] font-semibold mb-4 transition text-sm"
        >
          <HiArrowLeft size={18} />
          Back to Profile
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Security Settings</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Manage your account security and multi-factor authentication
        </p>
      </div>

      {/* ─── MFA CARD ─── */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        {/* Card header */}
        <div className="flex items-center gap-4 p-6 border-b border-gray-100">
          <div
            className={`p-3 rounded-full ${
              mfaEnabled
                ? "bg-green-100 text-green-700"
                : "bg-orange-100 text-orange-600"
            }`}
          >
            {mfaEnabled ? (
              <HiShieldCheck size={28} />
            ) : (
              <HiShieldExclamation size={28} />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Multi-Factor Authentication
            </h2>
            <p className="text-sm text-gray-500">
              {mfaEnabled
                ? "Your account is protected with TOTP-based MFA"
                : "Add an extra layer of security to your account"}
            </p>
          </div>
          <div className="ml-auto">
            <span
              className={`px-4 py-1.5 rounded-full text-sm font-bold ${
                mfaEnabled
                  ? "bg-green-100 text-green-800 border border-green-300"
                  : "bg-gray-100 text-gray-500 border border-gray-200"
              }`}
            >
              {mfaEnabled ? "Enabled" : "Not Enabled"}
            </span>
          </div>
        </div>

        {/* Card body */}
        <div className="p-6">
          {/* ── MFA NOT ENABLED: Show setup option ── */}
          {!mfaEnabled && phase === "idle" && (
            <div className="text-center py-6">
              <div className="inline-block p-4 bg-[#F0EDE6] rounded-full mb-4">
                <HiQrcode size={36} className="text-[#1B2A4F]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Strengthen Your Account Security
              </h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6 text-sm">
                Multi-factor authentication adds a second layer of protection.
                After setup, you&apos;ll need both your password and a
                time-sensitive code from your authenticator app to log in.
              </p>
              <button
                onClick={handleSetup}
                className="inline-flex items-center gap-2 bg-[#1B2A4F] text-white px-8 py-3 rounded-lg hover:bg-[#233459] transition font-bold shadow-md"
              >
                <HiShieldCheck size={20} />
                Set Up MFA
              </button>
            </div>
          )}

          {/* ── SETUP IN PROGRESS: Show QR code + verification ── */}
          {phase === "setup" && qrCode && (
            <div className="max-w-md mx-auto text-center space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Scan the QR Code
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Open your authenticator app (Google Authenticator, Authy, etc.)
                  and scan this QR code
                </p>
                <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-xl shadow-sm">
                  <img
                    src={qrCode}
                    alt="MFA QR Code"
                    className="w-48 h-48 mx-auto"
                  />
                </div>
                {secret && (
                  <p className="mt-3 text-xs text-gray-400">
                    Or manually enter this key:{" "}
                    <span className="font-mono text-[#1B2A4F] font-bold select-all">
                      {secret}
                    </span>
                  </p>
                )}
              </div>

              <div className="border-t border-gray-100 pt-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2 text-left">
                  Enter the 6-digit code from your authenticator app
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={totpCode}
                  onChange={(e) =>
                    setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="000000"
                  className="w-full text-center text-2xl tracking-[0.5em] px-4 py-3 rounded-lg border-2 border-gray-300 text-gray-900 placeholder:text-gray-300 focus:border-[#1B2A4F] focus:outline-none transition font-mono"
                />
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleVerifyAndEnable}
                    disabled={totpCode.length < 6}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#1B2A4F] text-white px-6 py-3 rounded-lg hover:bg-[#233459] transition font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <HiCheck size={20} />
                    Verify & Enable
                  </button>
                  <button
                    onClick={handleCancelSetup}
                    className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── LOADING ── */}
          {(phase === "loading" || phase === "enabling") && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B2A4F] mx-auto mb-4" />
              <p className="text-gray-600 font-medium">
                {phase === "loading"
                  ? "Generating MFA secret..."
                  : "Verifying and enabling MFA..."}
              </p>
            </div>
          )}

          {/* ── MFA ENABLED: Show disable option ── */}
          {mfaEnabled && !showDisableConfirm && (
            <div className="text-center py-6">
              <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
                <HiCheck size={36} className="text-green-700" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                MFA is Active
              </h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6 text-sm">
                Your account requires a time-sensitive code from your
                authenticator app in addition to your password to log in.
              </p>
              <button
                onClick={() => setShowDisableConfirm(true)}
                className="inline-flex items-center gap-2 border-2 border-[#E85D4A] text-[#E85D4A] px-8 py-3 rounded-lg hover:bg-[#E85D4A] hover:text-white transition font-bold"
              >
                <HiTrash size={20} />
                Disable MFA
              </button>
            </div>
          )}

          {/* ── DISABLE CONFIRMATION ── */}
          {mfaEnabled && showDisableConfirm && (
            <div className="max-w-md mx-auto text-center space-y-6">
              <div className="inline-block p-4 bg-orange-100 rounded-full">
                <HiExclamation size={36} className="text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Are you sure?
                </h3>
                <p className="text-sm text-gray-500">
                  To disable MFA, please enter the current code from your
                  authenticator app to confirm your identity.
                </p>
              </div>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={totpCode}
                onChange={(e) =>
                  setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="000000"
                className="w-full text-center text-2xl tracking-[0.5em] px-4 py-3 rounded-lg border-2 border-orange-300 text-gray-900 placeholder:text-gray-300 focus:border-[#E85D4A] focus:outline-none transition font-mono"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleDisable}
                  disabled={totpCode.length < 6 || phase === "disabling"}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#E85D4A] text-white px-6 py-3 rounded-lg hover:bg-[#d04a38] transition font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {phase === "disabling" ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      Disabling...
                    </>
                  ) : (
                    <>
                      <HiTrash size={20} />
                      Confirm Disable
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowDisableConfirm(false);
                    setTotpCode("");
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── INFO CARD ─── */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex gap-3">
          <HiKey size={24} className="text-blue-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-blue-900 mb-1">
              About TOTP Authentication
            </h3>
            <p className="text-sm text-blue-800 leading-relaxed">
              Time-based One-Time Password (TOTP) generates a unique 6-digit
              code that changes every 30 seconds. Supported authenticator apps
              include Google Authenticator, Authy, Microsoft Authenticator, and
              others. Even if your password is compromised, an attacker would
              still need physical access to your authenticator device to log in.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
