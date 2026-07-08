import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'author' | 'reviewer' | 'admin';
  institution: string;
  bio?: string;
  avatar?: string;
  specialty?: string[];
  publicationsCount?: number;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['author', 'reviewer', 'admin'], required: true },
    institution: { type: String, required: true, trim: true },
    bio: { type: String },
    avatar: { type: String },
    specialty: [{ type: String }],
    publicationsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = async function (candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const UserModel = mongoose.model<IUser>('User', userSchema);
