import { Router, Request, Response } from 'express';
import { store } from '../db/store.js';
import { isSupabaseConfigured, getSupabaseClient, emailFromDb } from '../db/supabase.js';

const router = Router();

// GET /api/emails - List all dispatched credential emails
router.get('/', async (req: Request, res: Response) => {
  try {
    const { schoolName } = req.query;

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        let query = supabase.from('dispatched_emails').select('*').order('sent_at', { ascending: false });
        if (schoolName) query = query.eq('school_name', schoolName);
        const { data, error } = await query;
        if (!error && data) {
          return res.json(data.map(emailFromDb));
        }
      }
    }

    let results = [...store.emails];
    if (schoolName) {
      results = results.filter(e => e.schoolName === schoolName);
    }

    return res.json(results);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/emails/send - Send email from intellicaautomationgroup@gmail.com to specific user
router.post('/send', async (req: Request, res: Response) => {
  try {
    const { to, toName, subject, message, recipientRole, tempPassword, schoolName } = req.body;
    if (!to || !subject || !message) {
      return res.status(400).json({ error: 'Missing required fields: to, subject, message' });
    }

    const { sendEmail } = await import('../services/mailer.js');

    const emailDispatch = {
      id: `email-${Date.now().toString(36)}`,
      senderEmail: 'intellicaautomationgroup@gmail.com',
      recipientEmail: String(to).trim(),
      recipientName: toName ? String(toName).trim() : String(to).trim(),
      recipientRole: recipientRole || 'student',
      subject: String(subject).trim(),
      tempPassword: tempPassword ? String(tempPassword).trim() : undefined,
      messageBody: String(message).trim(),
      sentAt: new Date().toISOString(),
      schoolName: schoolName ? String(schoolName).trim() : undefined
    };

    store.emails.unshift(emailDispatch);

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { emailToDb } = await import('../db/supabase.js');
        await supabase.from('dispatched_emails').insert([emailToDb(emailDispatch)]);
      }
    }

    const mailResult = await sendEmail({
      to: emailDispatch.recipientEmail,
      toName: emailDispatch.recipientName,
      subject: emailDispatch.subject,
      text: emailDispatch.messageBody,
      tempPassword: emailDispatch.tempPassword
    });

    if (!mailResult.success) {
      return res.status(400).json({
        error: mailResult.error || 'Failed to deliver email via Gmail SMTP.',
        emailDispatch,
        mailResult
      });
    }

    return res.json({
      success: true,
      message: mailResult.simulated
        ? `Email queued from intellicaautomationgroup@gmail.com to ${to}.`
        : `Email successfully delivered to ${to} from intellicaautomationgroup@gmail.com.`,
      emailDispatch,
      mailResult
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to send email' });
  }
});

// GET /api/emails/status - Query SMTP dispatcher status and verified sender email
router.get('/status', async (req: Request, res: Response) => {
  try {
    const { checkMailerStatus, COMPANY_EMAIL, COMPANY_NAME } = await import('../services/mailer.js');
    const status = checkMailerStatus();
    return res.json({
      success: true,
      senderName: COMPANY_NAME,
      ...status
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/emails/test - Send a live test email from intellicaautomationgroup@gmail.com
router.post('/test', async (req: Request, res: Response) => {
  try {
    const { to } = req.body;
    if (!to) {
      return res.status(400).json({ error: 'Target email "to" is required for test' });
    }

    const { sendEmail, COMPANY_EMAIL } = await import('../services/mailer.js');
    const mailResult = await sendEmail({
      to: String(to).trim(),
      toName: 'Test Recipient',
      subject: 'Test Email Transmission - STEM-SPARK-LAB Kenya',
      text: `Hello,\n\nThis is a verified test email sent from ${COMPANY_EMAIL} via STEM-SPARK-LAB Kenya.\n\nAll automated emails (password resets, institution onboarding, and user communications) originate directly from ${COMPANY_EMAIL}.\n\nRegards,\nIntellica Automation Group Technical Directorate`
    });

    return res.json({
      success: mailResult.success,
      simulated: mailResult.simulated,
      senderEmail: COMPANY_EMAIL,
      message: mailResult.simulated
        ? `Test email simulated from ${COMPANY_EMAIL}. Add GMAIL_APP_PASSWORD to .env for live internet delivery.`
        : `Test email successfully sent to ${to} from ${COMPANY_EMAIL}.`,
      mailResult
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
