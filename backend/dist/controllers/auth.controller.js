"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const supabase_1 = require("../config/supabase");
const env_1 = require("../config/env");
const response_1 = require("../utils/response");
class AuthController {
    async login(req, res) {
        try {
            const { email, password } = req.body;
            // 1. Fetch user by email
            const { data: user, error } = await supabase_1.supabase
                .from('users')
                .select('*, team:teams!users_team_id_fkey(*)')
                .eq('email', email.toLowerCase().trim())
                .eq('is_active', true)
                .single();
            if (error || !user) {
                return (0, response_1.sendError)(res, 'Invalid email or password', 'INVALID_CREDENTIALS', 401);
            }
            // 2. Compare password hash
            const isMatch = await bcryptjs_1.default.compare(password, user.password_hash);
            if (!isMatch) {
                return (0, response_1.sendError)(res, 'Invalid email or password', 'INVALID_CREDENTIALS', 401);
            }
            // 3. Update last_login_at
            await supabase_1.supabase
                .from('users')
                .update({ last_login_at: new Date().toISOString() })
                .eq('id', user.id);
            // 4. Generate JWT
            const payload = {
                userId: user.id,
                email: user.email,
                role: user.role,
                teamId: user.team_id,
                name: user.name,
            };
            const token = jsonwebtoken_1.default.sign(payload, env_1.config.jwtSecret, {
                expiresIn: env_1.config.jwtExpiresIn,
            });
            // 5. Sanitized user response (NEVER return password_hash)
            const { password_hash, ...safeUser } = user;
            return (0, response_1.sendSuccess)(res, {
                token,
                user: safeUser,
            }, 'Login successful');
        }
        catch (err) {
            return (0, response_1.sendError)(res, err.message, 'LOGIN_FAILED', 500);
        }
    }
    async getMe(req, res) {
        try {
            if (!req.user) {
                return (0, response_1.sendError)(res, 'Not authenticated', 'UNAUTHORIZED', 401);
            }
            const { data: user, error } = await supabase_1.supabase
                .from('users')
                .select('*, team:teams!users_team_id_fkey(*)')
                .eq('id', req.user.userId)
                .single();
            if (error || !user) {
                return (0, response_1.sendError)(res, 'User not found', 'NOT_FOUND', 404);
            }
            const { password_hash, ...safeUser } = user;
            return (0, response_1.sendSuccess)(res, safeUser, 'Profile retrieved successfully');
        }
        catch (err) {
            return (0, response_1.sendError)(res, err.message, 'GET_ME_FAILED', 500);
        }
    }
    async logout(req, res) {
        return (0, response_1.sendSuccess)(res, null, 'Logged out successfully');
    }
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
