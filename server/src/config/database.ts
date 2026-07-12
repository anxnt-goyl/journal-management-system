import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { UserModel } from '../models/User';
import { PaperModel } from '../models/Paper';
import { IssueModel } from '../models/Issue';
import { AnnouncementModel } from '../models/Announcement';
import { seedAnnouncements, seedIssues, seedPapers, seedUsers } from '../utils/seedData';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/journal-management-system';

export async function connectDatabase() {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined');
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected');
    await seedDatabase();
  } catch (error) {
    console.warn('MongoDB connection failed, continuing without it:', error);
  }
}

async function seedDatabase() {
  try {
    const userCount = await UserModel.countDocuments();
    if (userCount === 0) {
      const hashedUsers = await Promise.all(
        seedUsers.map(async (user) => ({
          ...user,
          password: await bcrypt.hash(user.password, 10),
        }))
      );
      await UserModel.create(hashedUsers);
      console.log('Seeded default users (demo password: Journal@123)');
    }
  } catch (error) {
    console.warn('User seed skipped:', error instanceof Error ? error.message : error);
  }

  try {
    const paperCount = await PaperModel.countDocuments();
    if (paperCount === 0) {
      await PaperModel.create(seedPapers);
    }
  } catch (error) {
    console.warn('Paper seed skipped:', error instanceof Error ? error.message : error);
  }

  try {
    const issueCount = await IssueModel.countDocuments();
    if (issueCount === 0) {
      await IssueModel.create(seedIssues);
    }
  } catch (error) {
    console.warn('Issue seed skipped:', error instanceof Error ? error.message : error);
  }

  try {
    const announcementCount = await AnnouncementModel.countDocuments();
    if (announcementCount === 0) {
      await AnnouncementModel.create(seedAnnouncements);
    }
  } catch (error) {
    console.warn('Announcement seed skipped:', error instanceof Error ? error.message : error);
  }
}
