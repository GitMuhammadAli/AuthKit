const Users = require("../model/userModel");
const bcrypt = require("bcrypt");
const validator = require("validator");
const jsonwebtoken = require("jsonwebtoken");
const sendMail = require("../config/sendmail");
const otpGenerator = require("otp-generator");

// Initialize default admin user
const initializeAdmin = async () => {
  try {
    const adminExists = await Users.findOne({ role: "admin" });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("admin", 10);
      await Users.create({
        name: "admin",
        email: "admin@authkit.com",
        password: hashedPassword,
        role: "admin",
      });
      console.log(
        "Admin user created with username: admin and password: admin"
      );
    }
  } catch (error) {
    console.error("Error initializing admin user:", error);
  }
};

initializeAdmin();

// Account info
exports.UserAccount = async (req, res) => {
  try {
    const user = await userAccount(req, res);
    console.log("user is", user);
    const info = req.flash("success");
    const error = req.flash("error");
    const local = {
      title: "Auth Kit",
      description: "Auth Kit - Secure Authentication System",
      user: user,
      message: { success: info, error: error },
    };
    res.render("Users/accountInfo", { locals: local, layout: "layouts/main" });
  } catch (error) {
    console.log(error);
    req.flash("error", "Internal server error");
    res.redirect("/");
  }
};

// Register
exports.Register = async (req, res) => {
  try {
    const { name, email, pass, re_pass } = req.body;
    if (name.length < 5) {
      await req.flash("error", "Name must be at least 5 characters long.");
      return res.status(400).redirect("/auth/signup");
    }
    if (!name || !email || !pass || !re_pass) {
      await req.flash("error", "Please fill all fields and submit again.");
      return res.status(400).redirect("/auth/signup");
    }
    if (!validator.isEmail(email)) {
      await req.flash("error", "Please enter a valid email");
      return res.status(400).redirect("/auth/signup");
    }
    if (pass !== re_pass) {
      await req.flash("error", "Passwords do not match.");
      return res.status(400).redirect("/auth/signup");
    }
    const emailCheck = await Users.findOne({ email });
    if (emailCheck) {
      await req.flash("error", "Email already exists.");
      return res.status(400).redirect("/auth/signup");
    }
    const hashedPassword = await bcrypt.hash(pass, 10);
    const newUser = await Users.create({
      name,
      email,
      password: hashedPassword,
      role: "user",
    });
    if (newUser) {
      await req.flash("success", "Registered successfully.");
      const token = await GenerateToken(newUser, req, res);
      res.cookie("jwt", token, { httpOnly: true });
      return res.redirect("/auth/signin");
    }
  } catch (error) {
    console.error(error);
    await req.flash("error", "An error occurred while registering the user.");
    return res.status(500).redirect("/auth/signup");
  }
};


// Token creation
const makeToken = async (_id, role) => {
  const token = jsonwebtoken.sign(
    { _id, role },
    process.env.JWT_API_SECRET_KEY,
    {
      expiresIn: "1d",
    }
  );
  return token;
};

exports.GenerateToken = async (user, req, res) => {
  try {
    const token = await makeToken(user._id, user.role);
    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, 
      sameSite: "strict",
    });
    return token;
  } catch (error) {
    console.log(error);
    await req.flash("error", "An error occurred while generating the token.");
    return res.redirect("/auth/signin");
  }
};

// Login
exports.login = async (req, res) => {
  const { your_email, your_pass } = req.body;
  try {
    const user = await Users.findOne({ email: your_email });
    if (user &&  bcrypt.compare(your_pass, user.password)) {
      const token = await GenerateToken(user, req, res);
      res.cookie("jwt", token, { httpOnly: true, secure: false, maxAge: 24 * 60 * 60 * 1000 }); 
      if (user.role === "admin") {
        return res.redirect("/admin");
      } else {
        return res.redirect("/");
      }
    } else {
      await req.flash("error", "Invalid email or password");
      return res.status(401).redirect("/auth/signin");
    }
  } catch (error) {
    console.error(error);
    await req.flash("error", "Internal server error");
    return res.status(500).redirect("/auth/signin");
  }
};

