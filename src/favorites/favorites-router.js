const path = require('path')
const express = require('express')
const xss = require('xss')
const FavoriteService = require('./favorites-service')

const favoriteRouter = express.Router()
const jsonParser = express.json()

//filter out the response to avoid showing broken data
const serializeFavorite = favorite => ({
    id: favorite.id,
    users_id: favorite.users_id,
    book_title: xss(favorite.book_title),
    book_author: xss(favorite.book_author),
    book_image: xss(favorite.book_image),
    book_description: xss(favorite.book_description),
    is_public: favorite.is_public
})

favoriteRouter
    .route('/')
    //relevant
    .get((req, res, next) => {

        //connect to the service to get the data
        FavoriteService.getFavorites(req.app.get('db'))
            .then(favorites => {
                //map the results to get each one of the objects and serialize them
                res.json(favorites.map(serializeFavorite))
            })
            .catch(next)
    })
    //relevant
    .post(jsonParser, (req, res, next) => {

        //take the input from the user
        const {
            users_id,
            book_title,
            book_author,
            book_image,
            book_description,
            is_public
        } = req.body
        const newFavorite = {
            users_id,
            book_title,
            book_author,
            book_image,
            book_description,
            is_public
        }

        //validate the input
        for (const [key, value] of Object.entries(newFavorite)) {
            if (value == null) {
                //if there is an error show it
                return res.status(400).json({
                    error: {
                        message: `Missing '${key}' in request body`
                    }
                })
            }
        }

        //save the input in the db
        FavoriteService.insertFavorite(
            req.app.get('db'),
            newFavorite
        )
            .then(favorite => {
                res
                    //display the 201 status code
                    .status(201)
                    //redirect the request to the original url adding the favorite id for editing
                    .location(path.posix.join(req.originalUrl, `/${favorite.id}`))
                    //return the serialized results
                    .json(serializeFavorite(favorite))
            })
            .catch(next)
    })


favoriteRouter
    .route('/:favorite_id')
    .all((req, res, next) => {
        if (isNaN(parseInt(req.params.favorite_id))) {
            //if there is an error show it
            return res.status(404).json({
                error: {
                    message: `Invalid id`
                }
            })
        }

        //connect to the service to get the data
        FavoriteService.getFavoriteById(
            req.app.get('db'),
            req.params.favorite_id
        )
            .then(favorite => {
                if (!favorite) {
                    //if there is an error show it
                    return res.status(404).json({
                        error: {
                            message: `Favorite doesn't exist`
                        }
                    })
                }
                res.favorite = favorite
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {

        //get each one of the objects from the results and serialize them
        res.json(serializeFavorite(res.favorite))
    })
    //relevant
    .patch(jsonParser, (req, res, next) => {

        //take the input from the user
        const {
            users_id,
            book_title,
            book_author,
            book_image,
            book_description,
            is_public
        } = req.body
        const favoriteToUpdate = {
            users_id,
            book_title,
            book_author,
            book_image,
            book_description,
            is_public
        }

        //validate the input by checking the length of the favoriteToUpdate object to make sure that we have all the values
        const numberOfValues = Object.values(favoriteToUpdate).filter(Boolean).length
        if (numberOfValues === 0) {
            //if there is an error show it
            return res.status(400).json({
                error: {
                    message: `Request body must content either 'title' or 'completed'`
                }
            })
        }

        //save the input in the db
        FavoriteService.updateFavorite(
            req.app.get('db'),
            req.params.favorite_id,
            favoriteToUpdate
        )
            .then(updatedFavorite => {

                //get each one of the objects from the results and serialize them
                res.status(200).json(serializeFavorite(updatedFavorite))
            })
            .catch(next)
    })
    //relevant
    .delete((req, res, next) => {
        FavoriteService.deleteFavorite(
            req.app.get('db'),
            req.params.favorite_id
        )
            .then(numRowsAffected => {

                //check how many rows are effected to figure out if the delete was successful
                res.status(204).json(numRowsAffected).end()
            })
            .catch(next)
    })


module.exports = favoriteRouter