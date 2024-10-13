import { RESPONSE_CODE } from '@repo/api-hono/src/constants/response-code'

type HandleResponseCodeReturn = {
  title: string
  description: string
}
export const handleResponseCode = (message: RESPONSE_CODE | string): HandleResponseCodeReturn => {
  switch (message) {
    case RESPONSE_CODE.R_UNAUTHORIZED:
      return {
        title: 'Authorization Failed',
        description: 'Please log in again.',
      }
    case RESPONSE_CODE.R_INTERNAL_SERVER_ERROR:
      return {
        title: 'Server Error',
        description: 'An unexpected error occurred. Please try again later.',
      }
    case RESPONSE_CODE.R_VERIFICATION_REQUEST_ALREADY_SENT:
      return {
        title: 'Verification Already Sent',
        description: 'A verification request has already been submitted.',
      }
    case RESPONSE_CODE.R_CANNOT_CONTINUE_VERIFICATION:
      return {
        title: 'Verification Error',
        description: 'Unable to proceed with verification. Please try again.',
      }
    default:
      return {
        title: 'Something Went Wrong',
        description: 'An unexpected error occurred. Please try again later.',
      }
  }
}