// Forget Password
const generateOTP = () => {
  let SendedOtp = otpGenerator.generate(6, {
    upperCase: false,
    specialChars: false,
  });
  const expirationTime = new Date();
  expirationTime.setMinutes(expirationTime.getMinutes() + 10);
  return { SendedOtp, expirationTime };
};

const CreateToken = async (payload) => {
  const otptoken = jsonwebtoken.sign(payload, process.env.JWT_API_SECRET_KEY, {
    expiresIn: "5m",
  });
  return otptoken;
};

const generatetoken = async (
  SendedOtp,
  expirationTime,
  _id,
  email,
  otpVerified = false,
  emailVerified = false,
  res
) => {
  const payload = {
    SendedOtp,
    expirationTime,
    _id,
    email,
    otpVerified,
    emailVerified,
  };
  const tok = await CreateToken(payload);

  if (res) {
    console.log("send to cookie");
    res.cookie("resetPasswordOTP", tok, {
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
  }

  return tok;
};

exports.CheckMailforForget = async (req, res) => {
  const { email } = req.body;

  console.log(req.body);
  const Findmail = await Users.findOne({ email });

  try {
    if (!validator.isEmail(email)) {
      await req.flash("error", "please enter a valid email");
      return res.redirect("/auth/forget");
    }
    if (!Findmail) {
      await req.flash("error", "No Email Found");
      return res.redirect("/auth/forget");
    } else {
      let { SendedOtp, expirationTime } = generateOTP();

      const tok = await generatetoken(
        SendedOtp,
        expirationTime,
        Findmail._id,
        Findmail.email,
        (Findmail.otpVerified = false),
        (Findmail.emailVerified = true),
        res
      );

      console.log("mailTOken", tok);
      const to = email;
      const subject = "Your OTP for Resetting the Password";
      const text = `Your OTP is ${SendedOtp}. It expires in 2 minutes.`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="color: #333;">Reset Password</h2>
          <p style="font-size: 16px; color: #333;">
            Dear User,
          </p>
          <p style="font-size: 16px; color: #333;">
            You have requested to reset your password. Please use the following One-Time Password (OTP) to proceed with resetting your password. This OTP is valid for 2 minutes.
          </p>
          <div style="text-align: center; margin: 20px 0;">
            <span style="font-size: 24px; font-weight: bold; color: #333; background: #f0f0f0; padding: 10px 20px; border-radius: 5px; display: inline-block;">
              ${SendedOtp}
            </span>
          </div>
          <p style="font-size: 16px; color: #333;">
            If you did not request a password reset, please ignore this email.
          </p>
          <p style="font-size: 16px; color: #333;">
            Thank you,
            <br>
            The Support Team
          </p>
        </div>
      `;
      
      const emailResult = await sendMail(to, subject, text, html);
      

      if (emailResult.success) {
        await req.flash(
          "success",
          "Email sent for Resetting Password with OTP"
        );
        return res.redirect("/auth/otp");
      } else {
        await req.flash("error", "Error Sending Email");
        return res.redirect("/auth/forget");
      }
    }
  } catch (error) {
    console.log(error);
    await req.flash("error", "Something went wrong");
    return res.redirect("/auth/forget");
  }
};

// Token decoding for otp
const decodingToken = async (token, key) => {
  return jsonwebtoken.verify(token, key);
};

// OTP confirmation
const verifyOTP = async (userOTP, storedOTP, expirationTime) => {
  userOTP = userOTP.trim();
  console.log(
    `Comparing OTPs - User OTP: ${userOTP}, Stored OTP: ${storedOTP}`
  );
  console.log(typeof userOTP);
  console.log(typeof storedOTP);
  if (userOTP !== storedOTP) {
    console.log("OTP mismatch");
    return false;
  }
  const currentTime = new Date();
  console.log(
    `Current Time: ${currentTime}, Expiration Time: ${expirationTime}`
  );
  if (currentTime > expirationTime) {
    console.log("OTP expired");
    return false;
  }
  console.log("OTP verified successfully");
  return true;
};

exports.ConfirmOtp = async (req, res) => {
  const { otp } = req.body;
  let cookieOtp = req.cookies.resetPasswordOTP;
  console.log(req.body);
  if (!cookieOtp) {
    await req.flash("error", "Incorrect OTP or OTP expired. Please try again.");
    return res.redirect("/auth/forget");
  }

  try {
    const decodedToken = await decodingToken(
      cookieOtp,
      process.env.JWT_API_SECRET_KEY
    );

    console.log("Decoded Token:", decodedToken);
    const { SendedOtp, expirationTime } = decodedToken;
    console.log(`SendedOtp: ${SendedOtp}, Expiration Time: ${expirationTime}`);
    if (!SendedOtp) {
      await req.flash("error", "OTP is not found in the cookie");
      return res.redirect("/auth/forget");
    }
    if (decodedToken.emailVerified === true) {
      console.log("Email is already verified");
      if (await verifyOTP(otp, SendedOtp, new Date(expirationTime))) {
        console.log("OTP verified successfully");

        await generatetoken(
          SendedOtp,
          expirationTime,
          decodedToken._id,
          decodedToken.email,
          (decodedToken.otpVerified = true),
          (decodedToken.emailVerified = true),
          res
        );

        await req.flash("success", "OTP is verified");
        return res.redirect("/auth/reset");
      } else {
        console.log("OTP verification failed or expired");
        await req.flash(
          "error",
          "OTP verification failed or expired. Please try again."
        );
        res.clearCookie("resetPasswordOTP");
        return res.redirect("/auth/forget");
      }
    } else {
      console.log("Email not verified");
      await req.flash("error", "Email not verified");
      return res.redirect("/auth/otp");
    }
  } catch (error) {
    console.log("Error:", error);
    await req.flash("error", "Internal server error");
    return res.redirect("/auth/otp");
  }
};

// New password
exports.CreateNewPassword = async (req, res) => {
  try {
    const Cookie = req.cookies.resetPasswordOTP;
    const { Password, RepeatPassword } = req.body;
    if (!Cookie) {
      await req.flash("error", "User not found");
      return res.redirect("/auth/forget");
    }

    const decodedToken = await decodingToken(
      Cookie,
      process.env.JWT_API_SECRET_KEY
    );

    console.log("decoded token is ", decodedToken);

    if (decodedToken.otpVerified === false) {
      await req.flash("error", "Please verify your OTP");
      return res.redirect("/auth/otp");
    }
    console.log(Password);
    console.log(RepeatPassword);
    if (Password !== RepeatPassword) {
      await req.flash("error", "Passwords do not match.");
      return res.redirect("/auth/reset");
    }

    const { _id } = decodedToken;
    console.log(_id);
    const hashedPassword = await bcrypt.hash(Password, 10);
    console.log(hashedPassword);
    const user = await Users.findByIdAndUpdate(
      _id,
      { password: hashedPassword },
      { new: true },
      {
        updatedAt: Date.now(),
      }
    );

    console.log(user.password);
    if (!user) {
      await req.flash("error", "Cannot set New Password");
      return res.redirect("/auth/forget");
    }

    console.log(user);

    await req.flash("success", "Password updated successfully.");
    res.clearCookie("jwt");
    res.clearCookie("resetPasswordOTP");
    return res.redirect("/auth/signin");
  } catch (error) {
    console.log(error);
    await req.flash("error", "Internal server error");
    return res.redirect("/auth/reset");
  }
};

// Logout
exports.logout = async (req, res) => {
  try {
    await res.clearCookie("jwt");
    await res.clearCookie("resetPasswordOTP");
    await req.session.destroy();
    return res.redirect("/auth/signin");
  } catch (error) {
    console.log(error);
    await req.flash("error", "Internal server error");
    return res.redirect("/auth/signin");
  }
};

// User account
const userAccount = async (req, res) => {
  try {
    const UserCookie = req.cookies.jwt;

    const decodedToken = await decodingToken(
      UserCookie,
      process.env.JWT_API_SECRET_KEY
    );
    const user = await Users.findById(decodedToken._id);
    if (!user) {
      await req.flash("error", "user not found");
    }

    return user;
  } catch (error) {
    console.log(error);
    await req.flash("error", "internal server error");
  }
};
