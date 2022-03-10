import {
  PoultryServiceClient as IPoultryServiceClient,
  AdvertisingServiceClient as IAdvertisingServiceClient,
  AccountServiceClient as IAccountServiceClient,
} from '@cig-platform/core'
import { PoultryGenderCategoryEnum, RegisterTypeEnum, BreederContactTypeEnum } from '@cig-platform/enums'
import { IPoultry } from '@cig-platform/types'

import PoultryServiceClient from '@Clients/PoultryServiceClient'
import AdvertisingServiceClient from '@Clients/AdvertisingServiceClient'
import AccountServiceClient from '@Clients/AccountServiceClient'

type Poultry = IPoultry & { mainImage: string; breederId: string }

export class SearchAggregator {
  private _poultryServiceClient: IPoultryServiceClient
  private _advertisingServiceClient: IAdvertisingServiceClient
  private _accountServiceClient: IAccountServiceClient
  
  constructor(
    poultryServiceClient: IPoultryServiceClient,
    advertisingServiceClient: IAdvertisingServiceClient,
    accountServiceClient: IAccountServiceClient
  ) {
    this._poultryServiceClient = poultryServiceClient
    this._advertisingServiceClient = advertisingServiceClient
    this._accountServiceClient = accountServiceClient

    this.getBreeders = this.getBreeders.bind(this)
    this.getPoultry = this.getPoultry.bind(this)
    this.getBreeder = this.getBreeder.bind(this)
    this.searchAdvertisings = this.searchAdvertisings.bind(this)
    this.getAdvertisingsHome = this.getAdvertisingsHome.bind(this)
  }

  getPoultriesEntireData = async (poultries: Poultry[] = []) => Promise.all(poultries.map(async (poultry: Poultry) => {
    const merchants = await this._advertisingServiceClient.getMerchants(poultry.breederId)
    const breeder = await this._poultryServiceClient.getBreeder(poultry.breederId)

    if (!merchants.length) return { poultry, breeder }

    const advertisings = await this._advertisingServiceClient.getAdvertisings(merchants[0].id, poultry.id, false)
    const measurementAndWeight = await this._poultryServiceClient.getRegisters(breeder.id, poultry.id, RegisterTypeEnum.MeasurementAndWeighing)

    return { poultry, advertising: advertisings?.[0], breeder, measurementAndWeight: measurementAndWeight?.[0] }
  }))

  async getAdvertisingsHome() {
    const { poultries: femaleChickens } = await this._poultryServiceClient.findPoultries({
      genderCategory: [PoultryGenderCategoryEnum.MaleChicken],
      forSale: 'true',
      page: 0,
    })
    const { poultries: maleChickens } = await this._poultryServiceClient.findPoultries({
      genderCategory: [PoultryGenderCategoryEnum.FemaleChicken],
      forSale: 'true',
      page: 0,
    })
    const { poultries: matrixes } = await this._poultryServiceClient.findPoultries({
      genderCategory: [PoultryGenderCategoryEnum.Matrix],
      forSale: 'true',
      page: 0,
    })
    const { poultries: reproductives } = await this._poultryServiceClient.findPoultries({
      genderCategory: [PoultryGenderCategoryEnum.Reproductive],
      forSale: 'true',
      page: 0,
    })

    const femaleChickensWithAdvertising = await this.getPoultriesEntireData(femaleChickens)
    const maleChickensWithAdvertising = await this.getPoultriesEntireData(maleChickens)
    const reproductivesWithAdvertising = await this.getPoultriesEntireData(reproductives)
    const matrixesWithAdvertising = await this.getPoultriesEntireData(matrixes)

    return {
      femaleChickens: femaleChickensWithAdvertising,
      maleChickens: maleChickensWithAdvertising,
      reproductives: reproductivesWithAdvertising,
      matrixes: matrixesWithAdvertising
    }
  }

