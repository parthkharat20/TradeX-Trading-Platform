const UserModel = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register
const register = async (req, res) => {
  try {
    const { userName, email, password } = req.body;

    console.log("Registration attempt:", { userName, email }); // Debug log

    // Validation
    if (!userName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (userName.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must be at least 2 characters",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // Check if user already exists
    const existingUser = await UserModel.findOne({ 
      email: email.toLowerCase().trim() 
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "This email is already registered. Please sign in instead.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = new UserModel({
      userName: userName.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    });

    await newUser.save();

    console.log("User created successfully:", newUser._id); // Debug log

    // Generate token
    const token = jwt.sign(
      { 
        userId: newUser._id, 
        email: newUser.email,
        userName: newUser.userName 
      },
      process.env.JWT_SECRET || "tradex-secret-key-2024",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      userName: newUser.userName,
      userId: newUser._id,
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed. Please try again.",
      error: error.message,
    });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Login attempt:", email); // Debug log

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user
    const user = await UserModel.findOne({ 
      email: email.toLowerCase().trim() 
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email,
        userName: user.userName 
      },
      process.env.JWT_SECRET || "tradex-secret-key-2024",
      { expiresIn: "7d" }
    );

    console.log("Login successful:", user._id); // Debug log

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      userName: user.userName,
      userId: user._id,
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
    });
  }
};

module.exports = { register, login };