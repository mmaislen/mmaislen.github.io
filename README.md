# 333 Consulting

Website for 333 Consulting, Michelle Maislen's fractional AI product leadership practice.

Live at https://mmaislen.github.io (served by GitHub Pages). Custom domain 333consulting.com to be added later.

## Publish
1. Push these files to the `main` branch of this repo.
2. In the repo: Settings -> Pages -> Source: "Deploy from a branch", Branch: `main`, folder `/ (root)`.
3. When the domain is registered: add a `CNAME` file containing `333consulting.com`, set it as the custom domain in Settings -> Pages, then turn on "Enforce HTTPS" once the certificate is issued.
4. At your domain registrar, add DNS records:
   - `A` records for `@` pointing to 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
   - `CNAME` record for `www` pointing to `<your-github-username>.github.io`
