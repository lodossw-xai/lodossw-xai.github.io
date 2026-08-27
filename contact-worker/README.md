# XAIKOREA contact API

Cloudflare Worker endpoint used by both the GitHub Pages site and the team
preview site.

## Routes

- `POST /contact`
- `OPTIONS /contact`

The Worker validates the request origin, honeypot and elapsed-time signals,
input limits, and a single-use Cloudflare Turnstile token before sending the
inquiry through the Google Workspace Gmail API. It does not persist the inquiry
body.

## Local setup

1. Copy `.dev.vars.example` to `.dev.vars`.
2. Add a Google OAuth client ID, client secret, and offline refresh token for
   the Workspace sender mailbox.
3. Run `npm run contact:dev`.

Cloudflare's public test site key and secret are used only for local
development. Never configure those test credentials in a production build.

## Production secrets

Set these with `wrangler secret put` or in the Cloudflare dashboard:

- `TURNSTILE_SECRET_KEY`
- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_SECRET`
- `GOOGLE_OAUTH_REFRESH_TOKEN`

The production Turnstile widget must authorize the official site, apex domain,
and team preview hostnames.

## Google Workspace setup

1. Enable the Gmail API in a Google Cloud project.
2. Configure the Google Auth Platform app for the Workspace organization and
   use the **Internal** audience.
3. Add only this scope: `https://www.googleapis.com/auth/gmail.send`.
4. Create a Web application OAuth client and authorize this redirect URI:
   `https://developers.google.com/oauthplayground`.
5. In Google OAuth 2.0 Playground, enable **Use your own OAuth credentials**,
   request the `gmail.send` scope with `access_type=offline`, authorize the
   actual sender mailbox, and exchange the code for a refresh token.
6. Store the OAuth client ID, client secret, and refresh token only as
   Cloudflare Worker secrets. The Worker obtains short-lived access tokens at
   request time and never returns the credentials to the browser.

Register each value interactively so it does not appear in shell history:

```powershell
npx wrangler secret put GOOGLE_OAUTH_CLIENT_ID --config contact-worker/wrangler.jsonc
npx wrangler secret put GOOGLE_OAUTH_CLIENT_SECRET --config contact-worker/wrangler.jsonc
npx wrangler secret put GOOGLE_OAUTH_REFRESH_TOKEN --config contact-worker/wrangler.jsonc
```

`GMAIL_SENDER_ADDRESS` must be the same licensed Workspace mailbox that granted
offline access, or one of its configured Gmail send-as aliases. Revoke the
refresh token and rotate the client secret immediately if either value is ever
exposed.
