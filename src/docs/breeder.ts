import { createDoc } from '@cig-platform/docs'

const breederDocs = {
  ...createDoc('/breeders', ['Search breeders'], [
    {
      method: 'get',
      title: 'Search breeders',
      description: 'Route to find breeders',
      queryParams: [{ type: 'string', name: 'keyword' }]
    },
  ]),
  ...createDoc('/breeders/{breederId}', ['Get breeder'], [
    {
      method: 'get',
      title: 'Get breeder',
      description: 'Route to get breeder',
    }
  ], {
    pathVariables: [{ type: 'string', name: 'breederId' }]
  }),
  ...createDoc('/breeders/{breederId}/poultries', ['Get breeder poultries'], [
    {
      method: 'get',
      title: 'Get breeder poultries',
      description: 'Route to get breeder poultries',
    }
  ], {
    pathVariables: [{ type: 'string', name: 'breederId' }]
  })
}

export default breederDocs
