const { OAuth2Client } = require('google-auth-library');
const { google } = require('googleapis');
const { createServer } = require('http');
const url = require('url');
const open = require('open');
const mybusinessaccountmanagement = require('@googleapis/mybusinessaccountmanagement');

const keys = require('./client_secrets.json');

const getBusinesses = async (authClient) => {
  google.options({ auth: authClient });

  const manager = new mybusinessaccountmanagement.VERSIONS.v1({ auth: authClient });

  console.log(manager.accounts);
  const locations = await manager.accounts.admins.list({
    parent: 'accounts/personal'
  });

  console.log(locations);
};

const getAuthenticatedClient = async () => {
  const authClient = new OAuth2Client(
    keys.installed.client_id,
    keys.installed.client_secret,
    keys.installed.redirect_uris[0]
  );

  const authUrl = authClient.generateAuthUrl({
    access_type: 'offline',
    scope: 'https://www.googleapis.com/auth/business.manage'
  });

  const server = createServer(async (req, res) => {
    if (req.url.indexOf('/auth') > -1) {
      const qs = new url.URL(req.url, 'http://localhost:3000').searchParams;
      const code = qs.get('code');
      console.log('code is ', code);

      res.end('Authentication Successful! Return to the console');
      //server.destroy();

      const r = await authClient.getToken(code);
      authClient.setCredentials(r.tokens);

      console.log('token set');
      await getBusinesses(authClient);
    }
  })
  .listen(3000, async () => {
    const cp = await open(authUrl, { wait: false })
    cp.unref();
  });
};

(async () => {
  try {
    console.log(mybusinessaccountmanagement);
    const authClient = await getAuthenticatedClient();
  } catch (error) {
    console.error(error);
  }
})();
