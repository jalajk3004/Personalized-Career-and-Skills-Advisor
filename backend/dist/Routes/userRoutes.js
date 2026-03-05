"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const dbServices_1 = __importDefault(require("../services/dbServices"));
const Authenticate_1 = require("../middleware/Authenticate");
const router = express_1.default.Router();
// Auth Endpoints
router.post("/register", authController_1.register);
router.post("/login", authController_1.login);
router.post("/google", authController_1.googleLogin);
// Protected user routes
router.get("/me", Authenticate_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const { email, uid } = req.user;
    try {
        // The user should already exist from login/register, but we can return it.
        const query = `SELECT * FROM users WHERE uid = $1`;
        const result = yield dbServices_1.default.query(query, [uid]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({
            message: "User fetched successfully",
            user: result.rows[0],
        });
    }
    catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Database error" });
    }
}));
exports.default = router;
