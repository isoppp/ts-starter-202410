export const RESPONSE_CODE = {
  // like status code
  R_UNAUTHORIZED: 'R_UNAUTHORIZED',
  R_INTERNAL_SERVER_ERROR: 'R_INTERNAL_SERVER_ERROR',

  // specific messages
  /** The verification request has already been sent (within 1 minute) */
  R_VERIFICATION_REQUEST_ALREADY_SENT: 'R_VERIFICATION_REQUEST_ALREADY_SENT',
  /** The user cannot continue the verification process. The reason should not send to users for security. */
  R_CANNOT_CONTINUE_VERIFICATION: 'R_CANNOT_CONTINUE_VERIFICATION',
}
export type RESPONSE_CODE = (typeof RESPONSE_CODE)[keyof typeof RESPONSE_CODE]
