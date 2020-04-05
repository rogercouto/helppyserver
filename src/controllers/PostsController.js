const connection = require('../database/connection');
const fs = require('fs');

const PAGE_SIZE = 6;

const selectFields = {
    id: 'posts.id', created_by: 'name', title: 'title', text: 'text', 
    text_align: 'text_align', text_bg: 'text_bg',
    media: 'media', media_type: 'media_type', 
    media_upload: 'media_upload', created_at: 'created_at'
}

function changeBgToArray(post){
    const strarr = post.text_bg.split(',');
    const newbg = [
        parseInt(strarr[0], 10) ,
        parseInt(strarr[1], 10) ,
        parseInt(strarr[2], 10) 
    ];
    post.text_bg = newbg;
}

function setUrl(host, post){
    if (post.media_upload){
        const url = "http://"+host+"/"+post.media;
        post.media = url;
    }
}

function validateBg(string){
    if (!string)
        return true;
    const array = string.split(',');
    if (array.length != 3){
        return false;
    }
    let res = true;
    array.forEach(ss=>{
        if (isNaN(ss)){
            res = false;
            return;
        }else if (ss.includes('.')){
            res = false;
            return;
        }
    });
    return res;
}

function checkLink(data) {
    if (!data || !data.media)
        return;
    if (data.media.includes('https://youtu.be/')) {
        let tmp = data.media.replace('https://youtu.be/','').split('?');
        if (tmp.length > 0){
            data.media = tmp[0];
            data.media_type = 'youtube';
        }
    }else if (data.media.includes('https://www.youtube.com/watch?v=')){
        let tmp = data.media.replace('https://www.youtube.com/watch?v=','').split('?');
        if (tmp.length > 0){
            data.media = tmp[0];
            data.media_type = 'youtube';
        }
    }else if (data.media.endsWith('.jpg')
    ||data.media.endsWith('.jpeg')
    ||data.media.endsWith('.png')){
        data.media_type = 'image';
    }
}

module.exports = {

    async index(request, response){
        const  { page = 0 } = request.query;
        const [total] = await connection('posts').count();
        const posts =  await connection('posts')
            .join('admins','posts.admin_id','admins.id')
            .limit(page > 0 ? PAGE_SIZE : total.count)
            .offset(page > 0 ? (page-1)*PAGE_SIZE : 0)
            .orderBy('posts.id','desc')
            .select(selectFields);
        const host = request.get('host');
        posts.forEach(post => {
            if (post.text_bg)
                changeBgToArray(post);
            if (post.media_upload)
                setUrl(host, post);
            if (post.media_type == 'youtube'){
                post.media = 'https://youtu.be/'+post.media;
            }    
            delete post.media_upload;
        });
        response.header('X-Total-Count', total.count);
        response.header('X-Page-Size', PAGE_SIZE);
        response.header('Access-Control-Expose-Headers', 'X-Total-Count, X-Page-Size');
        return response.json(posts);
    },

    async show(request, response){
        const { id } = request.params;
        const post = await connection('posts')
            .join('admins', 'posts.admin_id', 'admins.id')
            .where('posts.id', id)
            .select(selectFields)
            .first();
        if (!post){
            return response.status(404).json({ error: 'Post not found.' });
        }    
        if (post.media_upload){
            const host = request.get('host');
            setUrl(host, post);
            delete post.media_upload;
        }
        if (post.text_bg)
            changeBgToArray(post);
        return response.json(post);
    },

    

    async create(request, response){
        const { title,text,text_align,text_bg,media,media_type } = request.body;
        if (!validateBg(text_bg)){
            return response.status(400).json({ error: 'invalid text_bg, try: \"r,g,b\".' });
        }
        const ret = await connection('posts').insert({
            admin_id : request.admin_id,
            title,text,text_align,text_bg,media,media_type
        }).returning('id');
        return response.json({ 
            message: 'Post created',
            id: ret[0] 
        });
    },

    async update(request, response){
        const { id } = request.params;
        const { title,text,text_align,text_bg,media,media_type } = request.body;
        const post = await connection('posts')
            .where('id', id)
            .select('*')
            .first();
        let fileToDelete = undefined;
        if (!post){
            return response.status(404).json({ error: 'Post not found.' });
        }else if (post.admin_id !== request.admin_id){
            return response.status(403).json({ error: 'Cannot edit another admins posts.' });
        } 
        const data = {
            title,text,text_align,text_bg,
        };
        if (media !== undefined){
            if (post.media_upload)
                fileToDelete = post.media;
            data.media = media;
            if (media_type)    
                data.media_type = media_type;
            data.media_upload = false;
            checkLink(data);
        }
        await connection('posts').update(data).where('id', id);
        if (fileToDelete){
            fs.unlink(process.env.UPLOAD_DIR+fileToDelete, function (err) {
                if (err) 
                    console.log(err);
            });
        }
        return response.json({ message: 'Post updated', id: id});
    },

    async delete(request, response){
        const { id } = request.params;
        const post = await connection('posts')
            .where('id', id)
            .select(['admin_id','media','media_upload'])
            .first();
        if (!post){
            return response.status(404).json({ error: 'Post not found.' });
        }else if (post.admin_id !== request.admin_id){
            return response.status(403).json({ error: 'Cannot delete another admins posts.' });
        } 
        if (post.media_upload){
            fs.unlink(process.env.UPLOAD_DIR+post.media, function (err) {
                if (err) 
                    console.log(err);
            });
        }
        await connection('posts').delete().where('id', id);
        return response.json({ message: 'Post deleted'});
    }

}
