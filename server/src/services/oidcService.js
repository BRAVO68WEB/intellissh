const passport = require('passport');
const { Strategy: OpenIDConnectStrategy } = require('passport-openidconnect');
const db = require('../db/database');
const settingsService = require('./settingsService');

class OIDCService {
  constructor() {
    this.isConfigured = false;
    this.strategy = null;
  }

  async init() {
    try {
      // Get OIDC settings from database/environment
      const oidcIssuer = process.env.OIDC_ISSUER;
      const oidcClientId = process.env.OIDC_CLIENT_ID;
      const oidcClientSecret = process.env.OIDC_CLIENT_SECRET;

      if (!oidcIssuer || !oidcClientId || !oidcClientSecret) {
        console.log('OIDC configuration not found. OIDC authentication will not be available.');
        return;
      }

      // Configure Passport OIDC strategy
      this.strategy = new OpenIDConnectStrategy({
        issuer: oidcIssuer,
        clientID: oidcClientId,
        clientSecret: oidcClientSecret,
        callbackURL: '/api/auth/oidc/callback',
        scope: ['openid', 'profile', 'email'],
        skipUserProfile: false,
        authorizationURL: `${oidcIssuer}/auth`,
        tokenURL: `${oidcIssuer}/token`,
        userInfoURL: `${oidcIssuer}/me`,
      }, this.handleOIDCAuth.bind(this));

      passport.use('oidc', this.strategy);

      // Configure passport serialization
      passport.serializeUser((user, done) => {
        done(null, user.id);
      });

      passport.deserializeUser(async (id, done) => {
        try {
          const user = await db.get('SELECT * FROM users WHERE id = ?', [id]);
          done(null, user);
        } catch (error) {
          done(error, null);
        }
      });

      this.isConfigured = true;
      console.log('OIDC service initialized successfully');

    } catch (error) {
      console.error('OIDC service initialization error:', error.message);
      this.isConfigured = false;
    }
  }

  async handleOIDCAuth(issuer, profile, done) {
    try {
      console.log('OIDC authentication callback received');
      console.log('Profile:', JSON.stringify(profile, null, 2));

      const { id: externalId, displayName, emails, _json } = profile;

      const email = emails && emails.length > 0 ? emails[0].value : null;
      const username = displayName || email || externalId;

      if (!username) {
        return done(new Error('Unable to extract username from OIDC profile'), null);
      }

      // Check if user already exists by external ID or email
      let user = await db.get(
        'SELECT * FROM users WHERE oidc_id = ? OR (email IS NOT NULL AND email = ?)',
        [externalId, email]
      );

      let isAdmin = false;

      if (user) {
        // Update existing user
        const newRole = isAdmin ? 'admin' : user.role; // Only promote to admin, don't demote
        await db.run(
          'UPDATE users SET oidc_id = ?, email = ?, role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [externalId, email, newRole, user.id]
        );

        user.role = newRole;
        user.email = email;
        user.oidc_id = externalId;

        console.log(`Existing user '${user.username}' logged in via OIDC${isAdmin ? ' with admin privileges' : ''}`);
      } else {
        // Create new user
        const role = isAdmin ? 'admin' : 'user';
        
        const result = await db.run(
          'INSERT INTO users (username, password, email, oidc_id, role, created_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
          [username, '', email, externalId, role] // Empty password for OIDC users
        );

        user = {
          id: result.id,
          username,
          email,
          oidc_id: externalId,
          role,
          created_at: new Date().toISOString()
        };

        console.log(`New user '${username}' created via OIDC with role '${role}'`);
      }

      return done(null, user);

    } catch (error) {
      console.error('OIDC authentication error:', error.message);
      return done(error, null);
    }
  }

  isEnabled() {
    return this.isConfigured && 
           process.env.OIDC_ISSUER && 
           process.env.OIDC_CLIENT_ID && 
           process.env.OIDC_CLIENT_SECRET;
  }

  getAuthURL() {
    if (!this.isEnabled()) {
      throw new Error('OIDC is not configured');
    }
    return '/api/auth/oidc/login';
  }
}

module.exports = new OIDCService();