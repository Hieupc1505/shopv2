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
    getInfo,
} = require('@v2/controllers/auth.controller');

//middlewar with passport google
const {
    authPassport: { initPPGoogle, authGoogle, authGoogleCallback, initPPFacebook, authFacebook, authFacebookCallback },
} = require('@v2/middleware/index.middeware');

//test
router.get('/test', (req, res) => {
    res.status(200).json({
        success: true,
        message: '/api/v2/auth is ready!!!',
    });
});

//[/api/v2]
router.route('/register').post(register);
router.route('/login').post(login);
router.route('/logout').get(logout);

router.route('/activate/:token').get(activate);
router.route('/forget/account').post(forgetPass);
router.route('/reset/account').post(resetPass);
router.route('/refreshtoken').post(refreshToken);
router.route('/info').get(getInfo);

//user upload profile

//auth Google
// initPPGoogle();
router.route('/google').get(authGoogle);
router.route('/google/callback').get(authGoogleCallback, login);

//auth Facebook
// initPPFacebook();
router.route('/facebook').get(authFacebook);
router.route('/facebook/callback').get(authFacebookCallback, login);

module.exports = router;
