import {
  PoultryServiceClient as IPoultryServiceClient,
  AdvertisingServiceClient as IAdvertisingServiceClient,
  AccountServiceClient as IAccountServiceClient,
  DealServiceClient as IDealServiceClient,
} from '@cig-platform/core'
import { PoultryGenderCategoryEnum, RegisterTypeEnum, BreederContactTypeEnum } from '@cig-platform/enums'
import { IAdvertising } from '@cig-platform/types'

import PoultryServiceClient from '@Clients/PoultryServiceClient'
import AdvertisingServiceClient from '@Clients/AdvertisingServiceClient'
import AccountServiceClient from '@Clients/AccountServiceClient'
import DealServiceClient from '@Clients/DealServiceClient'
import ReviewServiceClient from '@Clients/ReviewServiceClient'

export class SearchAggregator {
  private _poultryServiceClient: IPoultryServiceClient
  private _advertisingServiceClient: IAdvertisingServiceClient
  private _accountServiceClient: IAccountServiceClient
  private _dealServiceClient: IDealServiceClient
  
  constructor(
    poultryServiceClient: IPoultryServiceClient,
    advertisingServiceClient: IAdvertisingServiceClient,
    accountServiceClient: IAccountServiceClient,
    dealServiceClient: IDealServiceClient
  ) {
    this._poultryServiceClient = poultryServiceClient
    this._advertisingServiceClient = advertisingServiceClient
    this._accountServiceClient = accountServiceClient
    this._dealServiceClient = dealServiceClient

    this.getBreeders = this.getBreeders.bind(this)
    this.getPoultryParents = this.getPoultryParents.bind(this)
    this.getPoultry = this.getPoultry.bind(this)
    this.getBreeder = this.getBreeder.bind(this)
    this.searchAdvertisings = this.searchAdvertisings.bind(this)
    this.getAdvertisingsHome = this.getAdvertisingsHome.bind(this)
  }

  getAdvertisingsEntireData = async (advertisings: IAdvertising[] = []) => Promise.all(advertisings.map(async (advertising) => {
    if (!advertising.merchantId || !advertising.externalId) return { advertising }

    const merchant = await this._advertisingServiceClient.getMerchant(advertising.merchantId)
    const breeder = await this._poultryServiceClient.getBreeder(merchant.externalId)
    const poultry = await this._poultryServiceClient.getPoultryDirectly(advertising.externalId)
    const poultryImages = await this._poultryServiceClient.getPoultryImages((poultry as any).breederId, poultry.id)
    const measurementAndWeight = await this._poultryServiceClient.getRegisters((poultry as any).breederId, poultry.id, RegisterTypeEnum.MeasurementAndWeighing)

    return {
      poultry: {
        ...poultry,
        mainImage: poultryImages?.[0]?.imageUrl
      },
      advertising,
      breeder,
      measurementAndWeight: measurementAndWeight?.[0]
    }
  }))

  async getAdvertisingsHome({ userId }: { userId?: string }) {
    const { advertisings: femaleChickenAdvertisings } = await this._advertisingServiceClient.searchAdvertisings({
      genderCategory: [PoultryGenderCategoryEnum.FemaleChicken]
    })
    const { advertisings: maleChickenAdvertisings } = await this._advertisingServiceClient.searchAdvertisings({
      genderCategory: [PoultryGenderCategoryEnum.MaleChicken]
    })
    const { advertisings: matrixAdvertisings } = await this._advertisingServiceClient.searchAdvertisings({
      genderCategory: [PoultryGenderCategoryEnum.Matrix]
    })
    const { advertisings: reproductiveAdvertisings } = await this._advertisingServiceClient.searchAdvertisings({
      genderCategory: [PoultryGenderCategoryEnum.Reproductive]
    })

    const femaleChickensWithAdvertising = await this.getAdvertisingsEntireData(femaleChickenAdvertisings)
    const maleChickensWithAdvertising = await this.getAdvertisingsEntireData(maleChickenAdvertisings)
    const reproductivesWithAdvertising = await this.getAdvertisingsEntireData(reproductiveAdvertisings)
    const matrixesWithAdvertising = await this.getAdvertisingsEntireData(matrixAdvertisings)

    type Carousel = {
      title: string;
      advertisings: typeof femaleChickensWithAdvertising,
      identifier: string;
    }

    const carousels: Carousel[] = []

    if (userId) {
      const { advertisings: favoriteAdvertisings } = await this._advertisingServiceClient.searchAdvertisings({
        favoriteExternalId: userId
      })
      const favoritesWithAdvertising = await this.getAdvertisingsEntireData(favoriteAdvertisings)

      if (favoritesWithAdvertising?.length) {
        carousels.push({
          title: 'Favoritos',
          advertisings: favoritesWithAdvertising,
          identifier: 'favorites'
        })
      }
    }

    if (matrixesWithAdvertising?.length) {
      carousels.push({
        title: 'Matrizes',
        advertisings: matrixesWithAdvertising,
        identifier: PoultryGenderCategoryEnum.Matrix
      })
    }

    if (reproductivesWithAdvertising?.length) {
      carousels.push({
        title: 'Reprodutores',
        advertisings: reproductivesWithAdvertising,
        identifier: PoultryGenderCategoryEnum.Reproductive
      })
    }

    if (maleChickensWithAdvertising?.length) {
      carousels.push({
        title: 'Frangos',
        advertisings: maleChickensWithAdvertising,
        identifier: PoultryGenderCategoryEnum.MaleChicken
      })
    }

    if (femaleChickenAdvertisings?.length) {
      carousels.push({
        title: 'Frangas',
        advertisings: femaleChickensWithAdvertising,
        identifier: PoultryGenderCategoryEnum.FemaleChicken
      })
    }

    return {
      carousels,
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
    page = 0,
    favoriteExternalId,
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
    page?: number;
    favoriteExternalId?: string;
  }) {
    const { advertisings, pages } = await this._advertisingServiceClient.searchAdvertisings({
      crest,
      dewlap,
      gender,
      genderCategory,
      name: keyword,
      tail,
      type,
      prices,
      sort,
      page,
      favoriteExternalId,
    })
    const poultriesWithAllData = await this.getAdvertisingsEntireData(advertisings)

    return { advertisings: poultriesWithAllData, pages }
  }

