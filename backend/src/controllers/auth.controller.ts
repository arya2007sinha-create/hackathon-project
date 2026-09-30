import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase';
import { config } from '../config/env';
import { sendSuccess, sendError } from '../utils/response';
import { JwtPayload } from '../types';

export class AuthController {
  public async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // 1. Fetch user by email
      const { data: user, error } = await supabase
        .from('users')
        .select('*, team:teams!users_team_id_fkey(*)')
        .eq('email', email.toLowerCase().trim())
        .eq('is_active', true)
        .single();

      if (error || !user) {
        return sendError(res, 'Invalid email or password', 'INVALID_CREDENTIALS', 401);
      }

      // 2. Compare password hash
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return sendError(res, 'Invalid email or password', 'INVALID_CREDENTIALS', 401);
      }

      // 3. Update last_login_at
      await supabase
        .from('users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', user.id);

      // 4. Generate JWT
      const payload: JwtPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        teamId: user.team_id,
        name: user.name,
      };

      const token = jwt.sign(payload, config.jwtSecret, {
        expiresIn: config.jwtExpiresIn as any,
      });

      // 5. Sanitized user response (NEVER return password_hash)
      const { password_hash, ...safeUser } = user;

      return sendSuccess(
        res,
        {
          token,
          user: safeUser,
        },
        'Login successful'
      );
    } catch (err: any) {
      return sendError(res, err.message, 'LOGIN_FAILED', 500);
    }
  }

  public async getMe(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Not authenticated', 'UNAUTHORIZED', 401);
      }

      const { data: user, error } = await supabase
        .from('users')
        .select('*, team:teams!users_team_id_fkey(*)')
        .eq('id', req.user.userId)
        .single();

      if (error || !user) {
        return sendError(res, 'User not found', 'NOT_FOUND', 404);
      }

      const { password_hash, ...safeUser } = user;
      return sendSuccess(res, safeUser, 'Profile retrieved successfully');
    } catch (err: any) {
      return sendError(res, err.message, 'GET_ME_FAILED', 500);
    }
  }

  public async logout(req: Request, res: Response) {
    return sendSuccess(res, null, 'Logged out successfully');
  }
}

export const authController = new AuthController();
