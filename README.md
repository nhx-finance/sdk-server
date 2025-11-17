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

### Environment Variables

The server uses the following environment variables:

- PORT: The port to listen on
- ACCOUNT_ID: The account ID to use for the server
- PRIVATE_KEY: The private key to use for the server
- KESY_TOKEN_ID: The token ID to use for the server
- MULTISIG_ACCOUNT_ID: The multisig account ID to use for the server
- FACTORY_ADDRESS: The factory address to use for the server
- RESOLVER_ADDRESS: The resolver address to use for the server
- ADMIN_ID: The admin account ID to use for the server
- ADMIN_PRIVATE_KEY: The admin private key to use for the server
