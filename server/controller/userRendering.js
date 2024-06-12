const bcrypt = require("bcrypt");
const User = require("../model/userModel");

//rendering
exports.signin = async (req, res) => {
  const info = req.flash("success");
  const error = req.flash("error");
  const local = {
    title: "Sign In",
    discription: "Sign In",
    message: { success: info, error: error },
  };
  res.render("users/signin", { local, layout: "layouts/main" });
};

exports.signup = async (req, res) => {
  const info = req.flash("success");
  const error = req.flash("error");
  const local = {
    title: "Sign Up",
    discription: "Sign Up",
    message: { success: info, error: error },
  };
  res.render("users/signup", { local, layout: "layouts/main" });
};

exports.reset = async (req, res) => {
  const info = req.flash("success");
  const error = req.flash("error");
  const local = {
    title: "Reset Password",
    discription: "Reset Password",
    message: { success: info, error: error },
  };
  res.render("users/reset", { local, layout: "layouts/main" });
};

exports.otp = async (req, res) => {
  const info = req.flash("success");
  const error = req.flash("error");
  const local = {
    title: "Otp",
    discription: "Otp",
    message: { success: info, error: error },
  };
  res.render("users/otp", { local, layout: "layouts/main" });
};
exports.forget = async (req, res) => {
  const info = req.flash("success");
  const error = req.flash("error");
  const local = {
    title: "Forget Password",
    discription: "Forget Password",
    message: { success: info, error: error },
  };
  res.render("users/forget", { local, layout: "layouts/main" });
};
