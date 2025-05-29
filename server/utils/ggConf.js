const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
const refresh = require("passport-oauth2-refresh");
const User = require("../models/user");
const RefreshToken = require("../models/refresh-token");

const strategy = new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, params, profile, callback) => {
        try {
            // console.log(profile)
            let user = await User.findOne({email: profile.emails[0].value});
            if (!user) {
                user = new User({
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    image: profile.photos[0].value,
                    provider: profile.provider,
                    providerId: profile.id,
                });
                await user.save();
            } else if (user.provider !== profile.provider && user.providerId !== profile.id) {
                return callback(new Error("Email already registered with another provider."), null);
            }
            let refreshTokenDoc = await RefreshToken.findOne({userId: user._id});
            if (!refreshTokenDoc) {
                refreshTokenDoc = new RefreshToken({
                    userId: user._id,
                    refreshToken: refreshToken,
                });
                await refreshTokenDoc.save();
            } else {
                refreshTokenDoc.refreshToken = refreshToken;
                await refreshTokenDoc.save();
            }
            const data = {
                ...user._doc,
                accessToken: accessToken,
                expires_in: params.expires_in,
                token_type: params.token_type,
                refreshToken: refreshTokenDoc.refreshToken,
            };
            return callback(null, data);
        } catch (err) {
            return callback(err, null);
        }
    }
);

passport.use(strategy);
refresh.use(strategy);

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser(
    // (_id, done) => {
    //     User.findById(_id,)
    //         .then((user) => {
    //             done(null, user);
    //         })
    //         .catch((err) => {
    //             done(null, false, {error: err});
    //         })
    // }
    (user, done) => {
        done(null, user);
    }
);

module.exports = passport;
