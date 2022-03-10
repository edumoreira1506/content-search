import { Request, Response } from 'express'
import { BaseController } from '@cig-platform/core'

import SearchAggregator from '@Aggregators/SearchAggregator'

class SearchController {
  constructor() {
    this.getBreeders = this.getBreeders.bind(this)
    this.getBreederPoultries = this.getBreederPoultries.bind(this)
    this.getPoultry = this.getPoultry.bind(this)
    this.getAdvertisings = this.getAdvertisings.bind(this)
  }

  @BaseController.errorHandler()
  async getAdvertisings(req: Request, res: Response) {
    const gender = req.query?.gender?.toString().split(',') ?? []
    const type = req.query?.type?.toString().split(',') ?? []
    const tail = req.query?.tail?.toString().split(',') ?? []
    const dewlap = req.query?.dewlap?.toString().split(',') ?? []
    const crest = req.query?.crest?.toString().split(',') ?? []
    const keyword = req?.query?.keyword?.toString()
    const genderCategory = req?.query?.genderCategory?.toString().split(',') ?? []
    const prices = req?.query?.prices && JSON.parse(req.query.prices.toString())
    const sort = req?.query?.sort?.toString()
    const page = Number(req?.query?.page ?? 0)
    const favoriteIds = req?.query?.favoriteIds?.toString()
    const data = await SearchAggregator.searchAdvertisings({
      crest,
      dewlap,
      gender,
      genderCategory,
      keyword,
      prices,
      sort,
      tail,
      type,
      favoriteIds,
      page
    })

    return BaseController.successResponse(res, data)
  }

  @BaseController.errorHandler()
  async getBreeders(req: Request, res: Response) {
    const keyword = req.query.keyword
    const breeders = await SearchAggregator.getBreeders(keyword?.toString())

    return BaseController.successResponse(res, { breeders })
  }

  @BaseController.errorHandler()
  async getBreeder(req: Request, res: Response) {
    const breederId = req?.params?.breederId
    const data = await SearchAggregator.getBreeder(breederId)

    return BaseController.successResponse(res, data)
  }

  @BaseController.errorHandler()
  async getBreederPoultries(req: Request, res: Response) {
    const breederId = req?.params?.breederId
    const pagination = JSON.parse(req?.query?.pagination?.toString() ?? '{}')
    const data = await SearchAggregator.getBreederPoultries(breederId, pagination)

    return BaseController.successResponse(res, data)
  }

  @BaseController.errorHandler()
  async getPoultry(req: Request, res: Response) {
    const breederId = req?.params?.breederId
    const poultryId = req?.params?.poultryId
    const data = await SearchAggregator.getPoultry(breederId, poultryId)

    return BaseController.successResponse(res, data)
  }
}

export default new SearchController()
