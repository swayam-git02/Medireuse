import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import {
  createRefreshTokenRecord,
  createUser,
  findRefreshToken,
  findUserByEmail,
  getUserById,
  getUserWithPasswordByEmail,
  revokeRefreshToken,
} from '../data/store.js';

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

const generateRefreshTokenString = () => crypto.randomBytes(40).toString('hex');

const issueRefreshToken = (userId) => {
  const token = generateRefreshTokenString();
  const expiresInDays = parseInt(process.env.REFRESH_EXPIRE_DAYS || '30', 10);
  const expires = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

  createRefreshTokenRecord({
    userId,
    token,
    expires,
  });

  return { token, expires };
};

const setRefreshCookie = (res, refreshToken) => {
  res.cookie('refreshToken', refreshToken.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    maxAge: refreshToken.expires.getTime() - Date.now(),
  });
};

const buildAuthUserPayload = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

export const register = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email',
      });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    const existingUser = findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    const user = createUser({
      name,
      email,
      password,
      phone,
      address,
    });

    const token = generateToken(user._id);
    const refreshToken = issueRefreshToken(user._id);
    setRefreshCookie(res, refreshToken);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: buildAuthUserPayload(user),
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error registering user',
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const user = getUserWithPasswordByEmail(email);
    if (!user || !user.comparePassword(password)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const token = generateToken(user._id);
    const refreshToken = issueRefreshToken(user._id);
    setRefreshCookie(res, refreshToken);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: buildAuthUserPayload(user),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error logging in',
    });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const refreshTokenValue =
      req.cookies?.refreshToken || req.body?.refreshToken || req.headers['x-refresh-token'];

    if (!refreshTokenValue) {
      return res.status(401).json({ success: false, message: 'No refresh token provided' });
    }

    const tokenDoc = findRefreshToken(refreshTokenValue);
    if (!tokenDoc || tokenDoc.revoked || !tokenDoc.user) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    if (tokenDoc.expires && tokenDoc.expires < new Date()) {
      return res.status(401).json({ success: false, message: 'Refresh token expired' });
    }

    revokeRefreshToken(refreshTokenValue);

    const newRefreshToken = issueRefreshToken(tokenDoc.user._id);
    setRefreshCookie(res, newRefreshToken);

    const accessToken = generateToken(tokenDoc.user._id);
    res.json({ success: true, token: accessToken });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ success: false, message: 'Error refreshing token' });
  }
};

export const logout = async (req, res) => {
  try {
    const refreshTokenValue =
      req.cookies?.refreshToken || req.body?.refreshToken || req.headers['x-refresh-token'];

    if (refreshTokenValue) {
      revokeRefreshToken(refreshTokenValue);
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
    });

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, message: 'Error logging out' });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = getUserById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting user data',
    });
  }
};
