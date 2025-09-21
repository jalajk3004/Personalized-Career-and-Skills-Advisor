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
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const userRoutes_1 = __importDefault(require("./Routes/userRoutes"));
const careerRoutes_1 = __importDefault(require("./Routes/careerRoutes"));
const dbServices_1 = __importDefault(require("./services/dbServices"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: true }));
app.use(express_1.default.json());
// server.js (temporary debugging code)
// Health check endpoint
app.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield dbServices_1.default.query("SELECT current_database(), current_user, version()");
        res.json({
            status: "healthy",
            database: result.rows[0].current_database,
            user: result.rows[0].current_user,
            version: result.rows[0].version.split(' ')[0],
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error("Health check failed:", error);
        res.status(500).json({
            status: "unhealthy",
            error: error instanceof Error ? error.message : String(error),
            timestamp: new Date().toISOString()
        });
    }
}));
// Additional health check endpoint
app.get("/health", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield dbServices_1.default.query("SELECT 1");
        res.json({ status: "ok", timestamp: new Date().toISOString() });
    }
    catch (error) {
        res.status(500).json({
            status: "error",
            message: error instanceof Error ? error.message : String(error),
            timestamp: new Date().toISOString()
        });
    }
}));
app.use("/api/users", userRoutes_1.default);
app.use("/api/career-recommendations", careerRoutes_1.default);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
