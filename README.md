# RESTful API APP
TalentQL NodeJS take home chanllenge

## The following environment variables are required.

|  Variable |  Description | Required
|---|---|---|
|  PORT | Port running application | NO |  
|  EXPRESS_SECRET |  Any random characters that would be used for express session |  YES |  
| MONGODB_CONNECTION_URL  | MongoDB Connection String  |  YES |
|  GMAIL_SMTP_PORT | Gmail SMTP PORT |  YES |
|  GMAIL_SMTP_HOST | Gmail SMTP HOST |  YES |
|  GMAIL_SMTP_USER | Gmail Email Address |  YES |
|  GMAIL_SMTP_PASSWORD | Gmail Email Password |  YES |
|  JWT_SECRET_KEY | Any random string to sign JWT |  YES |
|  MEDIA_UPLOAD_SOURCE | Upload Destination Type. Either `local` or `aws` |  YES |
|  MEDIA_AMAZON_ACCESS_KEY | Amazon access key if you're using S3 bucket. Only required if `MEDIA_UPLOAD_SOURCE = aws` |  NO|
|  MEDIA_AMAZON_SECRET_KEY| Amazon secret key if you're using S3 bucket. Only required if `MEDIA_UPLOAD_SOURCE = aws` |  NO|
|  MEDIA_AMAZON_REGION | Amazon S3 region if you're using S3 bucket. Only required if `MEDIA_UPLOAD_SOURCE = aws` |  NO |
|  MEDIA_AMAZON_BUCKET | Amazon S3 bucket name if you're using S3 bucket. Only required if `MEDIA_UPLOAD_SOURCE = aws` |  NO |


In the project directory, you can run:
```js
$ npm install
```
Run the following command in your terminal to install the dependencies.

## Run in development mode
```js
$ npm start
```
Runs the app in the development mode.
Open http://localhost:3000 to view it in the browser.

## Run in development mode
```js
$ npm build
```
Builds the app for production to the build folder.


## Getting Started
Before you can integrate this RESTful API, you must [https://your-domain.com/api/users/signup]('https://your-domain.com/api/users/signup'). You exchange these credentials for an access token that authorizes your REST API calls.

## Get an access token
Your access token authorizes you to use the REST API. To call the REST API or perform a function, exchange your username and password for an access token in an OAuth token call.