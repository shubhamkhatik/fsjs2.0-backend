// signup a new user
import User from "../models/user.schema.js";
import asyncHandler from "../service/asyncHandler.js";
import CustomError from "../utils/customError.js";

export const cookieOptions = {
  expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  httpOnly: true,
};

/******************************************************
 * @SIGNUP
 * @route http://localhost:5000/api/auth/signup
 * @description User signUp Controller for creating new user
 * @returns User Object
 ******************************************************/

export const signUp = asyncHandler(async (req, res) => {
  //get data from user
  const { name, email, password,role} = req.body;

  //validation
  if (!name || !email || !password || !role) {
    throw new CustomError("PLease add name, email, password all fields", 400);
    // throw new Error("Got an error") - We are using customError
  }

  //lets add this data to database

  //check if user already exists
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new CustomError("User already exists", 400);
  }

  const user = await User.create({
    name,
    email,
    password,
    role
  });

  const token = user.getJWTtoken();
  //safety
  //password is flush out
  // not from db
  user.password = undefined;

  //store this token in user's cookie
  res.cookie("token", token, cookieOptions);

  // send back a response to user
  res.status(200).json({
    success: true,
    message: "Account successfully created",
    token: token ?? "token not generated",
    user,
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  //validation
  if (!email || !password) {
    throw new CustomError("PLease fill all details", 400);
  }

  const user = await User.findOne({ email }).select("+password");
  console.log("user object", user);

  if (!user) {
    throw new CustomError("Invalid credentials", 400);
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (isPasswordMatched) {
    const token = await user.getJWTtoken();
    user.password = undefined;
    res.cookie("token", token, cookieOptions);
    return res.status(200).json({
      success: true,
      token: token ?? "token not generated",
      user,
    });
  }

  throw new CustomError("Password is incorrect", 400);
});

export const logout = asyncHandler(async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});
//IN the isLoggedIn middleware we save the user info email role and name in req
// so we dont need to check again token
//we use this getProfile after isLoggedin middleware
export const getProfile = asyncHandler(async (req, res) => {
  // const user = req.user
  const { user } = req;
  if (!user) {
    throw new CustomError("User not found", 401);
  }
  res.status(200).json({
    success: true,
    user,
  });
});
