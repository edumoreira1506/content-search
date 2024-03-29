import { createDoc } from '@cig-platform/docs'

const breederDocs = {
  ...createDoc('/breeders', ['Breeders'], [
    {
      method: 'get',
      title: 'Search breeders',
      description: 'Route to find breeders',
      queryParams: [{ type: 'string', name: 'keyword' }]
    },
  ]),
  ...createDoc('/breeders/{breederId}', ['Breeders'], [
    {
      method: 'get',
      title: 'Get breeder',
      description: 'Route to get breeder',
    }
  ], {
    pathVariables: [{ type: 'string', name: 'breederId' }]
  }),
  ...createDoc('/breeders/{breederId}/poultries', ['Poultries'], [
    {
      method: 'get',
      title: 'Get breeder poultries',
      description: 'Route to get breeder poultries',
      queryParams: [
        { type: 'string', name: 'pagination' },
        { type: 'string', name: 'keyword' },
      ]
    }
  ], {
    pathVariables: [
      { type: 'string', name: 'breederId' },
    ]
  })
}

export default breederDocs
