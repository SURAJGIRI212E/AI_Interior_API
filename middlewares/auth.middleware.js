// middleware/auth.middleware.js
import prisma from '../config/db.js';
import CustomError from '../utils/CustomError.js';
import asyncErrorHandler from '../utils/asyncErrorHandler.js';
import { generateAccessToken, verifyAccessToken, verifyRefreshToken } from '../utils/token.js';

const isAuthenticated = asyncErrorHandler(async (req, res, next) => {
    const accessToken = req.cookies.access_token;
    const refreshToken = req.cookies.refresh_token;

    if (!accessToken && !refreshToken) {
        return next(new CustomError('Please login to access this resource', 401));
    }

    // First try to verify access token
    if (accessToken) {
        try {
            const decoded = verifyAccessToken(accessToken);

            if (!decoded) {
                return next(new CustomError('Invalid access token', 401));
            }

            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: { id: true, email: true, name: true }
            });

            if (!user) {
                return next(new CustomError('User with given token not found', 404));
            }

            req.user = { userId: user.id, name: user.name, email: user.email };
            return next();
        } catch (error) {
            if (error.name !== 'TokenExpiredError') {
                return next(new CustomError('Invalid access token', 401));
            }
            // fall through to refresh token flow when access token expired
        }
    }

    // If access token is expired, verify refresh token
    if (!refreshToken) {
        return next(new CustomError('Please login again', 401));
    }

    let decoded;
    try {
        decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
        return next(new CustomError('Invalid refresh token', 401));
    }

    if (!decoded) {
        return next(new CustomError('Invalid refresh token', 401));
    }

    const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, name: true }
    });

    if (!user) {
        return next(new CustomError('User not found', 404));
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user.id);

    // Set new access token in cookie
    res.cookie('access_token', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        path: '/',
        maxAge: 60 * 60 * 1000 // 60 minutes
    });

    // Set req.user after successful refresh token verification
    req.user = { userId: user.id, name: user.name, email: user.email };
    next();
});

export default isAuthenticated;