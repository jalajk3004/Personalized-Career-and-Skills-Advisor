import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import pool from '../services/dbServices';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-prod';

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Check if user exists
        const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const uid = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Insert user
        const newUser = await pool.query(
            'INSERT INTO users (uid, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
            [uid, email, passwordHash]
        );

        const user = newUser.rows[0];

        // Generate token
        const token = jwt.sign(
            { uid: user.uid, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'Registration successful',
            token,
            user: {
                uid: user.uid,
                email: user.email,
                name: name || null
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = userResult.rows[0];

        if (!user || !user.password_hash) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign(
            { uid: user.uid, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                uid: user.uid,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
};

export const googleLogin = async (req: Request, res: Response) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({ error: 'Google credential is required' });
        }

        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        if (!payload?.email) {
            return res.status(400).json({ error: 'Invalid Google token payload' });
        }

        const { email, sub: googleId, name, picture } = payload;
        let user;

        // Check if user exists
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (userResult.rows.length === 0) {
            // Create new user for Google OAuth
            // Use google sub as native uid for consistency
            const newUser = await pool.query(
                'INSERT INTO users (uid, email) VALUES ($1, $2) RETURNING *',
                [googleId, email]
            );
            user = newUser.rows[0];
        } else {
            user = userResult.rows[0];
        }

        // Generate our own JWT for the application
        const token = jwt.sign(
            { uid: user.uid, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

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

    } catch (error: any) {
        console.error('Google login error details:', error);
        res.status(500).json({ error: 'Server error during Google login', details: error.message || String(error) });
    }
};
