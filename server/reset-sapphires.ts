
import { connectDB, User } from "./db";

async function resetSapphires() {
  await connectDB();

  try {
    const result = await User.updateMany(
      {}, 
      { 
        sapphireBalance: 0, 
        dailyClaimed: 0,
        lastClaimDate: null 
      }
    );

    console.log(`✅ Reset sapphire balances for ${result.modifiedCount} users`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error resetting sapphires:", error);
    process.exit(1);
  }
}

resetSapphires();
