import { AdvertisingServiceClient } from '@cig-platform/core'
import { ADVERTISING_SERVICE_API_KEY } from '@Constants/api-keys'

import { ADVERTISING_SERVICE_URL } from '@Constants/url'

export default new AdvertisingServiceClient(ADVERTISING_SERVICE_URL, ADVERTISING_SERVICE_API_KEY)
