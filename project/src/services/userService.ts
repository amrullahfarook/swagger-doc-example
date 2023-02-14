import * as AWS from 'aws-sdk';
import * as crypto from 'crypto';
import  { findUserRepo, createUserRepo, findUserByIdRepo, findUserByTokenRepo, saveRefreshTokenRepo, removeRefreshTokenRepo } from '../database/repository/user.repository'
import { generatePassword } from '../utils/index'
import config from '../config'

export interface RegisterInputs {
    name:string,
    email:string,
    password:string
  }
  
export interface LoginInputs {    
    email:string,
    password:string
  }

//region where your AWS cognito user pool is configured in
const awsConfig = {
    region: config.cognitoRegion,
};

//AWS cognito's user pool client id and secret, this is used to connect to your user pool
const clientId: string = config.cognitoClientId as string;
const secretHash: string = config.cognitoSecretKey as string;    

//instantiate new cognito service provider
const cognitoService = new AWS.CognitoIdentityServiceProvider(awsConfig);

//generate HMAC used to make the signup request to the cognito service provider
const generateHash = (email: string): string => {
    return crypto.createHmac('SHA256', secretHash)
      .update(email + clientId)
      .digest('base64')
}

export const registerUserService = async (userInputs: RegisterInputs) => {

    const { name, email, password} = userInputs

    //user attributes array contains the "email" standard attribute that is set when creating a cognito user pool
    let userAttr: any = []
    userAttr.push({ Name: 'name', Value: name })

    //parameters required to make the signup api call using cognito service provider
    const params = {
        ClientId: clientId,
        Password: password,
        Username: email,
        SecretHash: generateHash(email),
        UserAttributes: userAttr,
    }              

    try {
        //checks wether a user exists with the same email passed by the user, creates a new user if the email doesnt match any existing user's email
        const checkExistingUser = await findUserRepo(email)
        if(!checkExistingUser){

            //hashes password, and creates a user document in mongodb
            let hashedPassword: string = await generatePassword(password)
            await createUserRepo({ name, email, password: hashedPassword }) 
        } else {
                throw new Error("Email Already Registered")
        }           

        //creates a cognito user
        await cognitoService.signUp(params).promise();        
        
    } catch (error: any) {
        throw new Error(error.message)
    }
}

export const loginUserService = async (userInputs : LoginInputs) => {

    const { email, password } = userInputs

    //parameters required to make the initiateAuth API call, to login 
    const params = {
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: clientId,
        AuthParameters: {
        'USERNAME': email,
        'PASSWORD': password,
        "SECRET_HASH": generateHash(email)
        }
    }

    try {
        const data = await cognitoService.initiateAuth(params).promise()

        //get access token and refresh token from cognito API
        const accessToken: any = data?.AuthenticationResult?.AccessToken?.toString()
        const refreshToken: any = data?.AuthenticationResult?.RefreshToken?.toString()

        //find user, whose email matches with the email provided by the user
        const { _id } = await findUserRepo(email)
        await saveRefreshTokenRepo(_id, refreshToken as string)        

        return { accessToken, refreshToken }
        
    } catch (error: any) {
        throw new Error(error.message)
    }
}

export const refreshTokenService = async (refreshToken: string) => {
    // const username = "3127e86b-709f-4e33-b905-82fe4399413f"

    try {
        //Get user's email to generate secret hash
        const { email } = await findUserByTokenRepo(refreshToken)

        //Parameters to be passed when making the cognitoService API call
        const params = {
        AuthFlow: 'REFRESH_TOKEN_AUTH',
        ClientId: clientId,
        AuthParameters: {
            'REFRESH_TOKEN': refreshToken,
            "SECRET_HASH": generateHash( email )
            }
        }

        //Get new token by calling cognitoService API
        const data = await cognitoService.initiateAuth(params).promise()
        const accessToken: string | undefined = data?.AuthenticationResult?.AccessToken?.toString()
        return accessToken 

    } catch (error: any) {
        throw new Error(error)
    }

}

export const logoutUserService = async (refreshToken : string): Promise<void> => {

    try {
        //Get accessToken in order to perform globalSignOut API call for cognito service
        const getAccessToken: any = await refreshTokenService(refreshToken)
        const params = {
        AccessToken: getAccessToken as string,
        }

        await removeRefreshTokenRepo(refreshToken)
        cognitoService.globalSignOut(params)
        
    } catch (error: any) {
        throw new Error(error.message)
    }
    
}

  export const findUserService = async (email: string) => {
    return await findUserRepo(email);
  }

export const findUserByTokenService = async (refreshToken : string) => {
    try {
        const user = await findUserByTokenRepo(refreshToken)
        return user
    } catch (error: any) {
        throw new Error(error.message)
    }
}