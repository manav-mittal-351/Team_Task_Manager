const User = require('../models/User');
const { success, error } = require('../utils/response');

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    success(res, 'Users fetched', users);
  } catch (err) { next(err); }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return error(res, 'User not found', [], 404);
    success(res, 'User details', user);
  } catch (err) { next(err); }
};

exports.updateProfile = async (req, res, next) => {
  try {
    if (req.params.id !== req.user.id) return error(res, 'Unauthorized', [], 403);
    const user = await User.findByIdAndUpdate(req.params.id, { name: req.body.name }, { new: true });
    success(res, 'Profile updated', user);
  } catch (err) { next(err); }
};

exports.deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    success(res, 'User deleted', null);
  } catch (err) { next(err); }
};
