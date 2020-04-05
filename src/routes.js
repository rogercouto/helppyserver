const express = require('express');
const { celebrate, Segments, Joi } = require('celebrate');

const { getTokenFromHeader, validateToken } = require('./util/cAuth');

const SessionController = require('./controllers/SessionController');
const PostsController = require('./controllers/PostsController');
const UploadController = require('./controllers/UploadController');
const FeelsController = require('./controllers/FeelsController');
const InfosController = require('./controllers/InfosController');

const routes = express.Router();

function verifyToken(request, response, next){
    const bearerHeader = request.headers['authorization'];
    const bearerToken = getTokenFromHeader(bearerHeader);
    if (bearerToken === undefined){
        return response.status(401).json({ error: 'Authorization token not provided.' });
    }
    const admin = validateToken(bearerToken);
    if (!admin){
        return response.status(403).json({ error: 'Invalid or expired authorization token.' });
    }
    request.admin_id = admin.id;
    next();
}

const postTextValidation = celebrate({
    [Segments.BODY]: Joi.object().keys({
        title: Joi.string().required(),
        text: Joi.string().optional(),
        text_align: Joi.string().valid(null, 'left', 'center','right', 'justify').optional(),
        text_bg: Joi.string().allow(null).pattern(new RegExp('\\d{1,3},\\d{1,3},\\d{1,3}')).optional(),
        media: Joi.string().allow(null).optional(),
        media_type: Joi.string().valid(null, 'image', 'video', 'link', 'youtube').optional(),
    })
});

const feelCreateValidation = celebrate({
    [Segments.BODY]: Joi.object().keys({
        title: Joi.string().required(),
        subtitle: Joi.string().required(),
        descr: Joi.string().required()
    })
});

const feelUpdateValidation = celebrate({
    [Segments.BODY]: Joi.object().keys({
        title: Joi.string().optional(),
        subtitle: Joi.string().optional(),
        descr: Joi.string().optional()
    })
});


const infoCreateValidation = celebrate({
    [Segments.BODY]: Joi.object().keys({
        key: Joi.string().required(),
        title: Joi.string().required(),
        text: Joi.string().required()
    })
});

const infoUpdateValidation = celebrate({
    [Segments.BODY]: Joi.object().keys({
        title: Joi.string().required(),
        text: Joi.string().required()
    })
});

routes.get('/', (req, res)=>{
    res.json({
        message: "Welcome to the helppy api!"
    });
});

routes.post('/session', SessionController.create);

routes.get('/posts', PostsController.index);
routes.get('/posts/:id', PostsController.show);
routes.post('/posts', postTextValidation, verifyToken, PostsController.create);
routes.put('/posts/:id', postTextValidation, verifyToken, PostsController.update);
routes.delete('/posts/:id', verifyToken, PostsController.delete);

routes.post('/upload', verifyToken, UploadController.create);
routes.put('/upload/:id', verifyToken, UploadController.update);

routes.get('/feels', FeelsController.index);
routes.post('/feels', feelCreateValidation, verifyToken, FeelsController.create);
routes.put('/feels/:id', feelUpdateValidation, verifyToken, FeelsController.update);
routes.delete('/feels/:id', verifyToken, FeelsController.delete);

routes.get('/infos', InfosController.index);
routes.post('/infos', infoCreateValidation, verifyToken, InfosController.create);
routes.put('/infos/:key', infoUpdateValidation, verifyToken, InfosController.update);
routes.delete('/infos/:key', verifyToken, InfosController.delete);

module.exports = routes;