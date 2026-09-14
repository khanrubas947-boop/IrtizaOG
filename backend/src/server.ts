import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import dashboardRoutes from './routes/dashboard';
import authRoutes from './routes/auth';
import ticketsRoutes from './routes/tickets';

import {
  authenticateToken,
  AuthenticatedRequest
} from './middleware/auth';

import { pool } from './db';

dotenv.config();

const app = express();

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    if (
      /^http:\/\/localhost:\d+$/.test(origin) ||
      origin === process.env.FRONTEND_URL
    ) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  }
}));

/*
|--------------------------------------------------------------------------
| Middleware
|--------------------------------------------------------------------------
*/

app.use(express.json());

/*
|--------------------------------------------------------------------------
| Health
|--------------------------------------------------------------------------
*/

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'QuickDesk API is running'
  });
});

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

app.use('/api/auth', authRoutes);

/*
|--------------------------------------------------------------------------
| Dashboard
|--------------------------------------------------------------------------
*/

app.use('/api/dashboard', dashboardRoutes);

/*
|--------------------------------------------------------------------------
| Tickets
|--------------------------------------------------------------------------
*/

app.use('/api/tickets', ticketsRoutes);

/*
|--------------------------------------------------------------------------
| Current authenticated user
|--------------------------------------------------------------------------
*/

app.get(
  '/api/auth/me',
  authenticateToken,
  async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: 'Authentication required'
        });
      }

      const result = await pool.query(
        `SELECT
          id,
          name,
          email,
          role,
          created_at
         FROM users
         WHERE id = $1`,
        [req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({
          message: 'User no longer exists'
        });
      }

      return res.json({
        user: result.rows[0]
      });

    } catch (error) {
      console.error('Get current user error:', error);

      return res.status(500).json({
        message: 'Server error'
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Server
|--------------------------------------------------------------------------
*/

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(
    `QuickDesk API running on http://localhost:${PORT}`
  );
});