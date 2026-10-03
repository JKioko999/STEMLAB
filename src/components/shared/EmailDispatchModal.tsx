import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Mail, 
  CheckCircle2, 
  Copy, 
  Check, 
  X, 
  ShieldCheck, 
  Lock, 
  ExternalLink,
  Send,
  Building2,
  Clock,
  Share2
} from 'lucide-react';

export const EmailDispatchModal: React.FC = () => {
  const { latestDispatchedEmail, clearDispatchedEmail } = useApp();
  const [copiedPass, setCopiedPass] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);

  if (!latestDispatchedEmail) return null;

  const handleCopyPassword = () => {
    if (latestDispatchedEmail.tempPassword) {
      navigator.clipboard.writeText(latestDispatchedEmail.tempPassword);
      setCopiedPass(true);
      setTimeout(() => setCopiedPass(false), 2500);
    }
  };

  const handleCopyFullEmail = () => {
    const fullText = `Subject: ${latestDispatchedEmail.subject}\n\nTo: ${latestDispatchedEmail.recipientName} <${latestDispatchedEmail.recipientEmail}>\n\n${latestDispatchedEmail.messageBody}`;
    navigator.clipboard.writeText(fullText);
    setCopiedBody(true);
    setTimeout(() => setCopiedBody(false), 2500);
  };

  // Gmail Web Composer URL
  const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(latestDispatchedEmail.recipientEmail)}&su=${encodeURIComponent(latestDispatchedEmail.subject)}&body=${encodeURIComponent(latestDispatchedEmail.messageBody)}`;

  // Native mailto URL
  const mailtoUrl = `mailto:${encodeURIComponent(latestDispatchedEmail.recipientEmail)}?subject=${encodeURIComponent(latestDispatchedEmail.subject)}&body=${encodeURIComponent(latestDispatchedEmail.messageBody)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden text-slate-100 space-y-0">
        
        {/* Modal Top Bar */}
        <div className="p-5 bg-gradient-to-r from-emerald-950/80 via-slate-850 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Email Dispatch System
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                  LOGGED & PREPARED
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">
                Invitation & Temporary Password Generated
              </h3>
            </div>
          </div>

          <button
            onClick={clearDispatchedEmail}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Envelope Content */}
        <div className="p-6 space-y-4 text-xs">
          
          {/* Important Sandbox Note */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
            <Send className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-amber-300 block">Deliver to Real Email Address:</span>
              <p className="text-[11px] text-amber-200/90 leading-relaxed">
                In this preview environment, credentials are recorded in the in-app Outbox. You can click <strong>"Open & Send via Gmail"</strong> below to send this exact message directly to <strong>{latestDispatchedEmail.recipientEmail}</strong> from your mail account.
              </p>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-slate-300">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-500 font-medium">To Recipient:</span>
              <span className="text-white font-semibold">
                {latestDispatchedEmail.recipientName} &lt;{latestDispatchedEmail.recipientEmail}&gt;
              </span>
            </div>

            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-500 font-medium">Subject Line:</span>
              <span className="text-emerald-300 font-medium truncate max-w-xs">
                {latestDispatchedEmail.subject}
              </span>
            </div>

            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-500 font-medium">Prepared At:</span>
              <span className="text-slate-400 font-mono">
                {latestDispatchedEmail.sentAt}
              </span>
            </div>

            {latestDispatchedEmail.schoolName && (
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500 font-medium">School / Org:</span>
                <span className="text-slate-300">
                  {latestDispatchedEmail.schoolName}
                </span>
              </div>
            )}
          </div>

          {/* Generated Temporary Password Box */}
          {latestDispatchedEmail.tempPassword && (
            <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Temporary Password for {latestDispatchedEmail.recipientName}</span>
                </span>
                <span className="text-base font-mono font-extrabold text-amber-200">
                  {latestDispatchedEmail.tempPassword}
                </span>
                <p className="text-[11px] text-amber-300/80">
                  User will be prompted to replace this password upon first login.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCopyPassword}
                className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow transition shrink-0"
              >
                {copiedPass ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedPass ? 'Copied!' : 'Copy Password'}</span>
              </button>
            </div>
          )}

          {/* Email Body Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Email Message Content:
              </span>
              <button
                type="button"
                onClick={handleCopyFullEmail}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
              >
                {copiedBody ? <Check className="w-3 h-3 text-emerald-400" /> : <Share2 className="w-3 h-3" />}
                <span>{copiedBody ? 'Copied Full Email!' : 'Copy Full Message'}</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-slate-300 font-mono text-[11px] whitespace-pre-line leading-relaxed max-h-40 overflow-y-auto">
              {latestDispatchedEmail.messageBody}
            </div>
          </div>

          {/* Action Row: Real Delivery Buttons */}
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <a
              href={gmailComposeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20 transition"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open & Send in Web Gmail</span>
            </a>

            <a
              href={mailtoUrl}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <Mail className="w-4 h-4 text-emerald-400" />
              <span>Send via System Mail App</span>
            </a>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Saved in STEM Spark Lab Outbox</span>
          </div>

          <button
            onClick={clearDispatchedEmail}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-600/30"
          >
            Done / Close
          </button>
        </div>

      </div>
    </div>
  );
};
