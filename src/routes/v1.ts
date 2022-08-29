import express from 'express'

import SearchController from '@Controllers/SearchController'

const router = express.Router()

router.get(
  '/search',
  SearchController.getAdvertisings
)

router.get(
  '/home',
  SearchController.getAdvertisingsHome
)

router.get('/breeders', SearchController.getBreeders)

router.get('/breeders/:breederId', SearchController.getBreeder)

router.get('/breeders/:breederId/poultries', SearchController.getBreederPoultries)

router.get('/breeders/:breederId/poultries/:poultryId', SearchController.getPoultry)

router.get('/breeders/:breederId/poultries/:poultryId/parents', SearchController.getPoultryParents)

export default router
