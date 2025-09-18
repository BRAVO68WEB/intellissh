# IntelliSSH Web SSH Terminal with AI Assistant

IntelliSSH is a web-based SSH terminal application with AI-powered assistance, built with Vue 3 frontend and Express.js backend. It features real-time terminal access, SFTP file browser, credential management, and LLM integration (OpenAI/Ollama) for intelligent command suggestions.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

- **NEVER CANCEL builds or long-running commands** - Set timeouts to 120+ minutes for safety
- Bootstrap, build, and test the repository:
  - `cd server && npm install` -- takes 10 seconds to complete. NEVER CANCEL.
  - `cd client && npm install` -- takes 3 seconds to complete. NEVER CANCEL. 
  - `cd client && npm run build` -- takes 9 seconds to complete. NEVER CANCEL.
  - `cd server && cp .env.example .env` -- required for development
- Start development servers (requires two terminals):
  - **Server**: `cd server && npm run dev` -- runs on port 3000. NEVER CANCEL.
  - **Client**: `cd client && npm run dev` -- runs on port 8080. NEVER CANCEL.
- **Web Interface**: [http://localhost:8080](http://localhost:8080)
- **API Endpoint**: [http://localhost:3000](http://localhost:3000)

## Validation

- **ALWAYS** manually validate new code by running through complete user scenarios after making changes:
  1. **Login Flow**: Use auto-generated admin credentials (shown in server startup logs)
  2. **SSH Session Creation**: Test creating and configuring SSH sessions
  3. **Settings Configuration**: Verify LLM settings and server configuration work
  4. **Terminal Functionality**: Test SSH connections if making terminal-related changes
- **ALWAYS** run the client build (`npm run build`) before committing changes
- Client linting currently has configuration issues - this is a known limitation, do not spend time fixing it
- Server tests exist but repository has no actual test files - focus on manual validation instead

## Environment Setup Requirements

- **Node.js**: Version 20+ required (both client and server use Node 20)
- **Database**: SQLite (auto-created at `./server/data/webssh.db`)
- **Environment Variables**: Copy `./server/.env.example` to `./server/.env` before starting
- **LLM Integration**: Configure OpenAI API key or Ollama URL in user settings after login

## Key Project Structure

```
intellissh/
├── client/                 # Vue 3 frontend (port 8080)
│   ├── src/views/         # Main application views
│   ├── src/components/    # Reusable Vue components
│   ├── src/stores/        # Pinia state management
│   └── package.json       # Frontend dependencies
├── server/                # Express.js backend (port 3000)
│   ├── src/app.js         # Main server application
│   ├── src/api/           # REST API endpoints
│   ├── src/db/            # Database and migrations
│   ├── src/services/      # Business logic services
│   ├── src/socket/        # WebSocket terminal handling
│   └── package.json       # Backend dependencies
├── Dockerfile             # Production Docker build
├── docker-compose.yml     # Production deployment
└── docker-compose-dev.yml # Development deployment
```

## Critical User Scenarios to Test

**Login and Authentication:**
- Initial admin account is auto-created on first startup (credentials in server logs)
- Username: `admin`, Password: `<generated>` (changes each startup)
- Test user registration, login, logout flows

**SSH Session Management:**
- Create new SSH session with password/key authentication
- Test saved credentials functionality
- Verify session connection and terminal functionality

**Settings Configuration:**
- **User Settings**: LLM provider (OpenAI/Ollama/Custom), API keys, models
- **Admin Settings**: Email SMTP, server configuration, registration controls
- Test settings persistence and immediate application

**LLM Assistant Features:**
- Enable/disable AI assistant in terminal sessions
- Test command suggestions and explanations
- Verify different LLM provider configurations work

## Important Technical Details

- **Database**: SQLite with automatic migrations on startup
- **Authentication**: JWT tokens with bcrypt password hashing
- **Encryption**: Sensitive data (SSH credentials) encrypted with AES
- **WebSocket**: Real-time terminal communication via Socket.IO
- **LLM Integration**: Supports OpenAI API, Ollama, and custom OpenAI-compatible APIs
- **File Management**: SFTP browser integrated into terminal sessions

## Common Development Tasks

### Adding New API Endpoints
- Create route files in `server/src/api/`
- Add authentication middleware where needed
- Test with both authenticated and unauthenticated requests

### Modifying Database Schema
- Add migration files to `server/src/db/`
- Update database.js with new table structures
- Test migration on fresh database

### Frontend Component Development
- Components in `client/src/components/`
- Use Pinia stores for state management
- Follow existing patterns for API calls via axios

### LLM Service Integration
- Service located at `server/src/services/llmService.js`
- Supports multiple providers with consistent interface
- Test with different LLM providers and models

## Known Limitations and Workarounds

- **Client Linting**: ESLint configuration has issues, manual code review required
- **Docker Build**: May fail in some environments due to certificate issues
- **Tests**: Limited test coverage, rely on manual validation
- **Dependencies**: Some deprecated warnings are expected (xterm, eslint versions)

## Emergency Admin Access

If admin access is lost:
1. Stop the server
2. Delete `./server/data/webssh.db`
3. Restart server - new admin account will be created
4. Check server logs for new credentials

## Production Deployment

- Use Docker: `docker run -d -p 8080:3000 -v $(pwd)/data:/app/server/data clusterzx/intellissh:latest`
- Or Docker Compose: `docker-compose up -d`
- Ensure persistent data volume for SQLite database
- Configure environment variables for production security

Always validate changes with real SSH connections and terminal operations when modifying core functionality.