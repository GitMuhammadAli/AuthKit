const Users = require("../models/Users");
const jsonwebtoken = require("jsonwebtoken");

exports.AuthorizeUser = (RequiredRole) => {
    return async (req, res, next) => {
        const verify = req.cookies.jwt;
        if (!verify) {
            return res.redirect("/login");
        }
        try {
            const decodedToken = jsonwebtoken.verify(
                verify,
                process.env.JWT_API_SECRET_KEY
            );
            const user = await Users.findOne({ _id: decodedToken._id });
            if (!user) {
                console.log("User not found");
                clearCookies(req, res);
                return res.redirect("/login");
            }

            if (user.role !== RequiredRole) {
                console.log("Role is not correct");
                clearCookies(req, res);
                return res.redirect("/login");
            } else if (user.role === RequiredRole) {
                return next();
            }
        } catch (error) {
            console.error("JWT verification failed:", error);
            clearCookies(req, res);
            return res.redirect("/login");
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
            return res.redirect("/forget");
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
                return res.redirect("/otp");
            }
            console.log("Email Not verified in Cookie ");
            await req.flash("error", "Please verify your email first");
            return res.redirect("/forget");
        }

        next();
    } catch (error) {
        console.error("Error verifying OTP:", error);
        req.flash("error", "Internal server error");
        return res.redirect("/forget");
    }
};
