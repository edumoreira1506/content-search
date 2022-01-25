import {
  PoultryServiceClient as IPoultryServiceClient,
  AdvertisingServiceClient as IAdvertisingServiceClient,
} from '@cig-platform/core'
import { PoultryGenderCategoryEnum, RegisterTypeEnum, BreederContactTypeEnum } from '@cig-platform/enums'

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

  async getBreederPoultries(breederId: string) {
    const merchants = await this._advertisingServiceClient.getMerchants(breederId)
    const merchant = merchants[0]
    const advertisings = await this._advertisingServiceClient.getAdvertisings(merchant.id)
    const poultryIds = advertisings.map(a => a.externalId).join(',')
    const forSale = poultryIds.length ? await this._poultryServiceClient.getPoultries(breederId, { poultryIds }) : []
    const reproductives = await this._poultryServiceClient.getPoultries(breederId, { genderCategory: PoultryGenderCategoryEnum.Reproductive })
    const matrixes = await this._poultryServiceClient.getPoultries(breederId, { genderCategory: PoultryGenderCategoryEnum.Matrix })
    const males = await this._poultryServiceClient.getPoultries(breederId, { genderCategory: PoultryGenderCategoryEnum.MaleChicken })
    const females = await this._poultryServiceClient.getPoultries(breederId, { genderCategory: PoultryGenderCategoryEnum.FemaleChicken })

    return {
      forSale,
      reproductives,
      matrixes,
      males,
      females
    }
  }

  async getPoultry(breederId: string, poultryId: string) {
    const breeder = await this._poultryServiceClient.getBreeder(breederId)
    const poultry = await this._poultryServiceClient.getPoultry(breederId, poultryId)
    const poultryImages = await this._poultryServiceClient.getPoultryImages(breederId, poultryId)
    const registers = await this._poultryServiceClient.getRegisters(breederId, poultryId)
    const measurementAndWeigthing = registers.filter(register => register.type === RegisterTypeEnum.MeasurementAndWeighing)
    const vaccines = registers.filter(register => register.type === RegisterTypeEnum.Vaccination)
    const merchants = await this._advertisingServiceClient.getMerchants(breederId)
    const advertisings = await this._advertisingServiceClient.getAdvertisings(merchants?.[0]?.id, poultry.id)
    const breederContacts = await this._poultryServiceClient.getContacts(breederId)
    const whatsAppContacts = breederContacts.filter(contact => contact.type === BreederContactTypeEnum.WHATS_APP)
    const advertisingsWithQuestions = await Promise.all(advertisings.map(async advertising => {
      const questions = await this._advertisingServiceClient.getAdvertisingQuestions(merchants?.[0]?.id, advertising.id)

      return {
        ...advertising,
        questions
      }
    }))

    return {
      poultry: { ...poultry, images: poultryImages, code: `${breeder.code}-${poultry.number}` },
      registers,
      advertisings: advertisingsWithQuestions,
      vaccines,
      measurementAndWeigthing,
      whatsAppContacts
    }
  }
}

export default new SearchAggregator(PoultryServiceClient, AdvertisingServiceClient)
