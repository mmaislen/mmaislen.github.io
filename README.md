# 333 Consulting

Website for 333 Consulting, Michelle Maislen's fractional AI product leadership practice.

Live at https://333consulting.com (served by GitHub Pages).

## Publish
1. Push these files to the `main` branch of this repo.
2. In the repo: Settings -> Pages -> Source: "Deploy from a branch", Branch: `main`, folder `/ (root)`.
3. Custom domain: `333consulting.com` (the `CNAME` file sets this). Turn on "Enforce HTTPS" once the certificate is issued.
4. At your domain registrar, add DNS records:
   - `A` records for `@` pointing to 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
   - `CNAME` record for `www` pointing to `<your-github-username>.github.io`
