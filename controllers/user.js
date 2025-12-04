const { body, validationResult } = require('express-validator');
const User = require('../models/user');

const rules = [
  body('name').isString().notEmpty().withMessage('Name must be non-empty string'),
  body('age').isInt({ min: 1 }).withMessage('Age must be positive integer')
];

const getAllUsers = (req, res) => res.json(User.getAllUsers());

const getUserById = (req, res, next) => {
  const user = User.getUserById(req.params.id);
  if (!user) return next(Object.assign(new Error('User not found'), { status: 404 }));
  res.json(user);
};

const createUser = [
  ...rules,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(Object.assign(new Error('Validation failed'), { status: 400, details: errors.array() }));
    const { name, age } = req.body;
    res.status(201).json(User.createUser(name, age));
  }
];

const updateUser = [
  ...rules,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(Object.assign(new Error('Validation failed'), { status: 400, details: errors.array() }));
    const { name, age } = req.body;
    const updated = User.updateUser(req.params.id, name, age);
    if (!updated) return next(Object.assign(new Error('User not found'), { status: 404 }));
    res.json(updated);
  }
];

const deleteUser = (req, res, next) => {
  const ok = User.deleteUser(req.params.id);
  if (!ok) return next(Object.assign(new Error('User not found'), { status: 404 }));
  res.status(204).send();
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };
