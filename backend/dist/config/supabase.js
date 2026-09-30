"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const env_1 = require("./env");
const supabaseKey = env_1.config.supabaseServiceRoleKey || env_1.config.supabaseAnonKey;
exports.supabase = (0, supabase_js_1.createClient)(env_1.config.supabaseUrl, supabaseKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
    },
});