  async searchAdvertisings({
    gender,
    type,
    tail,
    dewlap,
    crest,
    keyword,
    genderCategory,
    prices,
    sort,
    favoriteIds,
    page = 0
  }: {
    gender?: string[];
    type?: string[];
    tail?: string[];
    dewlap?: string[];
    crest?: string[];
    keyword?: string;
    genderCategory?: string[];
    prices?: { min: number; max: number };
    sort?: string;
    favoriteIds?: string;
    page?: number;
  }) {
    const { poultries, pages } = await this._poultryServiceClient.findPoultries({
      crest,
      description: keyword,
      dewlap,
      forSale: 'true',
      gender,
      genderCategory,
      name: keyword,
      tail,
      type,
      prices,
      sort,
      page,
    })
    const poultriesWithAllData = await this.getPoultriesEntireData(poultries)

    const filteredPoultries = poultriesWithAllData.filter(p => {
      const favoritedIdsArray = favoriteIds?.split(',').filter(Boolean) ?? []

      if (!favoritedIdsArray.length || !p.advertising?.id) return p

      return favoritedIdsArray.includes(p.advertising.id)
    })

    return { advertisings: filteredPoultries, pages }
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

  async getBreederPoultries(breederId: string, pagination: {
    forSale?: number;
    reproductives?: number;
    matrixes?: number;
    males?: number;
    females?: number;
  } = {}) {
    const merchants = await this._advertisingServiceClient.getMerchants(breederId)
    const merchant = merchants[0]
    const advertisings = await this._advertisingServiceClient.getAdvertisings(merchant.id, undefined, false)
    const poultryIds = advertisings.map(a => a.externalId).join(',')
    const { poultries: forSale, pages: forSalePages } = await this._poultryServiceClient.getPoultries(breederId, { poultryIds, page: pagination.forSale })
    const { poultries: reproductives, pages: reproductivesPages } = await this._poultryServiceClient.getPoultries(breederId, { genderCategory: PoultryGenderCategoryEnum.Reproductive, page: pagination.reproductives })
    const { poultries: matrixes, pages: matrixesPages } = await this._poultryServiceClient.getPoultries(breederId, { genderCategory: PoultryGenderCategoryEnum.Matrix, page: pagination.matrixes })
    const { poultries: males, pages: malesPages } = await this._poultryServiceClient.getPoultries(breederId, { genderCategory: PoultryGenderCategoryEnum.MaleChicken, page: pagination.males })
    const { poultries: females, pages: femalesPages } = await this._poultryServiceClient.getPoultries(breederId, { genderCategory: PoultryGenderCategoryEnum.FemaleChicken, page: pagination.females })

    return {
      forSale,
      reproductives,
      matrixes,
      males,
      females,
      pagination: {
        forSale: forSalePages,
        reproductives: reproductivesPages,
        matrixes: matrixesPages,
        males: malesPages,
        females: femalesPages
      }
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
    const advertisings = await this._advertisingServiceClient.getAdvertisings(merchants?.[0]?.id, poultry.id, false)
    const breederContacts = await this._poultryServiceClient.getContacts(breederId)
    const whatsAppContacts = breederContacts.filter(contact => contact.type === BreederContactTypeEnum.WHATS_APP)
    const advertisingsWithQuestions = await Promise.all(advertisings.map(async advertising => {
      const questions = await this._advertisingServiceClient.getAdvertisingQuestions(merchants?.[0]?.id, advertising.id)
      const questionsWithUser = await Promise.all(questions.map(async (question) => {
        const user = await this._accountServiceClient.getUser(question.externalId)
        const answersWithUser = await Promise.all(question.answers.map(async (answer) => {
          const user = await this._accountServiceClient.getUser(answer.externalId)

          return { ...answer, user }
        }))

        return { ...question, answers: answersWithUser, user }
      }))

      return {
        ...advertising,
        questions: questionsWithUser
      }
    }))

    return {
      poultry: { ...poultry, images: poultryImages, code: `${breeder.code}-${poultry.number}` },
      registers,
      advertisings: advertisingsWithQuestions,
      vaccines,
      measurementAndWeigthing,
      whatsAppContacts,
      breeder
    }
  }
}

export default new SearchAggregator(PoultryServiceClient, AdvertisingServiceClient, AccountServiceClient)
