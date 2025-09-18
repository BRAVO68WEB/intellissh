const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const credentialService = require('../services/credentialService');
const sshKeyService = require('../services/sshKeyService');

// Create a new credential
router.post('/', authenticateToken, async (req, res) => {
  const { name, type, username, password, privateKey, passphrase } = req.body;
  const userId = req.user.id;

  if (!name || !type) {
    return res.status(400).json({ message: 'Name and type are required.' });
  }

  if (type === credentialService.CREDENTIAL_TYPES.PASSWORD && !password) {
    return res.status(400).json({ message: 'Password is required for password type credentials.' });
  }

  if (type === credentialService.CREDENTIAL_TYPES.PRIVATE_KEY && !privateKey) {
    return res.status(400).json({ message: 'Private key is required for private key type credentials.' });
  }

  try {
    const credential = await credentialService.createCredential(
      userId, name, type, username, password, privateKey, passphrase
    );
    res.status(201).json(credential);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all credentials for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const credentials = await credentialService.getCredentialsByUserId(userId);
    res.json(credentials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single credential by ID (for editing/viewing details)
router.get('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  try {
    const credential = await credentialService.getCredentialById(id, userId);
    if (!credential) {
      return res.status(404).json({ message: 'Credential not found.' });
    }
    res.json(credential);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a credential
router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, type, username, password, privateKey, passphrase } = req.body;
  const userId = req.user.id;

  if (!name || !type) {
    return res.status(400).json({ message: 'Name and type are required.' });
  }

  try {
    const updatedCredential = await credentialService.updateCredential(
      id, userId, name, type, username, password, privateKey, passphrase
    );
    res.json(updatedCredential);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a credential
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  try {
    await credentialService.deleteCredential(id, userId);
    res.status(204).send(); // No content on successful deletion
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Bulk delete credentials
router.delete('/bulk/delete', authenticateToken, async (req, res) => {
  const { credentialIds } = req.body;
  const userId = req.user.id;

  if (!credentialIds || !Array.isArray(credentialIds) || credentialIds.length === 0) {
    return res.status(400).json({ message: 'credentialIds array is required and must not be empty.' });
  }

  try {
    const results = [];
    const errors = [];

    for (const credentialId of credentialIds) {
      try {
        await credentialService.deleteCredential(credentialId, userId);
        results.push({ id: credentialId, status: 'deleted' });
      } catch (error) {
        errors.push({ id: credentialId, error: error.message });
      }
    }

    res.json({
      success: true,
      deleted: results.length,
      failed: errors.length,
      results,
      errors
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Bulk create credentials
router.post('/bulk/create', authenticateToken, async (req, res) => {
  const { credentials } = req.body;
  const userId = req.user.id;

  if (!credentials || !Array.isArray(credentials) || credentials.length === 0) {
    return res.status(400).json({ message: 'credentials array is required and must not be empty.' });
  }

  try {
    const results = [];
    const errors = [];

    for (const cred of credentials) {
      try {
        const { name, type, username, password, privateKey, passphrase } = cred;
        
        if (!name || !type) {
          errors.push({ credential: cred, error: 'Name and type are required.' });
          continue;
        }

        if (type === credentialService.CREDENTIAL_TYPES.PASSWORD && !password) {
          errors.push({ credential: cred, error: 'Password is required for password type credentials.' });
          continue;
        }

        if (type === credentialService.CREDENTIAL_TYPES.PRIVATE_KEY && !privateKey) {
          errors.push({ credential: cred, error: 'Private key is required for private key type credentials.' });
          continue;
        }

        const credential = await credentialService.createCredential(
          userId, name, type, username, password, privateKey, passphrase
        );
        results.push({ credential, status: 'created' });
      } catch (error) {
        errors.push({ credential: cred, error: error.message });
      }
    }

    res.json({
      success: true,
      created: results.length,
      failed: errors.length,
      results,
      errors
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate SSH key pair
router.post('/generate-key', authenticateToken, async (req, res) => {
  const { keyType = 'rsa', keySize, comment, passphrase, name, username } = req.body;
  const userId = req.user.id;

  if (!name) {
    return res.status(400).json({ message: 'Name is required for the generated key.' });
  }

  try {
    // Check if ssh-keygen is available, otherwise use fallback
    const hasSSHKeygen = await sshKeyService.isSSHKeygenAvailable();

    console.log("hasSSHKeygen:", hasSSHKeygen)
    
    let keyPair;
    if (hasSSHKeygen) {
      keyPair = await sshKeyService.generateKeyPair(keyType, keySize, comment, passphrase);
    } else {
      // Use Node.js crypto fallback (limited functionality)
      keyPair = await sshKeyService.generateKeyPairFallback(keyType, keySize, passphrase);
    }

    // Save the generated key as a credential
    const credential = await credentialService.createCredential(
      userId,
      name,
      credentialService.CREDENTIAL_TYPES.PRIVATE_KEY,
      username || '',
      null, // no password for key-based auth
      keyPair.privateKey,
      passphrase || null
    );

    res.json({
      success: true,
      credential,
      keyInfo: {
        keyType: keyPair.keyType,
        keySize: keyPair.keySize,
        fingerprint: keyPair.fingerprint,
        hasPassphrase: keyPair.hasPassphrase,
        comment: keyPair.comment
      },
      publicKey: keyPair.publicKey
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Validate SSH key
router.post('/validate-key', authenticateToken, async (req, res) => {
  const { privateKey, publicKey } = req.body;

  try {
    const result = {
      privateKey: { valid: false, error: null },
      publicKey: { valid: false, error: null, info: null }
    };

    // Validate private key
    if (privateKey) {
      try {
        result.privateKey.valid = sshKeyService.validatePrivateKey(privateKey);
        if (!result.privateKey.valid) {
          result.privateKey.error = 'Invalid private key format';
        }
      } catch (error) {
        result.privateKey.error = error.message;
      }
    }

    // Parse and validate public key
    if (publicKey) {
      try {
        result.publicKey.info = sshKeyService.parsePublicKey(publicKey);
        result.publicKey.valid = true;
      } catch (error) {
        result.publicKey.error = error.message;
      }
    }

    res.json({
      success: true,
      validation: result
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Export credentials (for backup/migration)
router.get('/export', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  
  try {
    const credentials = await credentialService.getCredentialsByUserId(userId);
    
    // Remove sensitive data for export (user should re-enter passwords/keys)
    const exportData = credentials.map(cred => ({
      name: cred.name,
      type: cred.type,
      username: cred.username,
      created_at: cred.created_at,
      // Don't export actual passwords/keys for security
      has_password: !!cred.password,
      has_private_key: !!cred.private_key,
      has_passphrase: !!cred.passphrase
    }));

    res.json({
      success: true,
      export_date: new Date().toISOString(),
      user_id: userId,
      credentials: exportData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
