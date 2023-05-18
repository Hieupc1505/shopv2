require('dotenv').config();
const { google } = require('googleapis');
const { OAuth2 } = google.auth;
const nodemailer = require('nodemailer');
const { V2_CLIENT_ID, V2_CLIENT_SECRET, V2_MAIL_FROM, V2_REFRESHTOKEN_MAIL, REDIRECT_URI } = process.env;
const createError = require('http-errors');

const oauth2Client = new OAuth2(V2_CLIENT_ID, V2_CLIENT_SECRET, REDIRECT_URI);

oauth2Client.setCredentials({ refresh_token: V2_REFRESHTOKEN_MAIL });

const sendEmail = async (to, subject = 'Van Hieu Shop !', text = 'Register', URL) => {
    try {
        const accessToken = await oauth2Client.getAccessToken();
        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: V2_MAIL_FROM,
                clientId: V2_CLIENT_ID,
                clientSecret: V2_CLIENT_SECRET,
                refreshToken: V2_REFRESHTOKEN_MAIL,
                accessToken: accessToken.token,
            },
        });

        const mailOptions = {
            from: `"${subject}👋" ${V2_MAIL_FROM}`,
            to: to,
            subject: subject,

            html: `
            <div style="max-width: 700px; margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 110%;">
            <h2 style="text-align: center; text-transform: uppercase;color: teal;">Welcome to the GDShop!!.</h2>
            <p>Congratulations! You're almost set to start using DEVAT✮SHOP.
                Just click the button below to ${text}.
            </p>
            
            <a href=${URL} style="background: crimson; text-decoration: none; color: white; padding: 10px 20px; margin: 10px 0; display: inline-block;">Activate your Email</a>
        
            <p>If the button doesn't work for any reason, you can also click on the link below:</p>
        
            <div>${URL}</div>
            </div>
            `,
        };

        return await transport.sendMail(mailOptions);
    } catch (error) {
        // console.log(error);
        throw new createError(500, 'Internal Server error');
    }
};

module.exports = sendEmail;
