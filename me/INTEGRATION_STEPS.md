# Integration Guide for Portfolio Sections

This document provides step-by-step instructions for integrating the corrected portfolio section, backend function, and environment configuration into your project.

## Prerequisites

- Node.js 16+ installed
- Netlify account with site deployed
- Gmail account with app-specific password generated

## Step 1: Set Up Environment Variables

1. In your project root, create `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and fill in your actual values:
   ```
   GMAIL_USER=your-email@gmail.com
   GMAIL_APP_PASSWORD=your-16-character-app-password
   DOMAIN_URL=https://your-site.netlify.app
   ```

3. Ensure `.env` is in `.gitignore` (already done in corrected version)

4. Add these same env vars to Netlify:
   - Go to Site settings → Environment → Edit variables
   - Add the three variables with production values

## Step 2: Update Backend Function

1. Replace or update `netlify/functions/send-email-correct.js`:
   - Use the complete corrected version provided
   - Ensure filename is exactly `send-email-correct.js`

2. Delete old `netlify/functions/send-email.js` if it exists (avoid duplicate handlers)

3. Install dependencies:
   ```bash
   npm install
   ```

## Step 3: Update index.html

Locate the line `<section id="portfolio">` in your `index.html` (around line 560).

Replace the entire portfolio section from:
```html
<section id="portfolio">
  <div class="container">
    <div class="section-head reveal">
      <span class="eyebrow">Tanlangan ishlar</span>
      <h2>Jonli eterdagi <span class="gradient-text">loyihalarim</span></h2>
```

To the end with the complete corrected `portfolio-section.html` content.

## Step 4: Update Form Handler in index.html

In your `index.html`, locate the form submission code around line 1020:
```javascript
const response = await fetch('/.netlify/functions/send-email', {
```

Change it to:
```javascript
const response = await fetch('/.netlify/functions/send-email-correct', {
```

This ensures the form calls the corrected backend function.

## Step 5: Test Locally

1. Start local dev server:
   ```bash
   npm run dev
   ```

2. Test form submission at http://localhost:8888/#contact

3. Check that:
   - Form validation works (client-side error messages appear)
   - Email is received in your Gmail inbox
   - Subject line shows sender name
   - HTML is properly formatted (no unescaped characters)

## Step 6: Deploy to Production

1. Commit and push changes:
   ```bash
   git add .
   git commit -m "fix: correct CORS, honeypot validation, XSS prevention in contact form"
   git push origin main
   ```

2. Netlify automatically deploys on push

3. Test at your live domain (e.g., https://begzod.netlify.app)

## Security Checklist

- [ ] `.env` file created and in `.gitignore`
- [ ] `GMAIL_APP_PASSWORD` is app-specific password (not main Gmail password)
- [ ] All env vars set in Netlify Settings → Environment
- [ ] Form endpoint updated to `send-email-correct`
- [ ] No inline event handlers in portfolio HTML
- [ ] All external links have `rel="noopener noreferrer"`
- [ ] Old `send-email.js` deleted to prevent conflicts

## Troubleshooting

**"Method not allowed" error:**
- Ensure OPTIONS method is handled before POST guard in send-email-correct.js
- Verify CORS headers are returned for all responses

**"Email not received" but no error:**
- Check Gmail spam folder
- Verify `GMAIL_USER` and `GMAIL_APP_PASSWORD` are correct in `.env`
- Ensure app password (not main password) is used

**"CORS error in browser console":**
- Verify `DOMAIN_URL` env var is set and matches your site URL
- Check Netlify environment variables are deployed
- Use `netlify env:list` to confirm vars are visible to functions

**"Honeypot: bot detected" never shows:**
- This is intentional — honeypot silently passes bots with 200 OK
- Only real users see form submission confirmation

## Files Changed Summary

1. `netlify/functions/send-email-correct.js` — Fixed CORS, honeypot, XSS, validation
2. `portfolio-section.html` — Unescaped HTML, cleaned structure
3. `.gitignore` — Generated (new file)
4. `.env.example` — Generated (new file)
5. `package.json` — Removed netlify-cli, kept only nodemailer
6. `index.html` — Update form endpoint from `send-email` to `send-email-correct`

All changes maintain existing design tokens and CSS structure.