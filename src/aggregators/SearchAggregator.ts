import {
  PoultryServiceClient as IPoultryServiceClient,
} from '@cig-platform/core'

import PoultryServiceClient from '@Clients/PoultryServiceClient'

export class SearchAggregator {
  private _poultryServiceClient: IPoultryServiceClient;
  
  constructor(poultryServiceClient: IPoultryServiceClient) {
    this._poultryServiceClient = poultryServiceClient

    this.getBreeders = this.getBreeders.bind(this)
  }

  async getBreeders(keyword = '') {
    const breeders = await this._poultryServiceClient.getBreeders('', keyword)

    return breeders
  }

  async getBreeder(breederId: string) {
    const breeder = await this._poultryServiceClient.getBreeder(breederId)

    return { breeder }
  }
}

export default new SearchAggregator(PoultryServiceClient)
