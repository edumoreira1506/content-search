import { DealServiceClient } from '@cig-platform/core'
import { DEAL_SERVICE_API_KEY } from '@Constants/api-keys'

import { DEAL_SERVICE_URL } from '@Constants/url'

export default new DealServiceClient(DEAL_SERVICE_URL, DEAL_SERVICE_API_KEY)
