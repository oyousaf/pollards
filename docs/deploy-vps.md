# Deploying Pollards to the VPS

Pollards runs as a PM2 process (`pollards`, port **3010**) from `/apps/pollards`, next to
the other apps in the shared `ecosystem.config.cjs`. PostgreSQL runs locally on the VPS
and listens on loopback only. Email goes out through Resend; SMS (Twilio) is optional.

This is a fresh start — there is no data to migrate from the old Appwrite test project.

## 1. Database (once)

Install PostgreSQL if it isn't already, then create a database and least-privilege login:

```bash
sudo -u postgres psql <<'SQL'
CREATE ROLE pollards LOGIN PASSWORD 'generate-a-long-random-password';
CREATE DATABASE pollards OWNER pollards;
REVOKE ALL ON DATABASE pollards FROM PUBLIC;
SQL
```

Keep port 5432 closed in the firewall; the app connects over `127.0.0.1`.

## 2. Files and config (once)

```bash
# ID document uploads live outside the app folder so redeploys never touch them.
sudo mkdir -p /var/lib/pollards/uploads
sudo chown -R "$USER": /var/lib/pollards && chmod 700 /var/lib/pollards/uploads

git clone https://github.com/oyousaf/pollards.git /apps/pollards
cd /apps/pollards
cp .env.example .env && chmod 600 .env   # then fill it in
```

Required in `.env`: `DATABASE_URL`, `ADMIN_PASSKEY` (4 digits), `SESSION_SECRET`
(`openssl rand -base64 48`), `RESEND_API_KEY`, `EMAIL_FROM` (on a domain verified in
Resend), `UPLOAD_DIR=/var/lib/pollards/uploads`, `NEXT_PUBLIC_SITE_URL`.

## 3. Build, migrate, start

```bash
cd /apps/pollards
npm ci
npm run db:migrate          # applies db/migrations/*.sql, records checksums
npm run build
pm2 start /apps/ecosystem.config.cjs --only pollards
pm2 save
curl -s http://127.0.0.1:3010/api/health   # → {"status":"ok"}
```

## 4. Reverse proxy + TLS

Point the domain's DNS at the VPS, then proxy it to port 3010 the same way as the other
apps. Uploads are up to 5 MB, so raise the body limit. Example for nginx:

```nginx
server {
  server_name pollards.info www.pollards.info;
  client_max_body_size 8m;

  location / {
    proxy_pass http://127.0.0.1:3010;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```

Then `sudo certbot --nginx -d pollards.info -d www.pollards.info`. HTTPS is required:
session cookies are `Secure` in production. `X-Forwarded-For` matters too — the login
rate limits key on the client IP.

## Redeploying

```bash
cd /apps/pollards
git pull
npm ci
npm run db:migrate
npm run build
pm2 reload pollards
```

Never edit a migration that has been applied; add `db/migrations/002_*.sql` instead.
The runner refuses to continue if an applied file's checksum changes.

## Backups

The database and `/var/lib/pollards/uploads` hold patient records, which opticians are
required to keep. Back up both, encrypted, to storage outside the VPS, and test restores:

```bash
# e.g. nightly via cron
pg_dump -Fc -d pollards -f /var/backups/pollards/db-$(date +%F).dump
tar -czf /var/backups/pollards/uploads-$(date +%F).tgz -C /var/lib/pollards uploads
```

## Notes

- Rate limits (logins, code requests) are in memory, per process. That's correct for a
  single PM2 fork; switch to a shared store before running multiple instances.
- Double booking is prevented by the `appointments_active_slot` unique index, not just
  the UI, so it holds even if two patients submit at the same moment.
