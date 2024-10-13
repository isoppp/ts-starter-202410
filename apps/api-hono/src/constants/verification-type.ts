export const VerificationType = {
  EMAIL_LOGIN: 10,
  EMAIL_USER_REGISTRATION: 20,
}
export type VerificationType = (typeof VerificationType)[keyof typeof VerificationType]
