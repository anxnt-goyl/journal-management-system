import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { env } from '../config/env';
import { uploadAvatarBufferToCloudinary } from '../utils/cloudinary';

const JWT_SECRET = env.JWT_SECRET;
const JWT_EXPIRES_IN = env.JWT_EXPIRES_IN;

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, institution, role = 'author', bio } = req.body;

    if (!name || !email || !password || !institution) {
      return res.status(400).json({ message: 'Name, email, password, and institution are required' });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Profile photo is optional. If the person attached one, upload it to Cloudinary;
    // otherwise leave avatar unset so the frontend can render an initials-based
    // placeholder instead of a stock photo of a stranger.
    let avatarUrl: string | undefined;
    if (req.file) {
      try {
        const uploaded = await uploadAvatarBufferToCloudinary(req.file.buffer, req.file.originalname, email);
        avatarUrl = uploaded.secure_url;
      } catch (uploadError) {
        return res.status(502).json({ message: 'Profile photo upload failed', error: uploadError });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      institution,
      role,
      bio,
      avatar: avatarUrl,
    });

    const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        institution: user.institution,
        bio: user.bio,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Registration failed', error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        institution: user.institution,
        bio: user.bio,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Login failed', error });
  }
};

export const logout = (_req: Request, res: Response) => {
  return res.json({ message: 'Logout successful' });
};
