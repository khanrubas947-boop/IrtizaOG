import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

interface JwtPayload {
  id: number;
  email: string;
  role: string;
}

export function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: 'Authentication required'
    });
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      message: 'Invalid authorization format'
    });
  }

  const token = parts[1];

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    console.error('JWT_SECRET is missing');

    return res.status(500).json({
      message: 'Server configuration error'
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      secret
    ) as JwtPayload;

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };

    next();

  } catch (error) {

    return res.status(401).json({
      message: 'Invalid or expired token'
    });

  }
}