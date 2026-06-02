import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  createUser,
  getUserByEmail,
  getUserById,
  getUserByUsername,
} from "../models/userModel.js";
import { sendError } from "../lib/apiResponse.js";
import { hasRequiredFields } from "../lib/validation.js";
import { getJwtSecret } from "../lib/jwt.js";

const saltRounds = 10;

function makeToken(user) {
  return jwt.sign({ id: user.id }, getJwtSecret(), {
    expiresIn: "7d",
  });
}

async function registerUser(req, res, next) {
  try {
    const { username, email, password } = req.body;

    if (!hasRequiredFields(req.body, ["username", "email", "password"])) {
      return sendError(res, 400, "Username, email, and password are required");
    }

    if (password.length < 6) {
      return sendError(res, 400, "Password must be at least 6 characters");
    }

    const existingUsername = await getUserByUsername(username);
    if (existingUsername) return sendError(res, 409, "Username already exists");

    const existingEmail = await getUserByEmail(email);
    if (existingEmail) return sendError(res, 409, "Email already exists");

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const user = await createUser({
      username,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User registered",
      token: makeToken(user),
      user,
    });
  } catch (error) {
    next(error);
  }
}

async function loginUser(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!hasRequiredFields(req.body, ["email", "password"])) {
      return sendError(res, 400, "Email and password are required");
    }

    const user = await getUserByEmail(email);
    if (!user) return sendError(res, 401, "Invalid credentials");

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) return sendError(res, 401, "Invalid credentials");

    res.json({
      message: "Login successful",
      token: makeToken(user),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function getCurrentUser(req, res, next) {
  try {
    const user = await getUserById(req.userId);

    if (!user) return sendError(res, 404, "User not found");

    res.json(user);
  } catch (error) {
    next(error);
  }
}

export { getCurrentUser, loginUser, registerUser };
