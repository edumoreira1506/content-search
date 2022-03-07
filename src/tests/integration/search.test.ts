import request from 'supertest'
import { breederFactory } from '@cig-platform/factories'
import { IBreeder, IPoultry } from '@cig-platform/types'

import App from '@Configs/server'
import SearchAggregator from '@Aggregators/SearchAggregator'

describe('Search actions', () => {
  it('can search breeders', async () => {
    const breeders = Array(10).fill(breederFactory()).map((breeder) => {
      delete breeder['description']

      return {
        ...breeder,
        foundationDate: breeder.foundationDate.toString(),
        createdAt: breeder.createdAt.toString(),
      }
    })
    const mockGetBreeders = jest.fn().mockResolvedValue(breeders)

    jest.spyOn(SearchAggregator, 'getBreeders').mockImplementation(mockGetBreeders)

    const response = await request(App).get('/v1/breeders')

    expect(response.statusCode).toBe(200)
    expect(response.body).toMatchObject({
      ok: true,
      breeders
    })
    expect(mockGetBreeders).toHaveBeenCalledTimes(1)
  })

  it('can find breeder', async () => {
    const breeder = {
      ...breederFactory(),
      foundationDate: new Date().toString() as any,
      createdAt: new Date().toString() as any,
    } as Partial<IBreeder>

    delete breeder['description']
    
    const poultries = [] as IPoultry[]

    const mockGetBreeder = jest.fn().mockResolvedValue({ breeder, poultries })

    jest.spyOn(SearchAggregator, 'getBreeder').mockImplementation(mockGetBreeder)

    const response = await request(App).get(`/v1/breeders/${breeder.id}`)

    expect(response.statusCode).toBe(200)
    expect(response.body).toMatchObject({
      ok: true,
      breeder,
      poultries
    })
    expect(mockGetBreeder).toHaveBeenCalledWith(breeder.id)
  })
})
