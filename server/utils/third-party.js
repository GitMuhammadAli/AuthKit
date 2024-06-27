// const passport = require("passport");
// const GoogleStrategy = require("passport-google-oauth20").Strategy;
// // const FacebookStrategy = require("passport-facebook").Strategy; // Uncomment if using Facebook login
// const User = require("../model/userModel");
// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });

// passport.deserializeUser(async (id, done) => {
//   // try {
//   //   const user = await User.findById(id);
//   //   if (!user) {
//   //     return done(null, false);
//   //   }
//   //   return done(null, user);
//   // } catch (err) {
//   //   return done(err);
//   // }
//   done(null , id);
// });

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: "http://localhost:8080/auth/google/callback",
//     },
//     // async (accessToken, refreshToken, profile, done) => {
//     //   try {
//     //     let user = await User.findOne({ googleId: profile.id });
//     //     if (user) {
//     //       return done(null, user);
//     //     } else {
//     //       user = new User({
//     //         googleId: profile.id,
//     //         name: profile.displayName,
//     //         email: profile.emails[0].value,
//     //         imageUrl: profile.photos[0].value,
//     //       });
//     //       await user.save();
//     //       return done(null, user);
//     //     }
//     //   } catch (err) {
//     //     return done(err);
//     //   }
//     // }
//     function (accessToken, refreshToken, profile, done) {
//       console.log(profile);
//      return done(null, profile);
//     }
//   )
// );

// // Uncomment and configure FacebookStrategy if using Facebook login
// // passport.use(
// //   new FacebookStrategy(
// //     {
// //       clientID: process.env.FACEBOOK_APP_ID,
// //       clientSecret: process.env.FACEBOOK_APP_SECRET,
// //       callbackURL: "/auth/facebook/callback",
// //       profileFields: ["id", "displayName", "photos", "email"],
// //     },
// //     async (accessToken, refreshToken, profile, done) => {
// //       try {
// //         let user = await User.findOne({ facebookId: profile.id });
// //         if (user) {
// //           return done(null, user);
// //         } else {
// //           user = new User({
// //             facebookId: profile.id,
// //             name: profile.displayName,
// //             email: profile.emails[0].value,
// //             imageUrl: profile.photos[0].value,
// //           });
// //           await user.save();
// //           return done(null, user);
// //         }
// //       } catch (err) {
// //         return done(err);
// //       }
// //     }
// //   )
// // );

// module.exports = passport;

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const User = require("../model/userModel");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:8080/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      user = new User({
        name: profile.displayName,
        email: profile.emails[0].value,
        googleId: profile.id,
        imageUrl: profile.photos[0].value
      });
      await user.save();
    }
    done(null, user);
  } catch (err) {
    done(err, null);
  }
}));

// Facebook Strategy
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  callbackURL: "http://localhost:8080/auth/facebook/callback",
  profileFields: ["id", "displayName", "email", "photos"]
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ facebookId: profile.id });
    if (!user) {
      user = new User({
        name: profile.displayName,
        email: profile.emails[0].value,
        facebookId: profile.id,
        imageUrl: profile.photos[0].value
      });
      await user.save();
    }
    done(null, user);
  } catch (err) {
    done(err, null);
  }
}));
