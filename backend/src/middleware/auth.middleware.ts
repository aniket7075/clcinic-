import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token is missing' });
    return;
  }

  try {
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      res.status(403).json({ error: 'Invalid or expired token' });
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, clinic_id')
      .eq('id', data.user.id)
      .single();

    req.user = {
      ...data.user,
      role: profile?.role,
      clinic_id: profile?.clinic_id || '00000000-0000-0000-0000-000000000000'
    };

    const requestedClinic = req.headers['x-clinic-id'];
    if (requestedClinic && profile?.role === 'SUPER_ADMIN') {
      req.user.clinic_id = requestedClinic;
    }

    next();
  } catch (err) {
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
};

export const requireRole = (roles: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    try {

      if (!roles.includes(req.user.role) && req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'ADMIN' && req.user.role !== 'admin') {
        console.error('Forbidden: Insufficient role. User role:', req.user.role, 'Expected:', roles);
        res.status(403).json({ error: 'Forbidden: Insufficient role permissions' });
        return;
      }

      next();
    } catch (err) {
      res.status(500).json({ error: 'Internal server error checking role' });
    }
  };
};
