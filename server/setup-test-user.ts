import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { config } from './config';
import { User, Bot } from './db';

async function setupTestUser() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(config.mongodb.uri);
    console.log('Connected to MongoDB');

    // Clear all existing users and bots
    console.log('Clearing database...');
    await User.deleteMany({});
    await Bot.deleteMany({});
    console.log('Database cleared');

    // Create test user
    console.log('Creating test user...');
    const hashedPassword = await bcrypt.hash('Omotoyosi', 10);
    
    const testUser = new User({
      email: 'horlapookie@gmail.com',
      password: hashedPassword,
      sapphireBalance: 1000,
      isVerified: true,
      isAdmin: false,
      dailyClaimed: 0,
      lastClaimDate: null,
    });

    await testUser.save();
    console.log('✅ Test user created successfully!');
    console.log('Email: horlapookie@gmail.com');
    console.log('Password: Omotoyosi');
    console.log('Sapphire Balance: 1000');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error setting up test user:', error);
    process.exit(1);
  }
}

setupTestUser();
