import { Request, Response , NextFunction } from "express"
import logger from "../../utils/logger"
import { registerUserService, loginUserService, refreshTokenService, logoutUserService, findUserByTokenService, findUserService } from '../../services/userService'

export const registerUserController = async (req :Request, res : Response, next : NextFunction) => {
        try {

            const {name, email, password} = req.body
            await registerUserService({ name, email, password })
            const { refreshToken, accessToken } = await loginUserService({ email, password })
            res.cookie('jwt', refreshToken, {httpOnly:true , sameSite:'none', maxAge:24*60*60*1000})

            return { accessToken }

        } catch (error: any) {
            logger.error(error.message);
            throw new Error(error.message)
        }
    }

export const loginUserController = async (req : Request,res : Response, next : NextFunction) =>{
        try {

            const { email, password } = req.body
            const { refreshToken, accessToken } = await loginUserService({ email, password })
            res.cookie('jwt', refreshToken, {httpOnly:true , sameSite:'none', maxAge:24*60*60*1000})
            res.status(200).json({
            accessToken
            })

        } catch (error :any ) {
            logger.error(error.message);
            throw new Error(error.message)
        }
    }

export const refreshTokenController = async (req : Request, res : Response ) => {
    const cookies = req.cookies;
    if(!cookies?.jwt) return res.sendStatus(204);
    const refreshToken = cookies.jwt as string

    const findUser = await findUserByTokenService(
      refreshToken,
    );

    if (!findUser) return res.sendStatus(403);

    try {
    //Get new access token from passing refresh token
    const response = await refreshTokenService(refreshToken)
    const accessToken = response.toString();
    if (!accessToken) return res.sendStatus(403);

    res.status(200).json({
    accessToken
    })

    } catch (error: any) {
            logger.error(error.message);
            throw new Error(error.message)
    }
    
}    

export const logoutUserController = async (req : Request, res : Response) => {
    
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204); 
    const refreshToken = cookies.jwt as string;

    try {
        logoutUserService(refreshToken)
        res.clearCookie('jwt', { httpOnly: true, sameSite: 'strict', secure: true });
        return res.json({ message: 'Successful logout' })
    } catch (error: any) {
            logger.error(error.message);
            throw new Error(error.message)
    }
}

export const privateRouteController = async (req : any, res : Response,  next : NextFunction) => {
    try {
        const user: any = await findUserService(req.user)

        res.status(200).json({
           name : user.name
        })
    } catch (error : any) {
        logger.error(error.message);
        throw new Error(error.message)
    }
}