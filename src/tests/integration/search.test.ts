import request from 'supertest'
import { breederFactory } from '@cig-platform/factories'

import App from '@Configs/server'
import SearchAggregator from '@Aggregators/SearchAggregator'

describe('Search actions', () => {
  it('can search breeders', async () => {
    const breeders = Array(10).fill(breederFactory()).map((breeder) => {
      delete breeder['description']
            
      return {
        ...breeder,
        foundationDate: breeder.foundationDate.toString()
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
})
