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
  })
}

export default poultryDocs
