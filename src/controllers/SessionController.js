const connection = require('../database/connection');
const { validatePassword, generateToken } = require('../util/cAuth');

module.exports = {

    async create(request, response){
        const { email, password } = request.body;
        const admin = await connection('admins')
            .where('email', email)
            .select('*')
            .first();
        if (!admin){
            return response.status(404).json({ error: 'E-mail not found.' });
        }
        if (!validatePassword(password, admin.password)){
            return response.status(401).json({ error: 'Password incorrect.' });
        }
        const token = generateToken(admin);
        delete admin.password;
        admin.token = token;
        response.json(admin);
    }

}
