const router = require('express').Router();
const passport = require('passport');

//Auth Controller
const {
    register,
    login,
    activate,
    forgetPass,
    resetPass,
    refreshToken,
    logout,
} = require('@v2/controllers/auth.controller');

//middlewar with passport google
const {
    authPassport: { initPPGoogle, authGoogle, authGoogleCallback, initPPFacebook, authFacebook, authFacebookCallback },
} = require('@v2/middleware/index.middeware');

//[/api/v2]
router.route('/user/register').post(register);
router.route('/user/login').post(login);
router.route('/user/logout').post(logout);
router.route('/user/activate/:token').get(activate);
router.route('/user/forget/account').post(forgetPass);
router.route('/user/reset/account').post(resetPass);
router.route('/user/refreshtoken').post(refreshToken);

//auth Google
// initPPGoogle();
router.route('/auth/google').get(authGoogle);
router.route('/auth/google/callback').get(authGoogleCallback, login);

//auth Facebook
// initPPFacebook();
router.route('/auth/facebook').get(authFacebook);
router.route('/auth/facebook/callback').get(authFacebookCallback, login);

module.exports = router;
