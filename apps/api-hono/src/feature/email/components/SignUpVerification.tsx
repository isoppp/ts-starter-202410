import { generateRandomURLString } from '@/utils/auth'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

const baseUrl = 'http://localhost:3000'
const serviceName = '@isoppp/remix-starter'

type Props = {
  pathname: string
}
export const SignUpVerification = ({ pathname = `/signup/${generateRandomURLString()}` }: Props) => {
  const href = baseUrl + pathname
  return (
    <Html>
      <Head />
      <Preview>You're now ready to make live transactions with Stripe!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section>
            <Img src={`${baseUrl}/favicon.ico`} width='20' height='20' alt='Stripe' />
            <Hr style={hr} />
            <Heading style={h1}>Welcome to {serviceName}!👋</Heading>
            <Text style={paragraph}>Here's your secure link to sign up:</Text>
            <Button style={button} href={href}>
              Create your account
            </Button>
            <Text style={caption}>This link will expire in 5 minutes</Text>

            <Text style={paragraph}>You can also copy and paste the link below into the browser:</Text>

            <Link href={href} style={textLink}>
              {href}
            </Link>
            <Hr style={hr} />
            <Text style={footer}>If you didn't request this email, you can safely ignore it.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default SignUpVerification

const colors = {
  primary: '#3aad5f',
  link: '#007bff',
} as const

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
} as const

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px',
} as const

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
} as const

const h1 = {
  color: '#555',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: '22px',
  fontWeight: 'bold',
  margin: '10px 0',
  padding: '0',
} as const

const paragraph = {
  color: '#525f7f',

  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'left' as const,
} as const

const caption = {
  color: '#717991',

  fontSize: '13px',
  lineHeight: '20px',
  margin: '8px 0 0',
  textAlign: 'center' as const,
} as const

const button = {
  backgroundColor: colors.primary,
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '100%',
  padding: '10px 0',
} as const

const textLink = {
  display: 'block',
  fontSize: '16px',
  wordBreak: 'break-all',
  lineHeight: '1.4',
  color: colors.link,
  marginTop: '-10px',
} as const

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '0',
} as const
