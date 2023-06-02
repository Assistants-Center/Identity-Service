# Assistants' Center Identity Client Module

## Installation

```bash
npm install @assistants-center/identity-client
```

## Usage

```typescript
import { IdentityClient } from '@assistants-center/identity-client';

const identityClient = new IdentityClient({
    clientId: "client_id",
    clientSecret: "client_secret",
    redirectUri: "https://example.com/redirect",
    scopes: ["account:read"],
    identityUrl: "https://identity.assistantscenter.com"
});

// Get the URL to redirect the user to
const url = identityClient.getUrl();
// https://identity.assistantscenter.com/api/auth/authorize?client_id=client_id&redirect_uri=https://example.com/redirect&scope=admin%20account%3Aread

// Get the access token
const token = await identityClient.getAccessToken("code");

// Get the user info
const user = await identityClient.getUserInfo(token.access_token);
```

## Documentation

Soon to come.

## Requesting a Client

To request your own Client, please contact us at: [contact@assistantscenter.com](mailto:contact@assistantscenter.com)

## License

This project falls under the [MIT](https://choosealicense.com/licenses/mit/) license.