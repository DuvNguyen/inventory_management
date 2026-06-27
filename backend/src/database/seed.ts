import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not defined in environment variables');
    process.exit(1);
  }

  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('SEED_ADMIN_EMAIL or SEED_ADMIN_PASSWORD is not defined');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('SEED_ADMIN_PASSWORD must be at least 8 characters long');
    process.exit(1);
  }

  console.log(`Connecting to MongoDB...`);
  await mongoose.connect(uri);

  // Define User Schema inline to ensure it operates correctly in a standalone script context
  const userSchema = new mongoose.Schema({
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    role: { type: String, required: true },
  });

  const UserModel = mongoose.model('User', userSchema);

  // Check if ADMIN already exists
  const existingAdmin = await UserModel.findOne({ role: 'ADMIN' });
  if (existingAdmin) {
    console.log(`An ADMIN user already exists in the database. Skipping seed.`);
    await mongoose.disconnect();
    return;
  }

  // Double check by email
  const existingEmail = await UserModel.findOne({
    email: email.toLowerCase().trim(),
  });
  if (existingEmail) {
    console.log(`User with email "${email}" already exists. Skipping seed.`);
    await mongoose.disconnect();
    return;
  }

  console.log(`Hashing admin password...`);
  const hashedPassword = await bcrypt.hash(password, 12);

  console.log(`Creating ADMIN user...`);
  await UserModel.create({
    email: email.toLowerCase().trim(),
    password: hashedPassword,
    firstName: 'System',
    lastName: 'Admin',
    role: 'ADMIN',
  });

  console.log(`ADMIN user seeded successfully!`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed script failed:', err);
  process.exit(1);
});
