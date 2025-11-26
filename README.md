## KESY Stablecoin Studio Server

This is a server for the KESY Stablecoin Studio. It is used to interact with the KESY Stablecoin Studio.

### Prerequisites

- Node.js 18.x or higher
- npm 10.x or higher
- Docker 24.x or higher

### Installation

1. Clone the repository

```bash
git clone https://github.com/nhx-finance/sdk-server.git
```

2. Install dependencies

```bash
npm install
```

3. Start the server

```bash
npm start
```

### Deployment

1. Build the Docker image

```bash
docker build -t nhx-sdk-server .
```

2. Run the Docker container

```bash
docker run -d -p 3001:3001 nhx-sdk-server
```

### API Authentication

This server uses API key authentication to secure protected endpoints. The API key is stored securely in **Azure Key Vault** and is only accessible to authenticated servers that have been granted access.

#### Public Endpoints

The following endpoints are publicly accessible and do not require authentication:

- `GET /api/token` - Get token information
- `GET /health` - Health check endpoint

#### Protected Endpoints

All other API endpoints require API key authentication. These endpoints can only be called by authenticated servers that have the API key stored in Azure Key Vault:

- `POST /api/token/transfer` - Transfer tokens
- `GET /api/balance/*` - Balance-related endpoints
- `POST /api/mint/*` - Minting endpoints
- `POST /api/reserve/*` - Reserve-related endpoints
- `GET /api/role/*` - Role management endpoints
- `POST /api/role/*` - Role management endpoints

#### Network-Level Security

In addition to API key authentication, the server is protected by network-level security measures on the VPS:

- **Firewall Configuration**: A firewall is configured on the VPS to restrict access to the port on which this server is running. Only whitelisted IP addresses are allowed to connect to protected endpoints.

- **IP Restrictions**: IP address restrictions are enforced at the firewall level, ensuring that only authorized servers with approved IP addresses can reach the protected API endpoints. This provides an additional layer of security beyond API key authentication.

- **Defense in Depth**: This multi-layered security approach combines:
  1. Network-level IP filtering (firewall)
  2. Application-level API key authentication
  3. Secure key storage in Azure Key Vault

This ensures that even if an API key were compromised, unauthorized IP addresses would still be blocked by the firewall, providing robust protection for sensitive operations.

### Environment Variables

The server uses the following environment variables:

- PORT: The port to listen on
- API_KEY: The API key for authenticating requests (stored in Azure Key Vault in production)
- ACCOUNT_ID: The account ID to use for the server
- PRIVATE_KEY: The private key to use for the server
- KESY_TOKEN_ID: The token ID to use for the server
- MULTISIG_ACCOUNT_ID: The multisig account ID to use for the server
- FACTORY_ADDRESS: The factory address to use for the server
- RESOLVER_ADDRESS: The resolver address to use for the server
- ADMIN_ID: The admin account ID to use for the server
- ADMIN_PRIVATE_KEY: The admin private key to use for the server
