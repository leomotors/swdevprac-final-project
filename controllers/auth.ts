import { Request, Response, NextFunction, RequestHandler } from "express";
import User, { IUser } from "../models/User";
import { LoginRequestSchema, RegisterRequestSchema } from "../schemas/auth";
import { AuthRequest } from "../middleware/auth";

//@desc    Register user
//@route   POST /api/v1/auth/register
//@access  Public
export const register: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { name, email, password, role } = RegisterRequestSchema.parse(
      req.body
    );

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    sendTokenResponse(user, 200, res);
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

//@desc    Login user
//@route   POST /api/v1/auth/login
//@access  Public
export const login: RequestHandler = async (req, res) => {
  try {
    const data = LoginRequestSchema.safeParse(req.body);

    // Validate email & password
    if (!data.success) {
      res.status(400).json({
        success: false,
        message: "Please provide a valid email and password",
      });
      return;
    }

    const { email, password } = data.data;

    // Check for user
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    sendTokenResponse(user, 200, res);
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

//@desc    Get current logged in user
//@route   GET /api/v1/auth/me
//@access  Private
export const getMe: RequestHandler = async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.user?.id);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

//@desc    Log user out / clear cookie
//@route   GET /api/v1/auth/logout
//@access  Private
export const logout: RequestHandler = async (req, res) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "User logged out successfully",
  });
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user: IUser, statusCode: number, res: Response) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() +
        parseInt(process.env.JWT_COOKIE_EXPIRE || "30") * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: false,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
  });
};
