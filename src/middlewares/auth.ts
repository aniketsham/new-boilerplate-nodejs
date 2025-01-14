import { Response, Request, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/admin-model';
import { CustomRequest } from '../types/types';
import SuperAdmin from '../models/superadmin-model';
import User from '../models/user-model';

export const isAuthenticated = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader?.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'No token provided, access denied. Please login.',
      });
      return;
    }
    const token = authorizationHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({
        error: 'Token missing, access denied. Please login.',
      });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    const { id, role } = decoded as { id: string; role: string };

    let user;

    switch (role) {
      case 'User':
        user = await User.findById(id);
        break;
      case 'Admin':
        user = await Admin.findById(id);
        break;
      case 'SuperAdmin':
        user = await SuperAdmin.findById(id);
        break;
      default:
        res.status(401).json({ error: 'Invalid or expired token.' });
        return;
    }

    if (!user) {
      res.status(401).json({ error: 'Invalid or expired token.' });
      return;
    }

    req.user = user;

    next();
  } catch (error) {
    console.error('Authentication Error:', error);
    res.status(401).json({ error: 'Invalid or expired token.' });
    return;
  }
};