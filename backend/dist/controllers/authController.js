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
exports.googleLogin = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const google_auth_library_1 = require("google-auth-library");
const dbServices_1 = __importDefault(require("../services/dbServices"));
const googleClient = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-prod';
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, name } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        // Check if user exists
        const userCheck = yield dbServices_1.default.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }
        // Hash password
        const salt = yield bcryptjs_1.default.genSalt(10);
        const passwordHash = yield bcryptjs_1.default.hash(password, salt);
        const uid = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        // Insert user
        const newUser = yield dbServices_1.default.query('INSERT INTO users (uid, email, password_hash) VALUES ($1, $2, $3) RETURNING *', [uid, email, passwordHash]);
        const user = newUser.rows[0];
        // Generate token
        const token = jsonwebtoken_1.default.sign({ uid: user.uid, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({
            message: 'Registration successful',
            token,
            user: {
                uid: user.uid,
                email: user.email,
                name: name || null
            }
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        // Find user
        const userResult = yield dbServices_1.default.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = userResult.rows[0];
        if (!user || !user.password_hash) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        // Compare password
        const isMatch = yield bcryptjs_1.default.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        // Generate token
        const token = jsonwebtoken_1.default.sign({ uid: user.uid, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        res.json({
            message: 'Login successful',
            token,
            user: {
                uid: user.uid,
                email: user.email
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
});
exports.login = login;
const googleLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { credential } = req.body;
        if (!credential) {
            return res.status(400).json({ error: 'Google credential is required' });
        }
        const ticket = yield googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!(payload === null || payload === void 0 ? void 0 : payload.email)) {
            return res.status(400).json({ error: 'Invalid Google token payload' });
        }
        const { email, sub: googleId, name, picture } = payload;
        let user;
        // Check if user exists
        const userResult = yield dbServices_1.default.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            // Create new user for Google OAuth
            // Use google sub as native uid for consistency
            const newUser = yield dbServices_1.default.query('INSERT INTO users (uid, email) VALUES ($1, $2) RETURNING *', [googleId, email]);
            user = newUser.rows[0];
        }
        else {
            user = userResult.rows[0];
        }
        // Generate our own JWT for the application
        const token = jsonwebtoken_1.default.sign({ uid: user.uid, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        res.json({
            message: 'Google login successful',
            token,
            user: {
                uid: user.uid,
                email: user.email,
                name,
                picture
            }
        });
    }
    catch (error) {
        console.error('Google login error details:', error);
        res.status(500).json({ error: 'Server error during Google login', details: error.message || String(error) });
    }
});
exports.googleLogin = googleLogin;
