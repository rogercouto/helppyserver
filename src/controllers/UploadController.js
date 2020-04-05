const connection = require('../database/connection');
const fs = require('fs');

function generateNewFileName(fileName){
    const ext = fileName.split('.').pop();
    const now = new Date();
    return now.toISOString().replace(/\D/g,'')+'.'+ext;
}

module.exports = {

    async create(request, response){
        try {
            if (!request.files){
                response.status(403).send({
                    error: 'No file to upload'
                });
            }
            const media = request.files.media;
            const newName = generateNewFileName(media.name);
            media.mv(process.env.UPLOAD_DIR+newName);
            const { title, text } = request.body;
            let media_type;
            if (media.mimetype.includes('image')){
                media_type = 'image';
            }else if(media.mimetype.includes('video')){
                media_type = 'video';
            }
            const ret = await connection('posts').insert({
                admin_id : request.admin_id, title, text,
                media: newName, media_type, media_upload: true
            }).returning('id');
            return response.json({ 
                message: 'Post created',
                id: ret[0] 
            });
        } catch (error) {
            response.status(500).send({error });
        }    
    },

    async update(request, response){
        const { id } = request.params;
        const post = await connection('posts')
            .where('posts.id', id)
            .select('*')
            .first();
        //delete after
        const fileToDelete = (post.media_upload && post.media) ? post.media : undefined;
        //validations
        if (!post){
            return response.status(404).json({ error: 'Post not found.' });
        }else if (post.admin_id !== request.admin_id){
            return response.status(403).json({ error: 'Cannot edit another admins posts.' });
        }
        //move file to folder
        const media = request.files.media;
        const newName = generateNewFileName(media.name);
        media.mv(process.env.UPLOAD_DIR+newName);
        //set post data
        const { title, text } = request.body;
        if (title)
            post.title = title;
        if (text)
            post.text = text;
        post.media = newName;
        if (media.mimetype.includes('image')){
            post.media_type = 'image';
        }else if(media.mimetype.includes('video')){
            post.media_type = 'video';
        }
        //remove style when set image
        if (post.text_bg)
            post.text_bg = null;
        if (post.text_align)    
            post.text_align = null;
        post.media_upload = true;
        delete post.id; //don't needed
        //update post
        await connection('posts').where('id', id).update(post);
        if (fileToDelete){
            fs.unlink(process.env.UPLOAD_DIR+fileToDelete, function (err) {
                if (err) 
                    console.log(err);
            });
        }
        return response.json({ message: 'Post updated'});
    }

}