# Security Policy

## Supported Version

Security fixes are applied to the latest version on the `master` branch.

## Reporting a Vulnerability

Please do not publish exploitable security or privacy issues in a public issue.
Contact the repository owner privately through the contact method listed in the
legal notice at [ship.koalastuff.net](https://ship.koalastuff.net).

Include:

- A concise description of the issue
- Reproduction steps
- Affected browser or deployment environment
- The potential impact
- A suggested fix, if available

Avoid submitting real personal data, precise home coordinates, credentials or
other secrets with the report.

## Security Model

KoalaShip is a static, local-first web application:

- There is no user-account backend.
- Game state is stored in browser `localStorage`.
- No payment information is processed.
- Route and map requests use same-origin reverse proxies.
- Imported save files are treated as untrusted local data and validated before
  being applied.

Deployments should use HTTPS, a restrictive Content Security Policy and
non-cacheable service-worker responses.
