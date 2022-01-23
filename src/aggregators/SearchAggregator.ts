import {
  PoultryServiceClient as IPoultryServiceClient,
  AdvertisingServiceClient as IAdvertisingServiceClient,
} from '@cig-platform/core'

import PoultryServiceClient from '@Clients/PoultryServiceClient'
import AdvertisingServiceClient from '@Clients/AdvertisingServiceClient'

export class SearchAggregator {
  private _poultryServiceClient: IPoultryServiceClient;
  private _advertisingServiceClient: IAdvertisingServiceClient;
  
  constructor(poultryServiceClient: IPoultryServiceClient, advertisingServiceClient: IAdvertisingServiceClient) {
    this._poultryServiceClient = poultryServiceClient
    this._advertisingServiceClient = advertisingServiceClient

    this.getBreeders = this.getBreeders.bind(this)
    this.getPoultry = this.getPoultry.bind(this)
    this.getBreeder = this.getBreeder.bind(this)
  }

  async getBreeders(keyword = '') {
    const breeders = await this._poultryServiceClient.getBreeders('', keyword)

    return breeders
  }

  async getBreeder(breederId: string) {
    const breeder = await this._poultryServiceClient.getBreeder(breederId)
    const contacts = await this._poultryServiceClient.getContacts(breederId)
    const poultries = await this._poultryServiceClient.getPoultries(breederId, {})

    return { breeder: { ...breeder, contacts } , poultries }
  }

  async getPoultry(breederId: string, poultryId: string) {
    const breeder = await this._poultryServiceClient.getBreeder(breederId)
    const poultry = await this._poultryServiceClient.getPoultry(breederId, poultryId)
    const poultryImages = await this._poultryServiceClient.getPoultryImages(breederId, poultryId)
    const registers = await this._poultryServiceClient.getRegisters(breederId, poultryId)
    const measurementAndWeigthing = registers.filter(register => register.type === 'MEDIÇÃO E PESAGEM')
    const vaccines = registers.filter(register => register.type === 'VACINAÇÃO')
    const merchants = await this._advertisingServiceClient.getMerchants(breederId)
    const advertisings = await this._advertisingServiceClient.getAdvertisings(merchants?.[0]?.id, poultry.id)
    const breederContacts = await this._poultryServiceClient.getContacts(breederId)
    const whatsAppContacts = breederContacts.filter(contact => contact.type === 'WHATS_APP')

    return {
      poultry: { ...poultry, images: poultryImages, code: `${breeder.code}-${poultry.number}` },
      registers,
      advertisings,
      vaccines,
      measurementAndWeigthing,
      whatsAppContacts
    }
  }
}

export default new SearchAggregator(PoultryServiceClient, AdvertisingServiceClient)
