const Users = require("../model/userModel");
const jsonwebtoken = require("jsonwebtoken");

exports.AuthorizeUser = (RequiredRole) => {
  return async (req, res, next) => {
    const token = req.cookies.jwt;
    if (!token) {
      return res.redirect("/auth/signin");
    }
    try {
      const decodedToken = jsonwebtoken.verify(
        token,
        process.env.JWT_API_SECRET_KEY
      );
      const user = await Users.findById(decodedToken._id);
      if (!user) {
        console.log("User not found");
        clearCookies(req, res);
        return res.redirect("/auth/signin");
      }

      if (
        user.role === RequiredRole ||
        (RequiredRole === "user" && user.role === "admin")
      ) {
        req.user = user;
        return next();
      } else {
        console.log("Role is not correct");
        clearCookies(req, res);
        return res.redirect("/auth/signin");
      }
    } catch (error) {
      console.error("JWT verification failed:", error);
      clearCookies(req, res);
      return res.redirect("/auth/signin");
    }
  };
};

function clearCookies(req, res) {
  res.clearCookie("jwt");
}

exports.FindUser = async (req, res, next) => {
  try {
    const cookieOtp = req.cookies.resetPasswordOTP;

    if (!cookieOtp) {
      req.flash("error", "No email found");
      return res.redirect("/auth/forget");
    }

    const decodedToken = jsonwebtoken.verify(
      cookieOtp,
      process.env.JWT_API_SECRET_KEY
    );

    const { otpVerified, emailVerified } = decodedToken;

    if (emailVerified === false) {
      if (otpVerified === false) {
        console.log("Email verified but OTP not verified yet");
        await req.flash("error", "Please verify your OTP");
        return res.redirect("/auth/otp");
      }
      console.log("Email Not verified in Cookie ");
      await req.flash("error", "Please verify your email first");
      return res.redirect("/auth/forget");
    }

    next();
  } catch (error) {
    console.error("Error verifying OTP:", error);
    req.flash("error", "Internal server error");
    return res.redirect("/auth/forget");
  }
};
