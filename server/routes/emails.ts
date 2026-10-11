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

export default router;
