// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'uxbdu7w5si'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`
export const webSocketEndpoint = 'wss://c5yhjzz6a8.execute-api.us-east-1.amazonaws.com/dev'

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map. For example:
  // domain: 'dev-nd9990-p4.us.auth0.com',
  domain: 'dev-4-004utl.us.auth0.com',            // Auth0 domain
  clientId: 'exTU9n1U7faD4t1zLdIQt9a51O8zNQfv',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
