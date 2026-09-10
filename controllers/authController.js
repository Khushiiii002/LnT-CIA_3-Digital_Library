const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { generateToken, generateMembershipId } = require("../utils/helpers");

// Module 1: Member Registration
// Public registration can only ever create "member" accounts.
// Admin/librarian accounts are created exclusively through
// createLibrarian (staff-only) and the seed script.
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, memberType, phone } = req.body;

    if (req.body.role && req.body.role !== "member") {
      return res.status(403).json({
        success: false,
        message: "Privileged roles cannot be self-assigned through public registration",
        errorCode: "ROLE_FORBIDDEN",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
        errorCode: "DUPLICATE_EMAIL",
      });
    }

    const userCount = await User.countDocuments({ role: "member" });
    const membershipId = generateMembershipId("member", userCount + 1);

    const user = await User.create({
      name,
      email,
      passwordHash: password,
      role: "member",
      memberType: memberType || "student",
      membershipId,
      phone: phone || "",
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Member registered successfully",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Module 1: Login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
        errorCode: "MISSING_FIELDS",
      });
    }

    const user = await User.findOne({ email }).select("+passwordHash");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
        errorCode: "INVALID_CREDENTIALS",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account has been deactivated",
        errorCode: "ACCOUNT_DEACTIVATED",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
        errorCode: "INVALID_CREDENTIALS",
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get current user profile
exports.getProfile = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: req.user,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get all users
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 100 } = req.query;
    const query = {};
    if (role) query.role = role;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Deactivate user
exports.deactivateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        errorCode: "NOT_FOUND",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deactivated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// Librarian/Admin: Create librarian account
exports.createLibrarian = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
        errorCode: "DUPLICATE_EMAIL",
      });
    }

    const userCount = await User.countDocuments({ role: "librarian" });
    const membershipId = generateMembershipId("librarian", userCount + 1);

    const user = await User.create({
      name,
      email,
      passwordHash: password,
      role: "librarian",
      memberType: "faculty",
      membershipId,
      phone: phone || "",
    });

    res.status(201).json({
      success: true,
      message: "Librarian account created successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
