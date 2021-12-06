import { createDoc } from '@cig-platform/docs'

const breederDocs = {
  ...createDoc('/breeders', ['Search breeders'], [
    {
      method: 'get',
      title: 'Search breeders',
      description: 'Route to find breeders',
      queryParams: [{ type: 'string', name: 'keyword' }]
    },
  ])
}

export default breederDocs
