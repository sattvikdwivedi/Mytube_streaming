import { User } from "../models/user.model.js";
import ApiErrors from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import ApiRespone from "./../utils/ApiResponse.js";

const generateAccessRefreshToken = async (userId) => {
  try {
    console.log(userId, "userId ");
    const user = await User.findById(userId);
    console.log(user, "user ");
    const AccessToken = await user.generateAccessToken();
    console.log(AccessToken, "AccessToken in generateAccessToken");
    const RefreshToken = await user.generateRefreshToken();
    console.log(RefreshToken, "RefreshToken in generateRefreshToken");
    user.refreshToken = RefreshToken;
    await user.save({ validateBeforeSave: false });

    return { AccessToken, RefreshToken };
  } catch (error) {
    throw new ApiErrors(
      500,
      "Somethings Went Wrong while generating the Token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullname, email, username, password } = req.body;

  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiErrors(400, "All field are required");
  }

  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    throw new ApiErrors(409, "User with email or username is already exist");
  }

  console.log(req.files, "files");

  const avatarLocalPath = req.files?.Avatar[0]?.path; // path of avatar of local server
  let coverImageLocalPath;

  if (
    req.files &&
    Array.isArray(req.files.CoverImage) &&
    req.files.CoverImage.length > 0
  ) {
    coverImageLocalPath = req.files?.CoverImage[0]?.path; // path of coverImage of local server
  }

  if (!avatarLocalPath) {
    throw new ApiErrors(400, "Images is required(Avatar)");
  }
  const avartarImage = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avartarImage) {
    throw new ApiErrors(400, "Images is required(Avatar)");
  }

  const user = await User.create({
    fullname,
    avatar: avartarImage.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });
  console.log(user);
  const createdUser = await User.findById(user._id).select(
    " -password -refreshToken "
  );

  if (!createdUser) {
    throw new ApiErrors(500, "Something went while creation ");
  }

  return res
    .status(201)
    .json(new ApiRespone(201, createdUser, "User Register Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email && !password)
    throw new ApiErrors(400, "Username or Email is required");
  const ValidUser = await User.findOne({ email });
  if (!ValidUser) throw new ApiErrors(404, "user is not Registered ");
  const isPasswordCorrect = await ValidUser.isPasswordCorrect(password);
  if (!isPasswordCorrect) throw new ApiErrors(401, "Password incorrect");

  const { AccessToken, RefreshToken } = await generateAccessRefreshToken(
    ValidUser._id
  );
  const loggedInUser = await User.findById(ValidUser._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  }; // It is for cookies in general term then cookies is changeble from frontend but not httponly true reflects that it is modifiable form server
  return res
    .status(200)
    .cookie("accessToken", AccessToken, options)
    .cookie("refreshToken", RefreshToken, options)
    .json(
      new ApiRespone(
        {
          user: loggedInUser,
          AccessToken,
          RefreshToken,
        },
        "user Logged In"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    $set: {
      refreshToken: undefined,
    },
  });
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiRespone(200, null, "User Logged out Successfully"));
});
const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) throw new ApiErrors(401, "Refresh Token not found");
    decodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    if (!decodedToken) throw new ApiErrors(401, "Invalid Refresh Token");
    const user = await User.findById(decodedToken._id).select(
      "-password -refreshToken"
    );
    if (!user) throw new ApiErrors(401, "User not found with this token");
    if (user.refreshToken !== refreshToken)
      throw new ApiErrors(401, "Invalid Refresh Token");
    const { AccessToken, RefreshToken } = await generateAccessRefreshToken(
      user._id
    );
    options = {
      httpOnly: true,
      secure: true,
    };
    res
      .status(200)
      .cookie("accessToken", AccessToken, options)
      .cookie("refreshToken", RefreshToken, options)
      .json(
        new ApiRespone(
          200,
          { AccessToken, RefreshToken },
          "Tokens Generated Successfully"
        )
      );
  } catch (error) {
    throw new ApiErrors(500, "Something went wrong in refresh token");
  }
});
const PasswordReset = asyncHandler(async (req, res) => {
  let { newPassword, oldPassword } = req.body;
  let ValidUser = await User.findById(req.user?._id);

  if (!ValidUser) throw new ApiErrors(404, "user is not fetched ");
  const isPasswordCorrect = await ValidUser.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) throw new ApiErrors(401, "Old is Password incorrect");

  ValidUser.password = newPassword;
  await ValidUser.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiRespone(200, null, "Password Updated Successfully"));
});
const currentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiRespone(200, req.user, "User Fetched Successfully"));
});

const updateUserDetail = asyncHandler(async (req, res) => {
  const { fullname, email } = req.body;
  if ([fullname, email].some((field) => field?.trim() === "")) {
    throw new ApiErrors(400, "All field are required");
  }

  const user = findByIdAndUpdate(
    req.user._id,
    {
      $set: { fullname, email },
    },
    {
      new: true,
    }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiRespone(200, user, "User Updated Successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiErrors(400, "Images is required(Avatar)");
  }
  const avatarImage = await uploadOnCloudinary(avatarLocalPath);
  if (!avatarImage) {
    throw new ApiErrors(400, "Images is required(Avatar)");
  }
  const user = await User.findByIdAndUpdate(req.user._id, {
    $set: { avatar: avatarImage.url },
  });
  if (!user) throw new ApiErrors(404, "User not found");
  return res
    .status(200)
    .json(new ApiRespone(200, user, "User Avatar Updated Successfully"));
});
const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;
  console.log(coverImageLocalPath, "avatarLocalPath in updateCoverImage");
  if (!coverImageLocalPath) {
    throw new ApiErrors(400, "Images is required(CoverImage)");
  }
  const avatarImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!avatarImage) {
    throw new ApiErrors(400, "Images is required(CoverImage)");
  }
  const user = await User.findByIdAndUpdate(req.user._id, {
    $set: { coverImage: coverImage.url },
  });
  if (!user) throw new ApiErrors(404, "User not found");
  return res
    .status(200)
    .json(new ApiRespone(200, user, "User Cover Image Updated Successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  PasswordReset,
  currentUser,
  updateUserDetail,
  updateUserAvatar,
  updateUserCoverImage,
};
