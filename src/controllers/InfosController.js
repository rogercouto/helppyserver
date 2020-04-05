const connection = require('../database/connection');

module.exports = {

    async index(request, response){
        const  { search = undefined } = request.query;
        let infos;
        if (search){
            infos = await connection('infos')
                    .where('title','like',`%${search}%`)
                    .orderBy('key','asc')
                    .select('*');
        }else{
            infos = await connection('infos')
                            .orderBy('key','asc')
                            .select('*');
        }
        return response.json(infos);
    },

    async create(request, response){
        const {key, title, text} = request.body;
        await connection('infos')
            .insert({key, title, text});    
        return response.json({
            message: 'Info created'
        });    
    },

    async update(request, response){
        const {key} = request.params;
        const {title, text} = request.body;
        const res = await connection('infos').update({title, text}).where('key', key);
        if (res === 0)
            return response.status(404).json({ error: 'Info not found.' });    
        return response.json({message: 'Info updated'});
    },

    async delete(request, response){
        const {key} = request.params;
        const res = await connection('infos').delete().where('key', key);
        if (res === 0)
            return response.status(404).json({ error: 'Info not found.' });    
        return response.json({message: 'Info deleted'});
    }

}
