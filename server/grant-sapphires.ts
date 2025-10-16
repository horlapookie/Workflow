
import { connectDB, User } from "./db";

async function grantSapphires() {
  await connectDB();

  try {
    // Grant 100 sapphires to all users
    const result = await User.updateMany(
      {}, 
      { 
        $inc: { sapphireBalance: 100 }
      }
    );

    console.log(`✅ Granted 100 sapphires to ${result.modifiedCount} users`);
    
    // Show updated balances
    const users = await User.find({}, 'email sapphireBalance');
    console.log('\nUpdated user balances:');
    users.forEach(user => {
      console.log(`  ${user.email}: ${user.sapphireBalance} sapphires`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error granting sapphires:", error);
    process.exit(1);
  }
}

grantSapphires();
