import { Router } from 'express';
import { pool } from '../db';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*)::int AS total_users
      FROM users
    `);

    const totalUsers = result.rows[0].total_users;

    res.json({
      openTickets: 0,
      unresolved: 0,
      dueToday: 0,
      satisfaction: 100,
      totalUsers
    });

  } catch (error) {
    console.error('Dashboard error:', error);

    res.status(500).json({
      message: 'Could not load dashboard'
    });
  }
});

export default router;