const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { success, error } = require('../utils/response');
const { logActivity } = require('../utils/activityLogger');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return error(res, 'Email already exists', [], 400);

    const user = await User.create({ name, email, password });
    await logActivity(req, user._id, 'REGISTER', `New user registered: ${email}`);
    success(res, 'User registered successfully', user, 201);
  } catch (err) {
    if (err.code === 11000) return error(res, 'Email already exists', [], 400);
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) return error(res, 'Invalid email or password', [], 401);

    const valid = await user.comparePassword(password);
    if (!valid) return error(res, 'Invalid email or password', [], 401);

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await RefreshToken.create({
      token: refreshToken,
      user: user._id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    await logActivity(req, user._id, 'LOGIN', `User logged in: ${user.email}`);

    success(res, 'Login successful', {
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const token = req.body.refreshToken || req.cookies?.refreshToken;
    if (!token) return error(res, 'No refresh token provided', [], 401);

    const stored = await RefreshToken.findOne({ token, expiresAt: { $gt: new Date() } });
    if (!stored) return error(res, 'Invalid or expired refresh token', [], 401);

    const user = await User.findById(stored.user);
    if (!user) return error(res, 'User not found', [], 401);

    const accessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    stored.token = newRefreshToken;
    stored.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await stored.save();

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    success(res, 'Token refreshed', { accessToken, refreshToken: newRefreshToken });
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const token = req.body.refreshToken || req.cookies?.refreshToken;
    if (token) await RefreshToken.deleteOne({ token });
    res.clearCookie('refreshToken');
    await logActivity(req, req.user.id, 'LOGOUT', 'User logged out');
    success(res, 'Logged out successfully', null);
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return error(res, 'User not found', [], 404);
    success(res, 'User profile', user);
  } catch (err) {
    next(err);
  }
};
