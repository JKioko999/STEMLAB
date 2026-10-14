import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, COMPANY_SENDER_EMAIL, COMPANY_SENDER_NAME } from '../../types';
import { X, Send, Mail, CheckCircle2, AlertCircle, RefreshCw, Shield } from 'lucide-react';

interface SendEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser?: User | null;
  defaultSubject?: string;
}

export const SendEmailModal: React.FC<SendEmailModalProps> = ({
  isOpen,
  onClose,
  targetUser,
  defaultSubject = ''
}) => {
  const { sendUserEmail, users } = useApp();

  const [recipientEmail, setRecipientEmail] = useState(targetUser?.email || '');
  const [recipientName, setRecipientName] = useState(targetUser?.name || '');
  const [subject, setSubject] = useState(defaultSubject);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  React.useEffect(() => {
    if (targetUser) {
      setRecipientEmail(targetUser.email);
      setRecipientName(targetUser.name);
    }
    if (defaultSubject) {
      setSubject(defaultSubject);
    }
  }, [targetUser, defaultSubject]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!recipientEmail.trim() || !subject.trim() || !message.trim()) {
      setStatusMessage({ type: 'error', text: 'Please complete all fields (recipient email, subject, message).' });
      return;
    }

    setLoading(true);
    try {
      const res = await sendUserEmail({
        to: recipientEmail.trim(),
        toName: recipientName.trim(),
        subject: subject.trim(),
        message: message.trim(),
        recipientRole: targetUser?.role
      });

      if (res.success) {
        setStatusMessage({ 
          type: 'success', 
          text: res.message || `Email sent successfully from ${COMPANY_SENDER_EMAIL} to ${recipientEmail}!` 
        });
        setTimeout(() => {
          setMessage('');
          setStatusMessage(null);
          onClose();
        }, 2200);
      } else {
        setStatusMessage({ type: 'error', text: 'Failed to send email. Please check connection.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error transmitting email.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100 text-xs animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Compose Official Email
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Direct institutional communication to registered platform users
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Alerts */}
        {statusMessage && (
          <div className={`mx-5 mt-4 p-3 rounded-lg flex items-start gap-2.5 text-xs ${
            statusMessage.type === 'success' 
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300' 
              : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300'
          }`}>
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
            )}
            <div className="flex-1 leading-relaxed">{statusMessage.text}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          
          {/* Sender details (Locked to Intellica Automation Group) */}
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">From (Company Email):</span>
            <span className="font-semibold font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>{COMPANY_SENDER_EMAIL}</span>
            </span>
          </div>

          {/* Recipient Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Recipient Name
              </label>
              <input
                type="text"
                placeholder="User full name"
                value={recipientName}
                onChange={e => setRecipientName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Recipient Email *
              </label>
              <input
                type="email"
                required
                placeholder="user@school.ac.ke"
                value={recipientEmail}
                onChange={e => setRecipientEmail(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
              />
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Subject Line *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. KCSE Chemistry Practical Schedule / Assignment Alert"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
            />
          </div>

          {/* Message Body */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Message Content *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Enter message text to be dispatched from intellicaautomationgroup@gmail.com..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium cursor-pointer transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || !recipientEmail.trim() || !subject.trim() || !message.trim()}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Dispatching email...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send from intellicaautomationgroup@gmail.com</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
