import { Request, Response } from 'express'
import { BaseController } from '@cig-platform/core'

import SearchAggregator from '@Aggregators/SearchAggregator'

class SearchController {
  constructor() {
    this.getBreeders = this.getBreeders.bind(this)
    this.getBreederPoultries = this.getBreederPoultries.bind(this)
    this.getPoultry = this.getPoultry.bind(this)
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
    const pagination = JSON.parse(req?.query?.pagination?.toString() ?? '')
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
