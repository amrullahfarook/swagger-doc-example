import {
    genSaltSync,
    hashSync,
} from 'bcrypt';
 
export const generatePassword = async (password : string) => {
        
    const SALT = genSaltSync();
    return hashSync(password, SALT);
};