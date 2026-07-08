import { body } from 'express-validator';

export const registerValidation = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters.'),
  body('email').isEmail().withMessage('A valid email is required.').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
  body('institution').trim().notEmpty().withMessage('Institution is required.'),
  body('role').optional().isIn(['author', 'reviewer', 'admin']).withMessage('Role must be author, reviewer, or admin.'),
];

export const loginValidation = [
  body('email').isEmail().withMessage('A valid email is required.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.'),
];
