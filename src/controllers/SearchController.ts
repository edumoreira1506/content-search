import { Request, Response } from 'express'
import { BaseController } from '@cig-platform/core'

import SearchAggregator from '@Aggregators/SearchAggregator'

class SearchController {
  constructor() {
    this.getBreeders = this.getBreeders.bind(this)
  }

  @BaseController.errorHandler()
  async getBreeders(req: Request, res: Response) {
    const keyword = req.query.keyword
    const breeders = await SearchAggregator.getBreeders(keyword?.toString())

    return BaseController.successResponse(res, { breeders })
  }
}

export default new SearchController()
