import { Router, Request, Response } from 'express';
import { store } from '../db/store.js';
import { isSupabaseConfigured, getSupabaseClient } from '../db/supabase.js';

const router = Router();

// GET /api/emails - List all dispatched credential emails
router.get('/', async (req: Request, res: Response) => {
  try {
    const { schoolName } = req.query;
    let results = [...store.emails];

    if (schoolName) {
      results = results.filter(e => e.schoolName === schoolName);
    }

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase.from('dispatched_emails').select('*').order('sent_at', { ascending: false });
        if (!error && data && data.length > 0) {
          return res.json(data);
        }
      }
    }

    return res.json(results);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
