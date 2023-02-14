import { ExtractJwt, Strategy} from 'passport-jwt'
import { passportJwtSecret } from 'jwks-rsa';
import config from '../config/index'


export const initializeJwtStrategy = (passport : any) => {
    passport.use('jwt',new Strategy({
        jwtFromRequest : ExtractJwt.fromAuthHeaderAsBearerToken(),
        _audience: config.cognitoClientId,
        issuer: `https://cognito-idp.${config.cognitoRegion}.amazonaws.com/${config.cognitoUserPoolId}`,
        algorithms: ['RS256'],
        secretOrKeyProvider : passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://cognito-idp.${config.cognitoRegion}.amazonaws.com/${config.cognitoUserPoolId}/.well-known/jwks.json`,
      }),
        ignoreExpiration: false
    }, async (payload, done) => {
        try {
            const email = payload.username
            return done(null, email)
        } catch (error : any) {
            return done(null, false, {message : error.message})
        }
    }))

}