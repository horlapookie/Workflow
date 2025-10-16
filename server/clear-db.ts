import { connectDB, User, Bot } from "./db";

async function clearDatabase() {
  try {
    await connectDB();
    
    console.log("Clearing all users...");
    const userResult = await User.deleteMany({});
    console.log(`Deleted ${userResult.deletedCount} users`);
    
    console.log("Clearing all bots...");
    const botResult = await Bot.deleteMany({});
    console.log(`Deleted ${botResult.deletedCount} bots`);
    
    console.log("Database cleared successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error clearing database:", error);
    process.exit(1);
  }
}

clearDatabase();
