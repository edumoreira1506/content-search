import { createDoc } from '@cig-platform/docs'

const poultryDocs = {
  ...createDoc('/breeders/{breederId}/poultries/{poultryId}', ['Get poultry'], [
    {
      method: 'get',
      title: 'Get poultry',
      description: 'Route to get poultry',
    }
  ], {
    pathVariables: [{ type: 'string', name: 'breederId' }, { type: 'string', name: 'poultryId' }]
  }),
  ...createDoc('/search', ['Search'], [
    {
      method: 'get',
      title: 'Search advertisings',
      description: 'Route to search advertisings',
      queryParams: [
        {
          type: 'string',
          name: 'gender'
        },
        {
          type: 'string',
          name: 'type'
        },
        {
          type: 'string',
          name: 'tail'
        },
        {
          type: 'string',
          name: 'dewlap'
        },
        {
          type: 'string',
          name: 'crest'
        },
        {
          type: 'string',
          name: 'keyword'
        },
        {
          type: 'string',
          name: 'genderCategory'
        },
        {
          type: 'string',
          name: 'prices'
        },
        {
          type: 'string',
          name: 'sort'
        },
        {
          type: 'string',
          name: 'page'
        },
        {
          type: 'string',
          name: 'favoriteIds'
        },
      ]
    },
  ]),
  ...createDoc('/home', ['Home'], [
    {
      method: 'get',
      title: 'Get advertisings home',
      description: 'Route to get advertisings home',
    },
  ]),
}

export default poultryDocs
