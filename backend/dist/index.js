"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Import controllers
// Create Express app
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: true }));
app.use(express_1.default.json());
// Routes
// app.post("/api/career/recommendations", authenticateUser, careerController.generateRecommendations);
// app.get("/api/career/recommendations", authenticateUser, careerController.getRecommendations);
app.get("/check", (req, res) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
});
app.listen(process.env.PORT, () => {
    console.log(`🚀 Server running at http://localhost:${process.env.PORT}`);
});
