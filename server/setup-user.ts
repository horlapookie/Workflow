import bcrypt from "bcrypt";
import { connectDB, User } from "./db";

async function createUser() {
  await connectDB();

  const email = "olamilekanidowu998@gmail.com";
  const password = "Omotoyosi";

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("✅ User already exists:", email);
      console.log("User details:", {
        email: existingUser.email,
        isAdmin: existingUser.isAdmin,
        sapphireBalance: existingUser.sapphireBalance,
      });
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      isAdmin: false,
      sapphireBalance: 10, // Give initial sapphires
    });

    await user.save();

    console.log("✅ User created successfully!");
    console.log("Email:", email);
    console.log("Password: Omotoyosi");
    console.log("Sapphire Balance: 10");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating user:", error);
    process.exit(1);
  }
}

createUser();
