import mongoose from 'mongoose';
import dotenv from 'dotenv';
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
      await UserModel.create(seedUsers);
    }

    const paperCount = await PaperModel.countDocuments();
    if (paperCount === 0) {
      await PaperModel.create(seedPapers);
    }

    const issueCount = await IssueModel.countDocuments();
    if (issueCount === 0) {
      await IssueModel.create(seedIssues);
    }

    const announcementCount = await AnnouncementModel.countDocuments();
    if (announcementCount === 0) {
      await AnnouncementModel.create(seedAnnouncements);
    }
  } catch (error) {
    console.warn('Seed data initialization skipped:', error);
  }
}
