/**
 * Create (or promote) an admin account.
 *
 * This is intentionally a server-side-only script, NOT an API endpoint —
 * admin accounts should never be creatable through a public HTTP request.
 *
 * Usage:
 *   npm run create-admin -- "Full Name" "email@example.com" "password123" "Institution Name"
 *
 * If the email already exists, it will be promoted to role 'admin'
 * (password left unchanged). Otherwise a brand-new admin account is created.
 */
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { env } from '../config/env';
import { UserModel } from '../models/User';

async function main() {
  const [name, email, password, institution] = process.argv.slice(2);

  if (!name || !email || !password || !institution) {
    console.error(
      'Usage: npm run create-admin -- "Full Name" "email@example.com" "password123" "Institution Name"'
    );
    process.exit(1);
  }

  if (password.length < 6) {
    console.error('Password must be at least 6 characters.');
    process.exit(1);
  }

  await mongoose.connect(env.MONGODB_URI);

  const existing = await UserModel.findOne({ email });
  if (existing) {
    existing.role = 'admin';
    await existing.save();
    console.log(`Existing user "${email}" promoted to admin.`);
  } else {
    const hashedPassword = await bcrypt.hash(password, 10);
    await UserModel.create({
      name,
      email,
      password: hashedPassword,
      institution,
      role: 'admin',
    });
    console.log(`Admin account created: ${email}`);
  }

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((error) => {
  console.error('Failed to create admin:', error);
  process.exit(1);
});