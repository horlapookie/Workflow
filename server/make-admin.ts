
import { connectDB, User } from "./db";

async function makeAdmin() {
  await connectDB();

  const email = "horlapookie@gmail.com";

  try {
    const user = await User.findOneAndUpdate(
      { email },
      { isAdmin: true },
      { new: true }
    );

    if (!user) {
      console.log("❌ User not found:", email);
      process.exit(1);
    }

    console.log("✅ User is now an admin!");
    console.log("Email:", user.email);
    console.log("IsAdmin:", user.isAdmin);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error making admin:", error);
    process.exit(1);
  }
}

makeAdmin();
