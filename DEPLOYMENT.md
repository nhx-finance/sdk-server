# Deployment Guide

### Using Docker Compose

1. **Prepare your environment file:**

   Create a `.env` file in the project root with all required values:

   ```bash
   # .env
   PORT=3001
   ACCOUNT_ID=your_account_id
   KESY_TOKEN_ID=your_token_id
   KESY_TOPIC_ID=your_topic_id
   MULTISIG_ACCOUNT_ID=your_multisig_account_id
   FACTORY_ADDRESS=your_factory_address
   RESOLVER_ADDRESS=your_resolver_address
   ADMIN_ID=your_admin_id (optional)
   GCP_PROJECT_ID=your_gcp_project_id
   GOOGLE_APPLICATION_CREDENTIALS_JSON=your_google_application_credentials_json
   ```

2. **Build and start the container:**

   ```bash
   docker compose up -d --build
   ```

3. **View logs:**

   ```bash
   docker compose logs -f
   ```

4. **Stop the container:**

   ```bash
   docker compose down
   ```
