# Shopv2 - api

## Introduction

-   Shopv2 provide a api for a app store can use to buy/shell product with somes features such as register, login, seach, payment,order....

## Set up

After pull project from github, to set up:

-   B1: open terminal
-   B2: npm install
    > Install package needed
-   B3: Set up .env file
    File .env require some variables:

*   PORT = 8500
*   NODE_ENV=development

*   DB_CONNECT_URL=mongodb://<username>:<password>@localhost:27017/?authMechanism=DEFAULT

*   ACCESSTOKEN_SECRET=<your_secret_string_access_token>
*   REFRESHTOKEN_SECRET=<your_secret_string_refresh_token>

*   V2_CLIENT_ID=<your_id_google>
*   V2_CLIENT_SECRET=<your_secret_google>
    > [google_cloud_platform](https://console.cloud.google.com/)
*   V2_MAIL_FROM=<sender>
*   URL=http://localhost:8500
*   V2_REFRESHTOKEN_MAIL=<your_refreshtoken_mail>
    > get v2_refreshtoken_main from [oauthplayground](https://developers.google.com/oauthplayground) with your client id , client secret and url for Authorize APIs : https://mail.google.com
*   REDIRECT_URI=https://developers.google.com/oauthplayground
*   V2_FACEBOOK_APP_ID=<your_fb_app_id>
*   V2_FACEBOOK_APP_SECRET=<your_secret_app>
    > [fb_for_developer](https://developers.facebook.com/)

-   B3: npm run dev

## API (http://localhost:8500)

> /api/v2/

-   [POST][{email, password}] - /user/register
-   [POST][{email, password}] - /user/login
-   [POST][{refreshToken}] - /user/logout
-   [GET][prams] - /user/activate/:token
-   [POST][{email}] - /user/forget/account
-   [POST][{password}, token] - /user/reset/account
-   [POST][{refreshToken}] - /user/refreshtoken
