const express= require('express');
const bodyParser = require('body-parser');
const Favorite = require('../models/favorite');
const authenticate = require('../authenticate');
const cors = require('./cors');
const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req,res) => res.sendStatus(200))
.get(cors.cors,authenticate.verifyUser,(req,res,next) => {
    Favorite.find()
    .populate('user')
    .populate('campsites')
    .then(favorites => {
        res.statusCode =200;
        res.setHeader('Content-Type','application/json');
        res.json(favorites);
    })
    .catch(err => next(err));
    
})

    

.post(cors.corsWithOptions ,authenticate.verifyUser,(req,res,next) => {
    Favorite.findOne({ user: req.user._id })
    .then(favorite => {
        if(favorite){
        req.body.forEach(item  => { 
              if(!favorite.campsites.includes(item._id))
              {
            
                favorite.campsites.push(item._id);
               
               }
            })
              favorite.save()
              .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
              })
              .catch(err => next(err));
          }
          else {
            Favorite.create({ user: req.user._id, campsites: req.body})
           .then(favorite => {
               console.log('Favorite Created ', favorite);
               res.statusCode = 200;
               res.setHeader('Content-Type', 'application/json');
               res.json(favorite);
           }) 
           .catch(err => next(err));
          }
        })

    .catch(err => next(err));

}) 
.put(cors.corsWithOptions ,authenticate.verifyUser,(req,res,next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on favorites');
})
.delete(cors.corsWithOptions ,authenticate.verifyUser,(req,res,next) => {
    Favorite.findOne({ user: req.user._id })
    .then(favorite => {
        if(favorite){
            favorite.remove();
        }
        else {
            err = new Error('No Favorite campsite to delete');
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));

});




favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req,res) => res.sendStatus(200))
.get(cors.cors,authenticate.verifyUser,(req,res,next) => {
    res.statusCode = 403;
    res.end(`GET operation not supported on /favorites/${req.params.campsiteId}`);
})
.post(cors.corsWithOptions ,authenticate.verifyUser,(req,res,next) => {
    Favorite.findOne({ user: req.user._id })
    .then(favorite => {
        if(favorite){
            if(!favorite.campsites.includes(req.params.campsiteId))
            {
                favorite.campsites.push(req.params.campsiteId) 
            
            favorite.save()
            .then(favorite => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(favorite);
            })
            .catch(err => next(err));
        }  else {
            err = new Error(`Campsite ${req.params.campsiteId} already a favorite`);
            err.status = 404;
            return next(err);
        }
    }else {
        Favorite.create({ user: req.user._id, campsites: [req.params.campsiteId]})
       .then(favorite => {
           console.log('Favorite Created ', favorite);
           res.statusCode = 200;
           res.setHeader('Content-Type', 'application/json');
           res.json(favorite);
       }) 
       .catch(err => next(err));
      } 
        })
        .catch(err => next(err));
}) 
.put(cors.corsWithOptions ,authenticate.verifyUser,(req,res,next) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /favorites/${req.params.campsiteId}`);
})
.delete(cors.corsWithOptions ,authenticate.verifyUser,(req,res,next) => {
    Favorite.findOne({ user: req.user._id })
    .then(favorite => {
        if(favorite){
        favorite.campsites=favorite.campsites.filter(id => (id!== req.params.campsiteId))
        favorite.save()
        .then(favorite => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
          })
          .catch(err => next(err));
        }
        else {
            err = new Error('No Favorite campsite to delete');
            err.status = 404;
            return next(err);
        }
        })
    
        .catch(err => next(err));

});

module.exports = favoriteRouter;