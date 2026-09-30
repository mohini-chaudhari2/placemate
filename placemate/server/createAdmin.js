const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

const User = require('./models/User');

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('MongoDB connected');

    const existingAdmin = await User.findOne({
      email: 'admin@placemate.com',
    });

    if (existingAdmin) {
      console.log('Admin account already exists.');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(
      'Admin@123456',
      10
    );

    const admin = await User.create({
      name: 'PlaceMate Admin',
      email: 'admin@placemate.com',
      password: hashedPassword,
      role: 'admin',
    });

    console.log('Admin account created successfully.');
    console.log(`Email: ${admin.email}`);
    console.log('Password: Admin@123456');

    process.exit(0);
  } catch (error) {
    console.error('Failed to create admin:', error);
    process.exit(1);
  }
};

createAdmin();