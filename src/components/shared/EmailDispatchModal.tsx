import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Copy, 
  Check, 
  X, 
  ExternalLink,
  Mail
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
      setTimeout(() => setCopiedPass(false), 2000);
    }
  };

  const handleCopyFullEmail = () => {
    const fullText = `Subject: ${latestDispatchedEmail.subject}\n\nTo: ${latestDispatchedEmail.recipientName} <${latestDispatchedEmail.recipientEmail}>\n\n${latestDispatchedEmail.messageBody}`;
    navigator.clipboard.writeText(fullText);
    setCopiedBody(true);
    setTimeout(() => setCopiedBody(false), 2000);
  };

  const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(latestDispatchedEmail.recipientEmail)}&su=${encodeURIComponent(latestDispatchedEmail.subject)}&body=${encodeURIComponent(latestDispatchedEmail.messageBody)}`;
  const mailtoUrl = `mailto:${encodeURIComponent(latestDispatchedEmail.recipientEmail)}?subject=${encodeURIComponent(latestDispatchedEmail.subject)}&body=${encodeURIComponent(latestDispatchedEmail.messageBody)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md shadow-xl overflow-hidden text-slate-900 dark:text-slate-100 text-xs">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Dispatched account credentials
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Temporary access credential generated for {latestDispatchedEmail.recipientName}.
            </p>
          </div>

          <button
            onClick={clearDispatchedEmail}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Envelope Content */}
        <div className="p-5 space-y-3.5">
          
          {/* Metadata */}
          <div className="p-3 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1 text-slate-600 dark:text-slate-400 text-xs">
            <div className="flex justify-between">
              <span>Recipient:</span>
              <span className="text-slate-900 dark:text-slate-100 font-medium">
                {latestDispatchedEmail.recipientName} ({latestDispatchedEmail.recipientEmail})
              </span>
            </div>
            <div className="flex justify-between">
              <span>Subject:</span>
              <span className="text-slate-800 dark:text-slate-200 truncate max-w-xs">
                {latestDispatchedEmail.subject}
              </span>
            </div>
            {latestDispatchedEmail.schoolName && (
              <div className="flex justify-between">
                <span>School:</span>
                <span className="text-slate-800 dark:text-slate-200">
                  {latestDispatchedEmail.schoolName}
                </span>
              </div>
            )}
          </div>

          {/* Password Box */}
          {latestDispatchedEmail.tempPassword && (
            <div className="p-3 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                  Temporary password
                </span>
                <span className="text-sm font-mono font-semibold text-slate-900 dark:text-slate-100 mt-0.5 block">
                  {latestDispatchedEmail.tempPassword}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopyPassword}
                className="px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-1 shrink-0"
              >
                {copiedPass ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPass ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          )}

          {/* Email Body */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>Message body</span>
              <button
                type="button"
                onClick={handleCopyFullEmail}
                className="hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1"
              >
                {copiedBody ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedBody ? 'Copied' : 'Copy full text'}</span>
              </button>
            </div>

            <div className="p-3 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed max-h-36 overflow-y-auto">
              {latestDispatchedEmail.messageBody}
            </div>
          </div>

          {/* Delivery Actions */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <a
              href={gmailComposeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-1.5 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Send in Gmail</span>
            </a>

            <a
              href={mailtoUrl}
              className="py-1.5 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Send via mail app</span>
            </a>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={clearDispatchedEmail}
            className="px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-medium text-xs transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
