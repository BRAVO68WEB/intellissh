# 📡 IntelliSSH

A secure and user-friendly web app for managing Linux servers with Artifical Intelligence via SSH—right from your browser + SFTP Browser in Terminal.

![Version](https://img.shields.io/badge/version-1.2.0-blue)
![License](https://img.shields.io/badge/license-MIT-blue)

Support this project:<br>
[![Patreon](https://img.shields.io/badge/Patreon-F96854?style=for-the-badge&logo=patreon&logoColor=white)](https://www.patreon.com/c/clusterzx)
[![PayPal](https://img.shields.io/badge/PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://www.paypal.com/paypalme/bech0r)
[![BuyMeACoffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-ffdd00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://www.buymeacoffee.com/clusterzx)
[![Ko-Fi](https://img.shields.io/badge/Ko--fi-F16061?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/clusterzx)

![preview](https://github.com/clusterzx/intellissh/blob/master/preview.gif)

## IMPORTANT INFORMATION REGARDING CREDENTIALS:
The default Admin credentials are shown on first startup in the Docker Logs!
Sample:
```
========================================================
INITIAL ADMIN ACCOUNT CREATED
Username: admin
Password: b99c192f24ba9e4f
Please log in and change this password immediately!
========================================================
```

## 🚀 Overview

IntelliSSH helps system administrators and developers access and control remote Linux servers with:

- Browser-based SSH access (via xterm.js)
- Full SFTP Client in Terminal (Download, Upload (Files/Folder), Create Folder, Delete)
- Centralized and secure session management
- Support for password and key-based auth
- Real-time terminal via WebSocket
- AI-powered assistance (OpenAI or Ollama)
- Responsive UI with dark mode

## 🔐 Key Features

- **Authentication**: Secure login with JWT and bcrypt  
- **Single Sign-On (SSO)**: OpenID Connect (OIDC) support for enterprise authentication
- **Credential Management**: Securely manage credentials for SSH session connections.
- **Two-Factor Authentication (TOTP)**: Enhance security with Time-based One-Time Password verification.
- **SSH Sessions**: Create, edit, test, and connect  
- **Terminal**: Full emulation, copy/paste, resize  
- **AI Assistant**: Context-aware help and suggestions  
- **Security**: Encrypted credential storage, rate limiting  
- **User Management**: Registration control and admin group assignments
- **Deployment**: Local or Docker-based deployment  

## 🧱 Architecture

```
Frontend (Vue) <--> Backend (Express)
        ↕                 ↕
    WebSocket        SSH2, LLM, DB
```

## ⚡ Quick Start

### 🧪 Development

```bash
git clone https://github.com/clusterzx/intellissh
cd intellissh

# Backend
cd server && npm install && cp .env.example .env && npm run dev

# Frontend (new terminal)
cd client && npm install && npm run dev
```

- **Web**: [http://localhost:8080](http://localhost:8080)  
- **API**: [http://localhost:3000](http://localhost:3000)

---

### 🚀 Production (Docker)

#### Quick Setup (Recommended)

```bash
# Clone and setup
git clone https://github.com/clusterzx/intellissh
cd intellissh

# Run setup script to generate secure keys
./setup-docker.sh

# Edit configuration (optional - for OIDC, LLM, etc.)
nano .env

# Start the application
docker-compose up -d
```

#### Manual Setup

#### Run with port mapping (adjust ports as needed)
```bash
docker run -d -p 8080:3000 --name intellissh clusterzx/intellissh:latest
```

#### Run with volume mounts for persistence
```bash
docker run -d \
  -p 8080:3000 \
  -v $(pwd)/data:/app/server/data \
  -e JWT_SECRET=your_jwt_secret_change_in_production \
  -e ENCRYPTION_KEY=your_32_byte_hex_encryption_key_change_in_production \
  --name intellissh \
  clusterzx/intellissh:latest
```

#### Docker Compose

```yaml
services:
  intellissh:
    image: clusterzx/intellissh:latest
    container_name: intellissh
    ports:
      - 8080:3000
    volumes:
      # Mount for persistent backend data (SQLite DB, session info, etc.)
      - ./data:/app/server/data
    environment:
      # Basic Configuration
      - NODE_ENV=production
      - JWT_SECRET=your_jwt_secret_change_in_production
      - ENCRYPTION_KEY=your_32_byte_hex_encryption_key_change_in_production
      
      # OIDC/SSO Configuration (Optional)
      # - OIDC_ISSUER=https://your-oidc-provider.com
      # - OIDC_CLIENT_ID=your_client_id
      # - OIDC_CLIENT_SECRET=your_client_secret
      
      # Registration Control
      # - DISABLED_SIGNUP=true  # Disable local registration when using OIDC
      
      # LLM Configuration (Optional)
      # - LLM_PROVIDER=openai
      # - OPENAI_API_KEY=your_openai_api_key
      # - OPENAI_MODEL=gpt-3.5-turbo
    restart: unless-stopped
```

For easier configuration management, copy `.env.docker.example` to `.env` and configure your values:

```bash
cp .env.docker.example .env
# Edit .env with your configuration
docker-compose up -d
```
```
---

## 🔑 OIDC/SSO Configuration

IntelliSSH supports OpenID Connect (OIDC) for enterprise single sign-on integration.

### Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `OIDC_ISSUER` | OIDC provider issuer URL | Yes | `https://accounts.google.com` |
| `OIDC_CLIENT_ID` | OIDC client identifier | Yes | `your-client-id` |
| `OIDC_CLIENT_SECRET` | OIDC client secret | Yes | `your-client-secret` |
| `DISABLED_SIGNUP` | Disable local user registration | No | `true` or `false` |

### Setup Examples

#### Google OIDC
```bash
OIDC_ISSUER=https://accounts.google.com
OIDC_CLIENT_ID=your-google-client-id
OIDC_CLIENT_SECRET=your-google-client-secret
DISABLED_SIGNUP=true
```

#### Azure AD / Entra ID
```bash
OIDC_ISSUER=https://login.microsoftonline.com/your-tenant-id/v2.0
OIDC_CLIENT_ID=your-azure-client-id
OIDC_CLIENT_SECRET=your-azure-client-secret
DISABLED_SIGNUP=true
```

#### Keycloak
```bash
OIDC_ISSUER=https://your-keycloak.com/auth/realms/your-realm
OIDC_CLIENT_ID=intellissh-client
OIDC_CLIENT_SECRET=your-keycloak-secret
DISABLED_SIGNUP=true
```

### OIDC Troubleshooting

**Common Issues:**

1. **OIDC login not appearing**: Check that all required environment variables are set (`OIDC_ISSUER`, `OIDC_CLIENT_ID`, `OIDC_CLIENT_SECRET`)

2. **Callback URL mismatch**: Ensure your OIDC provider is configured with the correct callback URL: `https://your-domain.com/api/auth/oidc/callback`

3. **Users can't login after OIDC setup**: If `DISABLED_SIGNUP=true`, existing local users can still login with username/password

**Debug Steps:**
```bash
# Check OIDC configuration endpoint
curl https://your-domain.com/api/auth/oidc/config

# Check server logs for OIDC initialization messages
docker logs intellissh | grep -i oidc
```

---

## 📚 Documentation

- **API**: REST endpoints for auth, sessions, and settings  
- **WebSocket**: Real-time terminal and LLM communication  
- **Usage**: Add SSH sessions, connect, manage profile, enable AI assistant  

## 🛠 Tech Stack

- Vue 3 + TailwindCSS  
- Express.js + SQLite  
- SSH2, Socket.IO, xterm.js  
- OpenAI / Ollama for AI  
- Docker for deployment  

## 📌 Roadmap Highlights

- SFTP file browser ✅
- Activity logging  ⏳
- Multi-user session sharing  ⏳
- Bulk operations & SSH key manager  ⏳
- i18n and mobile apps  ⏳

## 🤝 Contributing

We welcome contributions! Please fork the repo, create a branch, and submit a PR.

## 🛡️ License

MIT License — see [LICENSE](./LICENSE) for details.

---

> **Note**: IntelliSSH handles SSH credentials—secure your deployment appropriately.
