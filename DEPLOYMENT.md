# Deployment Guide

### Using Docker Compose

1. **Prepare your environment file:**

   - Copy `.local.env` and fill in all required values
   - Ensure the file is in the project root

2. **Build and start the container:**

   ```bash
   docker-compose up -d --build
   ```

3. **View logs:**

   ```bash
   docker-compose logs -f
   ```

4. **Stop the container:**
   ```bash
   docker-compose down
   ```
