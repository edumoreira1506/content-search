import express from 'express'

import SearchController from '@Controllers/SearchController'

const router = express.Router()

router.get('/breeders', SearchController.getBreeders)

router.get('/breeders/:breederId', SearchController.getBreeder)

export default router