  async getBreeders(keyword = '') {
    const breeders = await this._poultryServiceClient.getBreeders('', keyword)

    return breeders
  }

  async getBreeder(breederId: string) {
    const breeder = await this._poultryServiceClient.getBreeder(breederId)
    const contacts = await this._poultryServiceClient.getContacts(breederId)
    const poultries = await this._poultryServiceClient.getPoultries(breederId, {})
    const images = await this._poultryServiceClient.getBreederImages(breederId)
    const [merchant] = await this._advertisingServiceClient.getMerchants(breeder.id)
    const reviews = await ReviewServiceClient.getReviews(merchant.id)
    const completeReviews = await Promise.all(reviews.map(async review => {
      const merchantReviewer = await this._advertisingServiceClient.getMerchant(review.reviewerMerchantId)
      const breederReviewer = await this._poultryServiceClient.getBreeder(merchantReviewer.externalId)

      return { ...review, breederReviewer }
    }))

    return { breeder: { ...breeder, contacts, images } , poultries, reviews: completeReviews }
  }

  async getBreederPoultries(breederId: string, pagination: {
    forSale?: number;
    reproductives?: number;
    matrixes?: number;
    males?: number;
    females?: number;
  } = {}, keyword = '') {
    const merchants = await this._advertisingServiceClient.getMerchants(breederId)
    const merchant = merchants[0]
    const advertisings = await this._advertisingServiceClient.getAdvertisings(merchant.id, undefined, false)
    const poultryIds = advertisings.map(a => a.externalId).join(',')
    const { poultries: forSale, pages: forSalePages } = poultryIds.length
      ? await this._poultryServiceClient.getPoultries(breederId, {
        poultryIds,
        page: pagination.forSale,
        name: keyword
      })
      : { poultries: [], pages: 0 }
    const { poultries: reproductives, pages: reproductivesPages } = await this._poultryServiceClient.getPoultries(breederId, {
      genderCategory: PoultryGenderCategoryEnum.Reproductive,
      page: pagination.reproductives,
      name: keyword
    })
    const { poultries: matrixes, pages: matrixesPages } = await this._poultryServiceClient.getPoultries(breederId, {
      genderCategory: PoultryGenderCategoryEnum.Matrix,
      page: pagination.matrixes,
      name: keyword
    })
    const { poultries: males, pages: malesPages } = await this._poultryServiceClient.getPoultries(breederId, {
      genderCategory: PoultryGenderCategoryEnum.MaleChicken,
      page: pagination.males,
      name: keyword
    })
    const { poultries: females, pages: femalesPages } = await this._poultryServiceClient.getPoultries(breederId, {
      genderCategory: PoultryGenderCategoryEnum.FemaleChicken,
      page: pagination.females,
      name: keyword
    })
    const { poultries: allPoultriesMixed } = await this._poultryServiceClient.getPoultries(breederId, {
      name: keyword
    })

    return {
      forSale,
      reproductives,
      matrixes,
      males,
      females,
      all: allPoultriesMixed,
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
        const [userId, breederId] = question.externalId.split('___')
        const user = await this._accountServiceClient.getUser(userId)
        const answersWithUser = await Promise.all(question.answers.map(async (answer) => {
          const user = await this._accountServiceClient.getUser(answer.externalId)

          return { ...answer, user }
        }))

        if (!breederId)return { ...question, answers: answersWithUser, user }
        
        const breeder = await this._poultryServiceClient.getBreeder(breederId)

        return  { ...question, answers: answersWithUser, user, breeder }
      }))
      const deals = await this._dealServiceClient.getDeals({ advertisingId: advertising.id })
      const favorites = await this._advertisingServiceClient.getAdvertisingFavorites(advertising.merchantId ?? '', advertising.id)

      return {
        ...advertising,
        questions: questionsWithUser,
        deals: deals.total,
        favorites: favorites.length
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

  async getPoultryParents(breederId: string, poultryId: string) {
    const poultry = await this._poultryServiceClient.getPoultry(breederId, poultryId)

    return {
      dad: poultry.dad,
      mom: poultry.mom
    }
  }
}

export default new SearchAggregator(
  PoultryServiceClient,
  AdvertisingServiceClient,
  AccountServiceClient,
  DealServiceClient
)
