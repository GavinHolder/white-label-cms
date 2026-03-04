"use client";

/**
 * OtpVerificationModal — reusable email OTP verification popup.
 *
 * Flow:
 *  1. On mount, sends OTP to the provided email via POST /api/otp/send
 *  2. Shows 6 individual digit inputs for the user to enter the code
 *  3. On submit, verifies via POST /api/otp/verify
 *  4. On success, calls onVerified()
 *  5. Resend link available after 30-second cooldown
 */

import { useState, useEffect, useRef, useCallback } from "react";

interface OtpVerificationModalProps {
  /** Email address the OTP was sent to */
  email: string;
  /** Purpose string stored on the token — e.g. "cta-form" or "form-page" */
  purpose: string;
  /** Called when OTP is verified successfully */
  onVerified: () => void;
  /** Called when the user cancels / closes the modal */
  onCancel: () => void;
}

export default function OtpVerificationModal({
  email,
  purpose,
  onVerified,
  onCancel,
}: OtpVerificationModalProps) {
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [sending, setSending] = useState(true);
  const [sendError, setSendError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(30);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  /** Send (or resend) the OTP to the user's email */
  const sendOtp = useCallback(async () => {
    setSending(true);
    setSendError(null);
    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, purpose }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send code");
      setResendCooldown(30);
    } catch (err: unknown) {
      setSendError(err instanceof Error ? err.message : "Failed to send code");
    } finally {
      setSending(false);
    }
  }, [email, purpose]);

  // Send OTP on mount
  useEffect(() => {
    sendOtp();
  }, [sendOtp]);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Focus first input after OTP is sent
  useEffect(() => {
    if (!sending) {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [sending]);

  /** Handle digit input — auto-advance to next box */
  const handleDigitChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1); // Keep only last digit
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);
    setError(null);

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  /** Handle backspace — go back to previous box */
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  /** Handle paste — fill all 6 digits at once */
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  /** Verify the entered OTP code */
  const handleVerify = async () => {
    const code = digits.join("");
    if (code.length < 6) {
      setError("Please enter all 6 digits.");
      return;
    }

    setVerifying(true);
    setError(null);

    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, purpose }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");
      onVerified();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Verification failed");
      setDigits(["", "", "", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } finally {
      setVerifying(false);
    }
  };

  const code = digits.join("");

  return (
    <div
      className="modal d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1200 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 440 }}>
        <div className="modal-content shadow-lg">
          <div className="modal-header border-0 pb-0">
            <button
              type="button"
              className="btn-close ms-auto"
              onClick={onCancel}
              aria-label="Close"
            />
          </div>

          <div className="modal-body text-center px-4 pb-4">
            {/* Icon */}
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
              style={{
                width: 64,
                height: 64,
                background: "#eff6ff",
              }}
            >
              <i className="bi bi-shield-lock text-primary" style={{ fontSize: 28 }}></i>
            </div>

            <h5 className="fw-bold mb-1">Verify your email</h5>
            <p className="text-muted mb-4" style={{ fontSize: 14 }}>
              We sent a 6-digit code to <strong>{email}</strong>
            </p>

            {/* Send error */}
            {sendError && (
              <div className="alert alert-danger py-2 mb-3" style={{ fontSize: 14 }}>
                <i className="bi bi-exclamation-triangle me-1"></i>
                {sendError}
              </div>
            )}

            {/* Digit inputs */}
            <div className="d-flex justify-content-center gap-2 mb-3">
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={handlePaste}
                  disabled={sending || verifying}
                  className={`form-control text-center fw-bold p-0 ${error ? "is-invalid" : ""}`}
                  style={{
                    width: 48,
                    height: 56,
                    fontSize: 24,
                    borderRadius: 8,
                  }}
                />
              ))}
            </div>

            {/* Verification error */}
            {error && (
              <div className="text-danger mb-3" style={{ fontSize: 14 }}>
                <i className="bi bi-x-circle me-1"></i>
                {error}
              </div>
            )}

            {/* Verify button */}
            <button
              type="button"
              className="btn btn-primary w-100 mb-3"
              onClick={handleVerify}
              disabled={code.length < 6 || verifying || sending}
            >
              {verifying ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Verifying…
                </>
              ) : (
                <>
                  <i className="bi bi-check-lg me-2"></i>
                  Verify Code
                </>
              )}
            </button>

            {/* Resend */}
            <div style={{ fontSize: 13 }} className="text-muted">
              Didn&apos;t receive it?{" "}
              {resendCooldown > 0 ? (
                <span>Resend in {resendCooldown}s</span>
              ) : (
                <button
                  type="button"
                  className="btn btn-link p-0 border-0 text-primary"
                  style={{ fontSize: 13, textDecoration: "underline" }}
                  onClick={sendOtp}
                  disabled={sending}
                >
                  {sending ? "Sending…" : "Resend code"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
