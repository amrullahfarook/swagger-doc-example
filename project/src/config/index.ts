import dotenv from 'dotenv';

if(process.env.NODE_ENV !== 'production'){
    dotenv.config()
}

export default {
    port: parseInt(process.env.PORT),
    mongoURI: process.env.MONGO_URI,
    cognitoRegion: process.env.COGNITO_REGION,
    cognitoClientId: process.env.COGNITO_CLIENT_ID,
    cognitoSecretKey: process.env.COGNITO_SECRET_KEY,
    cognitoUserPoolId: process.env.COGNITO_USER_POOL_ID
}