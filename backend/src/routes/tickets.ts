import { Router } from 'express';
import { pool } from '../db';
import {
  authenticateToken,
  AuthenticatedRequest
} from '../middleware/auth';

const router = Router();

/*
|--------------------------------------------------------------------------
| Get all tickets
|--------------------------------------------------------------------------
*/

router.get(
  '/',
  authenticateToken,
  async (req: AuthenticatedRequest, res) => {
    try {
      const result = await pool.query(
        `SELECT
          t.id,
          t.title,
          t.description,
          t.status,
          t.priority,
          t.created_by,
          t.created_at,
          t.updated_at,
          u.name AS creator_name,
          u.email AS creator_email
         FROM tickets t
         JOIN users u ON u.id = t.created_by
         ORDER BY t.created_at DESC`
      );

      return res.json({
        tickets: result.rows
      });

    } catch (error) {
      console.error('Get tickets error:', error);

      return res.status(500).json({
        message: 'Could not load tickets'
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Get single ticket
|--------------------------------------------------------------------------
*/

router.get(
  '/:id',
  authenticateToken,
  async (req: AuthenticatedRequest, res) => {
    try {
      const ticketId = Number(req.params.id);

      if (!Number.isInteger(ticketId) || ticketId <= 0) {
        return res.status(400).json({
          message: 'Invalid ticket ID'
        });
      }

      const result = await pool.query(
        `SELECT
          t.id,
          t.title,
          t.description,
          t.status,
          t.priority,
          t.created_by,
          t.created_at,
          t.updated_at,
          u.name AS creator_name,
          u.email AS creator_email
         FROM tickets t
         JOIN users u ON u.id = t.created_by
         WHERE t.id = $1`,
        [ticketId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: 'Ticket not found'
        });
      }

      return res.json({
        ticket: result.rows[0]
      });

    } catch (error) {
      console.error('Get ticket error:', error);

      return res.status(500).json({
        message: 'Could not load ticket'
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Create ticket
|--------------------------------------------------------------------------
*/

router.post(
  '/',
  authenticateToken,
  async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: 'Authentication required'
        });
      }

      const {
        title,
        description,
        priority
      } = req.body;

      if (!title || !title.trim()) {
        return res.status(400).json({
          message: 'Ticket title is required'
        });
      }

      const allowedPriorities = [
        'low',
        'medium',
        'high',
        'urgent'
      ];

      const ticketPriority = priority || 'medium';

      if (!allowedPriorities.includes(ticketPriority)) {
        return res.status(400).json({
          message: 'Invalid priority'
        });
      }

      const result = await pool.query(
        `INSERT INTO tickets (
          title,
          description,
          status,
          priority,
          created_by
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING
          id,
          title,
          description,
          status,
          priority,
          created_by,
          created_at,
          updated_at`,
        [
          title.trim(),
          description?.trim() || null,
          'open',
          ticketPriority,
          req.user.id
        ]
      );

      return res.status(201).json({
        message: 'Ticket created successfully',
        ticket: result.rows[0]
      });

    } catch (error) {
      console.error('Create ticket error:', error);

      return res.status(500).json({
        message: 'Could not create ticket'
      });
    }
  }
);

export default router;