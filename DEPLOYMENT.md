# Panduan Deployment Marriage Knowledge Challenge

## Deployment ke Vercel (Recommended)

### 1. Push ke GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/username/marriage-quiz.git
git push -u origin main
```

### 2. Import di Vercel

1. Buka [vercel.com](https://vercel.com) dan login dengan GitHub
2. Klik **Add New...** > **Project**
3. Import repository `marriage-quiz`
4. Framework Preset: **Vite** (auto-detected)
5. Build Command: `npm run build`
6. Output Directory: `dist`
7. Klik **Environment Variables** dan tambahkan:
   - `VITE_SUPABASE_URL` = `https://your-project.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `your-anon-key`
8. Klik **Deploy**

### 3. Konfigurasi Supabase untuk Production

1. Di Supabase Dashboard > Authentication > URL Configuration
2. Tambahkan Vercel URL ke **Site URL** dan **Redirect URLs**:
   - `https://your-app.vercel.app`
   - `https://your-app.vercel.app/**`
3. Save

### 4. Custom Domain (Optional)

1. Di Vercel Project > Settings > Domains
2. Tambahkan domain custom
3. Update DNS records sesuai instruksi
4. Update Supabase Site URL ke domain custom

## Deployment ke GitHub Pages

### 1. Update vite.config.js

```js
export default defineConfig({
  plugins: [react()],
  base: '/marriage-quiz/',  // Repository name
  build: {
    outDir: 'dist',
  },
})
```

### 2. GitHub Actions Workflow

Buat file `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### 3. Setup GitHub Secrets

1. Repository > Settings > Secrets and variables > Actions
2. Tambahkan secrets:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### 4. Enable GitHub Pages

1. Repository > Settings > Pages
2. Source: **Deploy from a branch**
3. Branch: `gh-pages` / `(root)`
4. Save

### 5. Update Supabase URLs

Tambahkan GitHub Pages URL ke Supabase Auth > URL Configuration:
- `https://username.github.io/marriage-quiz`
- `https://username.github.io/marriage-quiz/**`

## Deployment ke Netlify

### 1. Connect Repository

1. Buka [netlify.com](https://netlify.com)
2. **Add new site** > **Import an existing project**
3. Connect GitHub/GitLab/Bitbucket
4. Pilih repository

### 2. Build Settings

- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions` (jika menggunakan Netlify Functions)

### 3. Environment Variables

Site settings > Environment variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### 4. Redirect Rules (Optional)

Buat file `public/_redirects`:
```
/*  /index.html  200
```

## Environment Variables Checklist

| Variable | Required | Description |
|----------|----------|-------------|
| VITE_SUPABASE_URL | Ya | Project URL dari Supabase |
| VITE_SUPABASE_ANON_KEY | Ya | Anon/Public Key dari Supabase |

## Post-Deployment Verification

- [ ] Halaman beranda load dengan benar
- [ ] Kuis bisa dimulai dan diselesaikan
- [ ] Timer berfungsi
- [ ] Data masuk ke Supabase (cek Table Editor)
- [ ] Admin login berfungsi
- [ ] Dashboard menampilkan data real-time
- [ ] Export CSV berfungsi
- [ ] Mobile responsive
- [ ] Offline mode test
- [ ] HTTPS aktif
- [ ] Custom domain (jika dipakai) resolve dengan benar

## Monitoring & Maintenance

### Supabase Monitoring
- Dashboard > Logs > API Requests
- Dashboard > Database > Query Performance
- Dashboard > Auth > Users

### Vercel/Netlify Analytics
- Enable Web Analytics di project settings
- Monitor Core Web Vitals

### Backup Strategy
- Supabase: Automatic daily backups (Pro plan)
- Manual: `supabase db dump` via CLI
- Export CSV dari admin dashboard secara berkala

## Security Checklist

- [ ] RLS policies aktif di semua tabel
- [ ] Service Role Key HANYA di server-side (Edge Functions)
- [ ] Anon Key hanya untuk client-side read/write terbatas
- [ ] Admin dashboard butuh autentikasi Supabase Auth
- [ ] HTTPS enforced (automatic di Vercel/Netlify)
- [ ] CORS settings benar di Supabase
- [ ] Rate limiting (Supabase default: 100 req/10s per IP)

## Scaling Considerations

- **Free Tier Limits**:
  - Supabase: 500MB DB, 2GB bandwidth, 50k MAU
  - Vercel: 100GB bandwidth, unlimited personal projects
  - Netlify: 100GB bandwidth, 300 build minutes

- **Upgrade Path**:
  - Supabase Pro: $25/bulan untuk 8GB DB, 250GB bandwidth
  - Vercel Pro: $20/bulan untuk 1TB bandwidth
  - Netlify Pro: $19/bulan untuk 400GB bandwidth

## Rollback Procedure

### Vercel
1. Vercel Dashboard > Deployments
2. Klik **...** pada deployment sebelumnya > **Promote to Production**

### GitHub Pages
1. Revert commit yang bermasalah
2. Push ke main, workflow akan auto-redeploy

### Netlify
1. Netlify Dashboard > Deploys
2. Klik **Publish deploy** pada deployment sebelumnya

## Support

Untuk bantuan deployment, cek:
- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Netlify Docs](https://docs.netlify.com)
- [GitHub Pages Docs](https://docs.github.com/en/pages)
