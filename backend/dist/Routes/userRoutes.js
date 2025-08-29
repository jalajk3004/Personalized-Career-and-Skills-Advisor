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
const Authenticate_js_1 = require("../middleware/Authenticate.js");
const dbServices_js_1 = __importDefault(require("../services/dbServices.js"));
const router = express_1.default.Router();
router.get("/me", Authenticate_js_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const { email, uid } = req.user;
    try {
        // 🟢 Insert into Postgres if user does not already exist
        const query = `
      INSERT INTO users (uid, email)
      VALUES ($1, $2)
      ON CONFLICT (uid) DO UPDATE 
      SET email = EXCLUDED.email
      RETURNING *;
    `;
        const result = yield dbServices_js_1.default.query(query, [uid, email]);
        res.json({
            message: "User authenticated & saved in database ✅",
            user: result.rows[0],
        });
    }
    catch (error) {
        console.error("Error saving user:", error);
        res.status(500).json({ message: "Database error" });
    }
}));
exports.default = router;
