import { connectDB, User } from "./db.js";

async function listUsers() {
  await connectDB();

  try {
    const users = await User.find({});
    
    if (users.length === 0) {
      console.log("❌ No users found in database");
      process.exit(0);
    }

    console.log(`✅ Found ${users.length} user(s):\n`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}`);
      console.log(`   Admin: ${user.isAdmin}`);
      console.log(`   Verified: ${user.isVerified}`);
      console.log(`   Sapphire: ${user.sapphireBalance}`);
      console.log("");
    });
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error listing users:", error);
    process.exit(1);
  }
}

listUsers();
