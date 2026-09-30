"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const employee_routes_1 = __importDefault(require("./employee.routes"));
const management_routes_1 = __importDefault(require("./management.routes"));
const ai_routes_1 = __importDefault(require("./ai.routes"));
const router = (0, express_1.Router)();
router.use('/auth', auth_routes_1.default);
router.use('/employee', employee_routes_1.default);
router.use('/management', management_routes_1.default);
router.use('/ai', ai_routes_1.default);
exports.default = router;
