const OAuthClient = require('intuit-oauth');

// Initialize OAuth Client
const oauthClient = new OAuthClient({
    clientId: process.env.INTUIT_CLIENT_ID,
    clientSecret: process.env.INTUIT_CLIENT_SECRET,
    environment: process.env.INTUIT_ENVIRONMENT,  // 'sandbox' or 'production'
    redirectUri: process.env.INTUIT_REDIRECT_URI,
});

/**
 * Get the authorization URL to redirect users to Intuit's OAuth consent screen.
 */
const getAuthUri = () => {
    return oauthClient.authorizeUri({
        scope: [OAuthClient.scopes.Accounting], // Add additional scopes if needed
        state: 'random_state_string',
    });
};

/**
 * Handle the OAuth callback and exchange the authorization code for an access token.
 */
const handleCallback = async (url) => {
    try {
        const token = await oauthClient.createToken(url);
        return token;  // Return the token to be stored or used
    } catch (error) {
        throw new Error(`OAuth callback error: ${error.message}`);
    }
};

/**
 * Revoke the access token when necessary.
 */
const revokeToken = async (accessToken) => {
    try {
        const response = await oauthClient.revoke(accessToken);
        return response;
    } catch (error) {
        throw new Error(`Revoke token error: ${error.message}`);
    }
};

/**
 * Refresh the access token if it expires.
 */
const refreshAccessToken = async () => {
    try {
        return await oauthClient.refresh();  // Updated access and refresh tokens
    } catch (error) {
        throw new Error(`Token refresh error: ${error.message}`);
    }
};

// Export the functions for use in other files
module.exports = {
    getAuthUri,
    handleCallback,
    revokeToken,
    refreshAccessToken,
};
