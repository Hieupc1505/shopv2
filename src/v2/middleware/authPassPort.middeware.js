const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const { V2_CLIENT_ID, V2_CLIENT_SECRET, V2_FACEBOOK_APP_ID, V2_FACEBOOK_APP_SECRET } = process.env;

//init FB
passport.use(
    new FacebookStrategy(
        {
            clientID: V2_FACEBOOK_APP_ID,
            clientSecret: V2_FACEBOOK_APP_SECRET,
            callbackURL: '/api/v2/auth/facebook/callback',
            profileFields: ['email', 'photos', 'id', 'displayName'],
        },
        function (accessToken, refreshToken, profile, cb) {
            return cb(null, profile);
        },
    ),
);

// init Google
passport.use(
    new GoogleStrategy(
        {
            clientID: V2_CLIENT_ID,
            clientSecret: V2_CLIENT_SECRET,
            callbackURL: '/api/v2/auth/google/callback',
        },
        function (accessToken, refreshToken, profile, cb) {
            return cb(null, profile);
        },
    ),
);

var that = (module.exports = {
    initPPFacebook: () => {},
    authFacebook: passport.authenticate('facebook', { scope: ['email'], session: false }),
    authFacebookCallback: (req, res, next) => {
        passport.authenticate('facebook', (err, profile) => {
            req.user = profile;
            req.provider = 'fb';
            next();
        })(req, res, next);
    },
    initPPGoogle: () => {},
    authGoogle: passport.authenticate('google', { scope: ['profile', 'email'], session: false }),
    authGoogleCallback: (req, res, next) => {
        passport.authenticate('google', (err, profile) => {
            req.user = profile;
            console.log(profile);
            req.provider = 'gg';
            next();
        })(req, res, next);
    },
});
