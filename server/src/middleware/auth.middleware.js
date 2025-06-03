import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { verifyAccessToken } from "../utils/jwt.js";

export const authenticate = asyncHandler(async (req, res, next) => {
  try {
    // 1. Get token from cookies or Authorization header
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request - No token provided");
    }

    // 2. Verify token
    const decoded = verifyAccessToken(token);
    if (!decoded) {
      throw new ApiError(401, "Invalid access token");
    }

    // 3. Get user from DB and attach to request
    const user = await User.findById(decoded.id).select(
      "-password -refreshToken"
    );
    if (!user) {
      throw new ApiError(401, "User not found");
    }

    // 4. Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});

const isProduction = process.env.NODE_ENV === "production";
export const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "None" : "Lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};
