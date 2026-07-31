import { listUsers } from '../data/store.js';

export const getAllUsers = async (req, res) => {
  try {
    const users = listUsers();
    return res.json({ success: true, count: users.length, users });
  } catch (error) {
    console.error('AdminController.getAllUsers error', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
