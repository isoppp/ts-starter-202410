import { env } from '@/lib/env'
import { generateRandomURLString } from '@/utils/auth'
import { Body, Button, Container, Head, Heading, Html, Img, Row, Section, Text } from '@react-email/components'

const baseUrl = env.WEBAPP_URL
const serviceName = 'titochat'

type Props = {
  pathname: string
}
export const LoginVerificationEmail = ({ pathname = `/login/${generateRandomURLString()}` }: Props) => {
  const href = baseUrl + pathname
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section>
            <Img src={`${baseUrl}/email-logo.svg`} width='20' height='20' alt='Stripe' />
            <Heading style={h1}>Welcome back to {serviceName}!👋</Heading>
            <Text style={paragraph}>Please click this button to login with a secure link</Text>
            <Section align='center' style={{ width: '240px' }}>
              <Row>
                <Button style={button} href={href}>
                  Login to titochat.app
                </Button>
              </Row>
            </Section>

            <Text style={caption}>
              If you need to login on a different browser,
              <br /> please copy the link from the button and paste it in the browser.
            </Text>
            <Text style={footer}>If you didn't request this email, you can safely ignore it.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const colors = {
  primary: '#518FE8',
  link: '#518FE8',
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

const h1 = {
  color: '#555',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: '22px',
  fontWeight: 'bold',
  margin: '16px 0',
  padding: '0',
  textAlign: 'center' as const,
} as const

const paragraph = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'center' as const,
} as const

const caption = {
  color: '#5a5d65',

  fontSize: '14px',
  lineHeight: '20px',
  margin: '12px 0 0',
  textAlign: 'center' as const,
} as const

const button = {
  backgroundColor: colors.primary,
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'semibold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  width: '240px',
  padding: '10px 0',
} as const

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '12px',
  margin: '32px 0 0 0',
  textAlign: 'center' as const,
} as const
