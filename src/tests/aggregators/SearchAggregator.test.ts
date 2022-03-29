import { SearchAggregator } from '@Aggregators/SearchAggregator'
import { advertisingFactory, breederFactory, merchantFactory, poultryFactory, userFactory } from '@cig-platform/factories'

describe('SearchAggregator', () => {
  describe('.getBreeders', () => {
    it('returns the breeders', async () => {
      const breeders = [] as any[]
      const mockPoultryServiceClient: any = {
        getBreeders: jest.fn().mockResolvedValue(breeders)
      }
      const keyword = ''
      const searchAggregator = new SearchAggregator(
        mockPoultryServiceClient,
        {} as any,
        {} as any
      )

      const data = await searchAggregator.getBreeders(keyword)

      expect(data).toMatchObject(breeders)
      expect(mockPoultryServiceClient.getBreeders).toHaveBeenCalledWith('', keyword)
    })
  })

  describe('.getBreeder', () => {
    it('returns breeders, contacts and poultries', async () => {
      const breeder = breederFactory()
      const contacts = [] as any[]
      const poultries = [] as any[]
      const mockPoultryServiceClient: any = {
        getBreeder: jest.fn().mockResolvedValue(breeder),
        getContacts: jest.fn().mockResolvedValue(contacts),
        getPoultries: jest.fn().mockResolvedValue(poultries),
        getBreederImages: jest.fn().mockResolvedValue(breeder.images)
      }
      const searchAggregator = new SearchAggregator(
        mockPoultryServiceClient,
        {} as any,
        {} as any
      )

      const data = await searchAggregator.getBreeder(breeder.id)

      expect(data).toMatchObject({
        breeder: {
          ...breeder,
          contacts
        },
        poultries
      })
      expect(mockPoultryServiceClient.getBreeder).toHaveBeenCalledWith(breeder.id)
      expect(mockPoultryServiceClient.getContacts).toHaveBeenCalledWith(breeder.id)
      expect(mockPoultryServiceClient.getPoultries).toHaveBeenCalledWith(breeder.id, {})
      expect(mockPoultryServiceClient.getBreederImages).toHaveBeenCalledWith(breeder.id)
    })
  })

  describe('.getBreederPoultries', () => {
    it('returns poultries', async () => {
      const breeder = breederFactory()
      const merchant = merchantFactory()
      const advertising = advertisingFactory()
      const poultries = [] as any[]
      const merchants = [merchant]
      const advertisings = [advertising]
      const mockPoultryServiceClient: any = {
        getPoultries: jest.fn().mockResolvedValue({
          poultries,
          pages: 1
        }),
      }
      const mockAdvertisingServiceClient: any = {
        getMerchants: jest.fn().mockResolvedValue(merchants),
        getAdvertisings: jest.fn().mockResolvedValue(advertisings),
      }
      const searchAggregator = new SearchAggregator(
        mockPoultryServiceClient,
        mockAdvertisingServiceClient,
        {} as any
      )

      const data = await searchAggregator.getBreederPoultries(breeder.id)

      expect(data).toMatchObject({
        forSale: poultries,
        reproductives: poultries,
        matrixes: poultries,
        males: poultries,
        females: poultries,
        pagination: {
          forSale: 1,
          reproductives: 1,
          matrixes: 1,
          males: 1,
          females: 1
        }
      })
      expect(mockPoultryServiceClient.getPoultries).toHaveBeenCalledTimes(5)
      expect(mockAdvertisingServiceClient.getAdvertisings).toHaveBeenCalledWith(merchant.id, undefined, false)
      expect(mockAdvertisingServiceClient.getMerchants).toHaveBeenCalledWith(breeder.id)
    })
  })

  describe('.getPoultry', () => {
    it('returns the poultry data', async () => {
      const breeder = breederFactory()
      const poultry = poultryFactory()
      const merchant = merchantFactory()
      const user = userFactory()
      const images = [] as any[]
      const registers = [] as any[]
      const contacts = [] as any[]
      const advertisings = [] as any[]
      const questions = [] as any[]
      const mockPoultryServiceClient: any = {
        getBreeder: jest.fn().mockResolvedValue(breeder),
        getPoultry: jest.fn().mockResolvedValue(poultry),
        getPoultryImages: jest.fn().mockResolvedValue(images),
        getRegisters: jest.fn().mockResolvedValue(registers),
        getContacts: jest.fn().mockResolvedValue(contacts)
      }
      const mockAdvertisingServiceClient: any = {
        getMerchants: jest.fn().mockResolvedValue([merchant]),
        getAdvertisings: jest.fn().mockResolvedValue(advertisings),
        getAdvertisingQuestions: jest.fn().mockResolvedValue(questions)
      }
      const mockAccountServiceClient: any = {
        getUser: jest.fn().mockResolvedValue(user)
      }
      const searchAggregator = new SearchAggregator(
        mockPoultryServiceClient,
        mockAdvertisingServiceClient,
        mockAccountServiceClient
      )

      const data = await searchAggregator.getPoultry(breeder.id, poultry.id)

      expect(data).toMatchObject({
        breeder,
        whatsAppContacts: contacts,
        measurementAndWeigthing: registers,
        vaccines: registers,
        advertisings,
        poultry: {
          ...poultry,
          images,
          code: `${breeder.code}-${poultry.number}`
        }
      })
      expect(mockPoultryServiceClient.getBreeder).toHaveBeenCalledWith(breeder.id)
      expect(mockPoultryServiceClient.getPoultry).toHaveBeenCalledWith(breeder.id, poultry.id)
      expect(mockPoultryServiceClient.getPoultryImages).toHaveBeenCalledWith(breeder.id, poultry.id)
      expect(mockPoultryServiceClient.getRegisters).toHaveBeenCalledWith(breeder.id, poultry.id)
      expect(mockAdvertisingServiceClient.getMerchants).toHaveBeenCalledWith(breeder.id)
      expect(mockAdvertisingServiceClient.getAdvertisings).toHaveBeenCalledWith(merchant.id, poultry.id, false)
      expect(mockPoultryServiceClient.getContacts).toHaveBeenCalledWith(breeder.id)
    })
  })
})
