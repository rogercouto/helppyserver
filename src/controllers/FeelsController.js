const connection = require('../database/connection');

module.exports = {

    async index(request, response){
        const  { search = undefined } = request.query;
        let feels;
        if (search){
            feels = await connection('feels')
                    .where('title','like',`%${search}%`)
                    .orderBy('id', 'asc')
                    .select('*');
        }else{
            feels = await connection('feels')
                    .orderBy('id', 'asc')
                    .select('*');
        }
        return response.json(feels);
    },

    async create(request, response){
        const {title, subtitle, descr} = request.body;
        const res = await connection('feels')
            .insert({title, subtitle, descr})
            .returning('id');
        return response.json({
            message: 'Feel created', 
            id: res[0]
        });    
    },

    async update(request, response){
        const {id} = request.params;
        const {title, subtitle, descr} = request.body;
        const res = await connection('feels').update({title, subtitle, descr}).where('id', id);
        if (res === 0)
            return response.status(404).json({ error: 'Feel not found.' });
        return response.json({message: 'Feel updated'});
    },

    async delete(request, response){
        const {id} = request.params;
        const res = await connection('feels').delete().where('id', id);
        if (res === 0)
            return response.status(404).json({ error: 'Feel not found.' });
        return response.json({message: 'Feel deleted'});
    }

}
