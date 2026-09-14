import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../db';

const router = Router();

/*
|--------------------------------------------------------------------------
| SIGN UP
|--------------------------------------------------------------------------
*/

router.post('/signup', async (req, res) => {

  try {

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email and password are required'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [normalizedEmail]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: 'Email already registered'
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `INSERT INTO users
        (name, email, password_hash)
       VALUES
        ($1, $2, $3)
       RETURNING id, name, email, role`,
      [
        name.trim(),
        normalizedEmail,
        passwordHash
      ]
    );

    const user = result.rows[0];

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      console.error('JWT_SECRET is missing from .env');

      return res.status(500).json({
        message: 'Server configuration error'
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      jwtSecret,
      {
        expiresIn: '7d'
      }
    );

    return res.status(201).json({
      message: 'Account created successfully',
      token,
      user
    });

  } catch (error) {

    console.error('Signup error:', error);

    return res.status(500).json({
      message: 'Server error'
    });

  }

});


/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
*/

router.post('/login', async (req, res) => {

  try {

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const result = await pool.query(
      `SELECT
        id,
        name,
        email,
        password_hash,
        role
       FROM users
       WHERE email = $1`,
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    const user = result.rows[0];

    const passwordCorrect = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordCorrect) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      console.error('JWT_SECRET is missing from .env');

      return res.status(500).json({
        message: 'Server configuration error'
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      jwtSecret,
      {
        expiresIn: '7d'
      }
    );

    return res.json({
      message: 'Login successful',

      token,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {

    console.error('Login error:', error);

    return res.status(500).json({
      message: 'Server error'
    });

  }

});


export default router;