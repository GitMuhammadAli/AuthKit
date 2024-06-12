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
            console.log("Admin user created with username: admin and password: admin");
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
        const { name, email, password, confirmpassword, role } = req.body;
        console.log(name, email, password, confirmpassword, role);
        if (!name || !email || !password || !confirmpassword || !role) {
            await req.flash("error", "Please fill all fields and submit again.");
            return res.redirect("/register");
        }
        if (!validator.isEmail(email)) {
            await req.flash("error", "Please enter a valid email");
            return res.redirect("/register");
        }
        if (password !== confirmpassword) {
            await req.flash("error", "Passwords do not match.");
            return res.redirect("/register");
        }
        const emailCheck = await Users.findOne({ email });
        if (emailCheck) {
            await req.flash("error", "Email already exists.");
            return res.redirect("/register");
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await Users.create({
            name,
            email,
            password: hashedPassword,
            role,
        });

        if (newUser) {
            await req.flash("success", "Registered successfully.");
            const token = await GenerateToken(newUser, req, res);
            req.session.user = newUser.role;
            return res.redirect("/");
        }
    } catch (error) {
        console.log(error);
        await req.flash("error", "An error occurred while registering the user.");
        return res.redirect("/register");
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

const GenerateToken = async (user, req, res) => {
    const token = await makeToken(user._id, user.role);
    res.cookie("jwt", token, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: "strict",
    });
    await req.flash("success", "Logged in successfully.");
    return token;
};

// Login
exports.login = async (req, res) => {
    try {
        console.log("inside login");
        const { email, password } = req.body;
        console.log(req.body);
        const user = await Users.findOne({ email });
        console.log(user);

        if (!user || user.length === 0) {
            await req.flash("error", "User not Found Please register.");
            return res.redirect("/login");
        }

        if (await user.comparePassword(password)) {
            const token = await GenerateToken(user, req, res);
            req.session.user = user.role;
            console.log(token, "session is" + req.session.user);
            return res.redirect("/");
        } else {
            await req.flash("error", "Password do not match.");
            return res.redirect("/login");
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send("Internal Server Error");
    }
};

// Forget Password
const generateOTP = () => {
    let SendedOtp = otpGenerator.generate(6, {
        upperCase: false,
        specialChars: false,
    });
    const expirationTime = new Date();
    expirationTime.setMinutes(expirationTime.getMinutes() + 2);
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
            maxAge: 300000,
            httpOnly: true,
        });
    }

    return tok;
};

exports.CheckMailforForget = async (req, res) => {
    const { email } = req.body;

    const Findmail = await Users.findOne({ email });

    try {
        if (!validator.isEmail(email)) {
            await req.flash("error", "please enter a valid email");
            return res.redirect("/forget");
        }
        if (!Findmail) {
            await req.flash("error", "No Email Found");
            return res.redirect("/forget");
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
            const subject = "Your Otp For Resetting the Password";
            const text = `Your Otp is  ${SendedOtp} its Expiration time is 2 minutes`;
            const html = "<h2> Reset Password </h2>";

            const emailResult = await sendMail(to, subject, text, html);

            if (emailResult.success) {
                await req.flash(
                    "success",
                    "Email sent for Resetting Password with OTP"
                );
                return res.redirect("/otp");
            } else {
                await req.flash("error", "Error Sending Email");
                return res.redirect("/forget");
            }
        }
    } catch (error) {
        console.log(error);
        await req.flash("error", "Something went wrong");
        return res.redirect("/forget");
    }
};

// Token decoding for otp
const decodingToken = async (token, key) => {
    return jsonwebtoken.verify(token, key);
};

// OTP confirmation
const verifyOTP = async (userOTP, storedOTP, expirationTime) => {
    if (userOTP !== storedOTP) {
        return false;
    }
    const currentTime = new Date();
    if (currentTime > expirationTime) {
        return false;
    }
    console.log("returning true");
    return true;
};

exports.ConfirmOtp = async (req, res) => {
    const { otp } = req.body;
    let cookieOtp = req.cookies.resetPasswordOTP;

    if (!cookieOtp) {
        await req.flash(
            "error",
            "Incorrect OTP or OTP expired. Please try again."
        );
        return res.redirect("/forget");
    }

    try {
        const decodedToken = await decodingToken(
            cookieOtp,
            process.env.JWT_API_SECRET_KEY
        );

        console.log("decoded token", decodedToken);
        const { SendedOtp, expirationTime } = decodedToken;
        console.log(SendedOtp, expirationTime);
        if (!SendedOtp) {
            await req.flash("error", "OTP is not found in the cookie");
            return res.redirect("/forget");
        }
        if (decodedToken.emailVerified === true) {
            console.log("Email is already verified");
            if (await verifyOTP(otp, SendedOtp, new Date(expirationTime))) {
                console.log("OTP verified successfully");

                const updatedToken = await generatetoken(
                    SendedOtp,
                    expirationTime,
                    decodedToken._id,
                    decodedToken.email,
                    (decodedToken.otpVerified = true),
                    (decodedToken.emailVerified = true),
                    res
                );

                await req.flash("success", "OTP is verified");
                return res.redirect("/NewPassword");
            } else {
                console.log("OTP verification failed or expired");
                await req.flash(
                    "error",
                    "OTP verification failed or expired. Please try again."
                );
                res.clearCookie("resetPasswordOTP");
                return res.redirect("/forget");
            }
        }
    } catch (error) {
        console.log(error);
        await req.flash("error", "Internal server error");
        return res.redirect("/otp");
    }
};

// New password
exports.CreateNewPassword = async (req, res) => {
    try {
        const Cookie = req.cookies.resetPasswordOTP;
        const { newPassword, confirmPassword } = req.body;
        if (!Cookie) {
            await req.flash("error", "User not found");
            return res.redirect("/forget");
        }

        const decodedToken = await decodingToken(
            Cookie,
            process.env.JWT_API_SECRET_KEY
        );

        console.log("decoded token is ", decodedToken);

        if (decodedToken.otpVerified === false) {
            await req.flash("error", "Please verify your OTP");
            return res.redirect("/otp");
        }
        console.log(newPassword);
        console.log(confirmPassword);
        if (newPassword !== confirmPassword) {
            await req.flash("error", "Passwords do not match.");
            return res.redirect("/NewPassword");
        }

        const { _id } = decodedToken;
        console.log(_id);
        const hashedPassword = await bcrypt.hash(newPassword, 10);
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
            return res.redirect("/forget");
        }

        console.log(user);

        await req.flash("success", "Password updated successfully.");
        res.clearCookie("jwt");
        res.clearCookie("resetPasswordOTP");
        return res.redirect("/login");
    } catch (error) {
        console.log(error);
        await req.flash("error", "Internal server error");
        return res.redirect("/NewPassword");
    }
};

// Logout
exports.logout = async (req, res) => {
    await res.clearCookie("jwt");
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        }
        res.redirect("/login");
    });
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
