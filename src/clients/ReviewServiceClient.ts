import ReviewServiceClient from '@cig-platform/review-service-client'
import { REVIEW_SERVICE_API_KEY } from '@Constants/api-keys'

import { REVIEW_SERVICE_URL } from '@Constants/url'

export default new ReviewServiceClient(REVIEW_SERVICE_URL, REVIEW_SERVICE_API_KEY)
