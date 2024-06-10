const bcrypt = require("bcrypt");
const User = require("../model/userModel");

//rendering
exports.signin = async (req, res) => {
  const info = req.flash("success");
  const error = req.flash("error");
  const locals = {
    title: "Sign In",
    discription: "Sign In",
    message: { success: info, error: error },
  };
  res.render("users/signin", { locals, layout: "layouts/login" });
};

exports.signup = async (req, res) => {
  const info = req.flash("success");
  const error = req.flash("error");
  const locals = {
    title: "Sign Up",
    discription: "Sign Up",
    message: { success: info, error: error },
  };
  res.render("users/signup", { locals, layout: "layouts/login" });
};

exports.reset = async (req, res) => {
  const info = req.flash("success");
  const error = req.flash("error");
  const locals = {
    title: "Reset Password",
    discription: "Reset Password",
    message: { success: info, error: error },
  };
  res.render("users/reset", { locals, layout: "layouts/login" });
};

exports.otp = async (req, res) => {
  const info = req.flash("success");
  const error = req.flash("error");
  const locals = {
    title: "Otp",
    discription: "Otp",
    message: { success: info, error: error },
  };
  res.render("users/otp", { locals, layout: "layouts/login" });
};
exports.forget = async (req, res) => {
  const info = req.flash("success");
  const error = req.flash("error");
  const locals = {
    title: "Forget Password",
    discription: "Forget Password",
    message: { success: info, error: error },
  };
  res.render("users/forget", { locals, layout: "layouts/login" });
};
