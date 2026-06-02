# Contact Form Deployment Guide

## Overview
This guide covers setting up the contact form with a secure serverless backend using Netlify Functions and Gmail SMTP.

## Prerequisites
- Gmail account with 2-Step Verification enabled
- Netlify account (free tier available)
- Node.js 18+ installed locally
- Git for version control

## Step 1: Gmail Setup (App Password)

### Enable 2-Step Verification
1. Go to myaccount.google.com
2. Click "Security" in the left menu
3. Enable "2-Step Verification" if not already enabled

### Generate App Password
1. In Google Account Security, find "App passwords"
2. Select "Mail" and "Windows Computer" (or your platform)
3. Google generates a 16-character password
4. Copy and save this password securely

## Step 2: Local Setup

### Install Dependencies
```bash
cd your-project-directory
npm install
```

### Create Environment File
1. Copy `.env.example` to `.env`
2. Fill in your credentials:
```
GMAIL_USER=your-gmail@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
DOMAIN_URL=https://your-domain.com
```

### Test Locally
```bash
npm run dev
```
This starts a local Netlify dev server at `http://localhost:8888`

## Step 3: Netlify Deployment

### Option A: Deploy from GitHub (Recommended)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Add contact form"
   git push origin main
   ```

2. **Connect to Netlify:**
   - Go to netlify.com
   - Click "New site from Git"
   - Select your repository
   - Build settings:
     - Build command: `echo 'Static site'`
     - Publish directory: `.` (root)
   - Click "Deploy"

3. **Add Environment Variables:**
   - Go to Netlify Dashboard > Your Site > Settings > Environment
   - Click "Edit variables"
   - Add three variables:
     - `GMAIL_USER`: your-gmail@gmail.com
     - `GMAIL_APP_PASSWORD`: your 16-char password
     - `DOMAIN_URL`: your-site.netlify.app

### Option B: Deploy with Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify deploy
```

Then add environment variables through the Netlify UI as described above.

## Step 4: Verify Deployment

1. Open your deployed site
2. Scroll to the Contact section
3. Fill out the form with test data
4. Submit and check for success message
5. Check your Gmail inbox for the submission

## Backend Function Details

### File Location
- `netlify/functions/send-email-correct.js`

### Security Features
- Email validation (regex pattern matching)
- Input sanitization (max 1000 chars)
- Honeypot field detection (spam prevention)
- Server-side validation (no trusting client input)
- CORS protection
- Credentials via environment variables only

### Request Validation
The backend validates:
- Name: minimum 2 characters
- Email: valid format
- Message: minimum 10 characters
- All fields required

## Frontend Features

### Client-Side Validation
- Real-time field validation
- Email format checking
- Honeypot field (hidden from users)
- Error messages displayed below fields
- Loading spinner during submission

### User Feedback
- Success message with checkmark
- Error message with details
- Form automatically clears on success
- Button disabled during submission

## Troubleshooting

### "Failed to send email" Error
1. Verify Gmail credentials in .env
2. Check "Less secure app access" is not blocking (use App Password instead)
3. Verify email is sent TO correct address in function
4. Check Netlify function logs: Dashboard > Logs

### CORS Issues
1. Verify `DOMAIN_URL` matches your site URL
2. Check frontend form is POSTing to `/.netlify/functions/send-email`
3. Browser console should show successful fetch

### Form Not Submitting
1. Check browser console for JavaScript errors
2. Verify honeypot field is hidden (check HTML)
3. Test with smaller message first
4. Check network tab in DevTools for 4xx/5xx errors

## Email Template Customization

To modify the email template sent to you:
1. Open `netlify/functions/send-email-correct.js`
2. Edit the `html` property in `mailOptions` (lines 101-115)
3. Keep the dynamic values: `${cleanName}`, `${cleanEmail}`, `${cleanMessage}`
4. Redeploy the function

Example modification:
```javascript
html: `
  <div style="background: #f0f0f0; padding: 20px;">
    <h1>New Message from ${cleanName}</h1>
    <p>Contact: ${cleanEmail}</p>
    <p>${cleanMessage}</p>
  </div>
`
```

## Updating from Vercel

If deploying to Vercel instead of Netlify:
1. Rename folder: `vercel/functions/` instead of `netlify/functions/`
2. Export: `export { handler };` instead of `module.exports`
3. Add `vercel.json` configuration
4. Deploy with `vercel` CLI

## Performance & Limits

- Email sending: ~2-5 seconds typical
- Gmail SMTP rate limit: 300 emails/minute
- Netlify function timeout: 26 seconds
- Request body limit: 6MB

## Maintenance

### Monthly Tasks
- Monitor form submissions in Gmail
- Check Netlify function logs for errors
- Test form submission monthly
- Verify Gmail App Password access

### Security
- Never commit `.env` file to Git
- Rotate Gmail App Password every 6 months
- Monitor for spam in form submissions
- Keep Node.js and dependencies updated

## Additional Resources

- [Netlify Functions Docs](https://docs.netlify.com/functions/overview/)
- [Nodemailer Documentation](https://nodemailer.com/)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [CORS Explained](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

## Support

For issues:
1. Check browser console (F12 > Console tab)
2. Check Netlify function logs
3. Verify .env variables are set correctly
4. Test form locally with `npm run dev`
