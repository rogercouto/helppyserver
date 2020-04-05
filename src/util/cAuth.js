const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = {

    encryptPassword(password){
        const salt = bcrypt.genSaltSync(10); //20 primeiros caracteres
        return bcrypt.hashSync(password, salt);
    },
    
    validatePassword(password, encryptedPassword){
        const salt = encryptedPassword.substring(0, 40);
        const testPassword = bcrypt.hashSync(password, salt);
        return (testPassword === encryptedPassword);
    },

    generateToken(admin){
        return jwt.sign(admin, process.env.SECRET_KEY);
    },

    getTokenFromHeader(authorizationHeader){
        if (authorizationHeader == undefined)
            return undefined;
        const array = authorizationHeader.split(' '); 
        if (array.length != 2)
            return undefined;
        return array[1];
    },
    
    validateToken(bearerToken){
        try{
            let ong = jwt.verify(bearerToken, process.env.SECRET_KEY);
            delete ong.password;
            return ong;
        }catch(err){
            console.log(err);
            return undefined;
        }
    }

}

