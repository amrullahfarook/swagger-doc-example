import userModel from '../models/user.model'
import {IUserInputs} from '../types/user.type'

export const  createUserRepo  = async ({ name, email, password } : IUserInputs) =>{
        try {
            const user = new userModel({
                name,
                email,
                password
            })
            
            const userResult = await user.save()
            return userResult

        } catch (error: any) {
            return error
        }
    }

 export const findUserRepo = async (email : any) => {
        try {
            const existingUser = await userModel.findOne({email : email})
            return existingUser
        } catch (error: any) {
            return error
        }
    }

export const findUserByTokenRepo = async (refreshToken : any) => {
    try {
        const existingUser = await userModel.findOne({ refreshToken: refreshToken })
        return existingUser
    } catch (error: any) {
        return error
    }
} 

export const saveRefreshTokenRepo =async (userID: string , refreshToken :string) => {
    try {
        const user = await userModel.findById(userID).findOneAndUpdate({refreshToken:refreshToken})
        await user?.save();
    } catch (error: any) {
        return error
    }
    
}

export const  findUserByIdRepo = async (id : string) => {
        try {

            const existingUser = await userModel.findById(id).select('-password').select('-refreshToken')
            console.log({existingUser})

            return existingUser

        } catch (error: any) {
            return error
        }
    }

export const removeRefreshTokenRepo = async (refreshToken : string) => {
    try {

        const user = await findUserByTokenRepo(refreshToken)   
        if(user) {
            user.refreshToken = ''
            await user.save();
        }

    } catch (error: any) {
        return error
    }
}