// controllers/auth.controller.js
import prisma from '../config/db.js';
import asyncErrorHandler from '../utils/asyncErrorHandler.js';
import CustomError from '../utils/CustomError.js';
import { generateAccessToken, generateRefreshToken } from '../utils/token.js';
import { hashPassword, comparePassword } from '../utils/password.js';

export const register = asyncErrorHandler(async (req, res, next) => {
    const { email, name, password } = req.body;

    // Validate required fields
    if (!email || !password) {
        return next(new CustomError('Email and password are required', 400));
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
    });

    if (existingUser) {
        return next(new CustomError('Email already exists', 400));
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create new user
    const user = await prisma.user.create({
        data: {
            email: email.toLowerCase(),
            passwordHash,
            name: name || null
        },
        select: {
            id: true,
            email: true,
            name: true
        }
    });

    res.status(201).json({
        status: 'success',
        message: 'User registered successfully',
        userId: user.id
    });
});

export const login = asyncErrorHandler(async (req, res, next) => {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
        return next(new CustomError('Email and password are required', 400));
    }

    // Find user by email (include passwordHash for verification)
    const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
    });

    if (!user || !(await comparePassword(password, user.passwordHash))) {
        return next(new CustomError('Invalid email or password', 401));
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Set access token cookie
    res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        path: '/',
        maxAge: 60 * 60 * 1000 // 60 minutes
    });

    // Set refresh token cookie
    res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Send response
    return res.status(200).json({
        status: 'success',
        message: 'Login successful',
        user: {
            id: user.id,
            email: user.email,
            name: user.name
        }
    });
});

export const getMe = asyncErrorHandler(async (req, res, next) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: {
            id: true,
            email: true,
            name: true
        }
    });

    if (!user) {
        return next(new CustomError('User not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: user
    });
});

export const logout = asyncErrorHandler(async (req, res, next) => {
    // Clear cookies with options to match how they were set
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        path: '/'
    };

    res.clearCookie('access_token', cookieOptions);
    res.clearCookie('refresh_token', cookieOptions);

    return res.status(200).json({
        status: 'success',
        message: 'Logout successful'
    });
});