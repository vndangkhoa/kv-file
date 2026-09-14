import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Copy,
  Check,
  Download,
  AlertTriangle,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { api } from '../../services/api';
import { Setup2faResponse } from '../../types';

interface TwoFactorSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TwoFactorSetupModal: React.FC<TwoFactorSetupModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [setupData, setSetupData] = useState<Setup2faResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verification step
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setCode('');
      setError(null);
      loadSetupData();
    }
  }, [isOpen]);

  const loadSetupData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.setup2fa();
      setSetupData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize 2FA setup.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySecret = () => {
    if (!setupData?.secret) return;
    navigator.clipboard.writeText(setupData.secret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (code.trim().length !== 6) {
      setError('Please enter a valid 6-digit code.');
      return;
    }

    setIsVerifying(true);
    try {
      await api.enable2fa(code.trim());
      setStep(3); // Advance to backup codes screen
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check the code.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCopyCodes = () => {
    if (!setupData?.backup_codes) return;
    const text = setupData.backup_codes.join('\n');
    navigator.clipboard.writeText(text);
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 2000);
  };

  const handleDownloadCodes = () => {
    if (!setupData?.backup_codes) return;
    const text =
      `KV Files - 2FA Backup Recovery Codes\n` +
      `Generated: ${new Date().toISOString()}\n\n` +
      `Keep these codes safe. Each code can be used once if you lose access to your authenticator app:\n\n` +
      setupData.backup_codes.map((c, i) => `${i + 1}. ${c}`).join('\n') +
      `\n`;

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kv-files-2fa-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFinish = () => {
    onSuccess();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in select-none"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#252526] w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-[#333333] flex flex-col overflow-hidden text-xs"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 dark:border-[#333333]">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-blue-500" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
              Enable Two-Factor Authentication
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#333333] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-5 py-2.5 bg-gray-50 dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-[#333333] flex items-center justify-between text-[11px]">
          <span
            className={`font-medium ${step === 1 ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-400'}`}
          >
            1. Scan QR Code
          </span>
          <ArrowRight size={12} className="text-gray-300 dark:text-gray-600" />
          <span
            className={`font-medium ${step === 2 ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-400'}`}
          >
            2. Verify Code
          </span>
          <ArrowRight size={12} className="text-gray-300 dark:text-gray-600" />
          <span
            className={`font-medium ${step === 3 ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-400'}`}
          >
            3. Backup Codes
          </span>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-2 text-gray-400">
              <Loader2 size={24} className="animate-spin text-blue-500" />
              <span>Generating cryptographic key...</span>
            </div>
          ) : error && step !== 2 ? (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 rounded-xl text-red-600 dark:text-red-400">
              {error}
            </div>
          ) : (
            <>
              {/* Step 1: Scan QR Code */}
              {step === 1 && setupData && (
                <div className="space-y-4 text-center">
                  <p className="text-gray-600 dark:text-gray-300">
                    Scan this QR code with your authenticator app (Google Authenticator, Microsoft
                    Authenticator, 1Password, or Authy):
                  </p>

                  <div className="flex justify-center p-3 bg-white rounded-xl border border-gray-200 dark:border-[#3c3c3c] shadow-sm max-w-[200px] mx-auto">
                    <img
                      src={setupData.qr_code}
                      alt="2FA QR Code"
                      className="w-44 h-44 object-contain"
                    />
                  </div>

                  <div className="space-y-1 text-left bg-gray-50 dark:bg-[#1e1e1e] p-3 rounded-xl border border-gray-200 dark:border-[#333333]">
                    <span className="text-[11px] font-medium text-gray-500 block">
                      Cannot scan? Enter secret manually:
                    </span>
                    <div className="flex items-center justify-between font-mono bg-white dark:bg-[#252526] px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-[#3c3c3c]">
                      <span className="tracking-wider select-all">{setupData.secret}</span>
                      <button
                        type="button"
                        onClick={handleCopySecret}
                        className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                        title="Copy Secret"
                      >
                        {copiedSecret ? (
                          <Check size={14} className="text-emerald-500" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                    >
                      <span>Continue to Verification</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Verification */}
              {step === 2 && (
                <form onSubmit={handleVerifyCode} className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-300">
                    Enter the 6-digit code currently shown in your authenticator app to confirm it
                    is functioning properly:
                  </p>

                  {error && (
                    <div className="p-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 rounded-xl text-red-600 dark:text-red-400">
                      {error}
                    </div>
                  )}

                  <div className="flex justify-center py-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      autoFocus
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      className="w-48 text-center tracking-[0.4em] font-mono text-xl py-2 px-3 bg-gray-50 dark:bg-[#1e1e1e] border-2 border-blue-500/60 rounded-xl focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      Back to QR code
                    </button>
                    <button
                      type="submit"
                      disabled={isVerifying || code.length !== 6}
                      className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-medium transition-colors"
                    >
                      {isVerifying && <Loader2 size={14} className="animate-spin" />}
                      <span>Verify & Activate</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Step 3: Backup Codes */}
              {step === 3 && setupData && (
                <div className="space-y-4">
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 text-[11px]">
                    <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block">Save Your Recovery Backup Codes</span>
                      <span>
                        If you lose access to your authenticator app, these single-use codes are the
                        only way to regain access to your account.
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 dark:bg-[#1e1e1e] rounded-xl border border-gray-200 dark:border-[#333333] font-mono text-center">
                    {setupData.backup_codes.map((c, i) => (
                      <div
                        key={i}
                        className="py-1 px-2 bg-white dark:bg-[#252526] rounded border border-gray-200 dark:border-[#3c3c3c] text-gray-800 dark:text-gray-200 font-medium tracking-wider"
                      >
                        {c}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyCodes}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 border border-gray-300 dark:border-[#3c3c3c] rounded-xl hover:bg-gray-100 dark:hover:bg-[#2d2d2d] transition-colors"
                    >
                      {copiedCodes ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      <span>{copiedCodes ? 'Copied' : 'Copy All'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadCodes}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 border border-gray-300 dark:border-[#3c3c3c] rounded-xl hover:bg-gray-100 dark:hover:bg-[#2d2d2d] transition-colors"
                    >
                      <Download size={14} />
                      <span>Download .txt</span>
                    </button>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleFinish}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors"
                    >
                      Done & Protected
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
