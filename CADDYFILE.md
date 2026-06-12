# KoalaShip Caddy Configuration

This serves the static Vite build and proxies map resources through the KoalaShip
origin. Replace the domain and root path if required.

```caddyfile
ship.koalastuff.net {
    root * /var/www/koalaship/dist
    encode zstd gzip

    handle /api/route/* {
        uri strip_prefix /api/route
        rewrite * /route/v1/driving{uri}
        reverse_proxy https://router.project-osrm.org {
            header_up Host {upstream_hostport}
            header_up -X-Forwarded-For
            header_up -X-Real-IP
        }
        header Cache-Control "private, max-age=300"
    }

    handle /api/tiles/light/* {
        uri strip_prefix /api/tiles/light
        rewrite * /light_all{uri}
        reverse_proxy https://a.basemaps.cartocdn.com {
            header_up Host {upstream_hostport}
            header_up -X-Forwarded-For
            header_up -X-Real-IP
        }
        header Cache-Control "public, max-age=86400"
    }

    handle /api/tiles/dark/* {
        uri strip_prefix /api/tiles/dark
        rewrite * /dark_all{uri}
        reverse_proxy https://a.basemaps.cartocdn.com {
            header_up Host {upstream_hostport}
            header_up -X-Forwarded-For
            header_up -X-Real-IP
        }
        header Cache-Control "public, max-age=86400"
    }

    @immutable path /assets/* /fonts/* /icons/*
    header @immutable Cache-Control "public, max-age=31536000, immutable"

    @service_worker path /sw.js
    header @service_worker Cache-Control "no-cache, no-store, must-revalidate"

    header {
        Referrer-Policy "strict-origin-when-cross-origin"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
        Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://*.basemaps.cartocdn.com; font-src 'self'; connect-src 'self'; worker-src 'self'; manifest-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'none'"
    }

    try_files {path} /index.html
    file_server

    log {
        output file /var/log/caddy/koalaship-access.log {
            roll_size 10MiB
            roll_keep_for 168h
        }
    }
}
```

The CARTO host in `img-src` is a temporary compatibility allowance for an old
frontend bundle. Current releases load tiles through `/api/tiles/*`, so the
allowance can be removed once all browser and CDN caches have expired.

Validate and reload:

```bash
caddy validate --config /etc/caddy/Caddyfile
systemctl reload caddy
```
