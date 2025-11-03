# Daily AI News

A daily AI news aggregator that collects, summarizes, and emails the latest AI news to subscribers.

## Architecture

**GitHub Actions** (Free) - Runs daily news aggregation and email sending
**Vercel** (Free) - Hosts Next.js app for subscriber management
**Supabase** (Free) - PostgreSQL database for subscribers and articles
**Resend** (Free tier) - Email delivery service
**Google Gemini API** - AI-powered article summarization

## Features

- Daily aggregation from multiple AI news RSS feeds
- AI-powered summaries using Google Gemini
- Beautiful email digest
- Simple subscription management
- Unsubscribe handling
- Duplicate article detection
- Responsive landing page

## Setup Instructions

### 1. Clone and Install

```bash
npm install
```

### 2. Set Up Supabase

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to SQL Editor and run the schema from `supabase/schema.sql`
4. Get your credentials from Settings > API:
   - Project URL
   - Anon public key
   - Service role key (keep secret!)

### 3. Set Up Resend

1. Create account at [resend.com](https://resend.com)
2. Get your API key from Settings
3. Add and verify your domain (or use their test domain for development)

### 4. Set Up Gemini API

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key (it's free!)
3. Copy your API key

### 5. Configure Environment Variables

Create `.env.local` file:

```bash
cp .env.example .env.local
```

Fill in all the values:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

RESEND_API_KEY=your_resend_key
FROM_EMAIL=news@yourdomain.com

GEMINI_API_KEY=your_gemini_key

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 6. Test Locally

```bash
# Run the Next.js app
npm run dev

# Test news aggregation (in another terminal)
npm run aggregate

# Test email sending
npm run send-digest
```

Visit http://localhost:3000 to see the landing page.

### 7. Deploy to Vercel

1. Push your code to GitHub
2. Connect your repo to [Vercel](https://vercel.com)
3. Add all environment variables in Vercel dashboard
4. Deploy!

### 8. Set Up GitHub Actions

1. Go to your GitHub repo Settings > Secrets and variables > Actions
2. Add all required secrets:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GEMINI_API_KEY`
   - `RESEND_API_KEY`
   - `FROM_EMAIL`
   - `NEWS_API_KEY` (optional)
   - `NEXT_PUBLIC_APP_URL` (your Vercel URL)

3. Enable GitHub Actions in your repo
4. The workflow will run automatically every day at 8 AM UTC
5. You can also trigger it manually from the Actions tab

## Customization

### Change Email Send Time

Edit `.github/workflows/daily-digest.yml`:

```yaml
schedule:
  - cron: '0 8 * * *'  # Change time here (UTC)
```

### Add More RSS Feeds

Edit `scripts/aggregate-news.js`:

```javascript
const RSS_FEEDS = [
  'https://your-feed-url.com/feed',
  // Add more feeds
];
```

### Customize Email Template

Edit the HTML in `scripts/send-digest.js` in the `generateEmailHTML()` function.

### Change Article Count

Edit `scripts/aggregate-news.js` and `scripts/send-digest.js`:

```javascript
// Summarize top 10 articles
for (const article of articles.slice(0, 10)) {
  // Change 10 to your desired number
}
```

## Project Structure

```
├── .github/
│   └── workflows/
│       └── daily-digest.yml    # GitHub Actions workflow
├── app/
│   ├── api/
│   │   ├── subscribe/          # Subscribe API endpoint
│   │   └── unsubscribe/        # Unsubscribe API endpoint
│   ├── unsubscribe/            # Unsubscribe page
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Landing page
│   └── globals.css             # Global styles
├── scripts/
│   ├── aggregate-news.js       # News aggregation script
│   └── send-digest.js          # Email sending script
├── supabase/
│   └── schema.sql              # Database schema
├── package.json
└── README.md
```

## Cost Breakdown

**Free tier (suitable for up to ~5,000 subscribers):**
- GitHub Actions: Free (2,000 minutes/month)
- Vercel: Free
- Supabase: Free (500MB database, 2GB bandwidth)
- Resend: Free (3,000 emails/month, then $0.30/1000)
- Gemini API: Free (60 requests/minute, 1500 requests/day)

**Estimated monthly cost for 1,000 subscribers:**
- ~$0 (fully free tier!)

**Estimated monthly cost for 10,000 subscribers:**
- Resend: ~$21 (7,000 paid emails at $3/1000)
- Gemini API: ~$0 (within free tier)
- Total: ~$21/month

## Troubleshooting

**GitHub Actions failing:**
- Check that all secrets are set correctly
- View logs in Actions tab

**Emails not sending:**
- Verify Resend API key
- Check domain verification
- Look for errors in GitHub Actions logs

**No articles found:**
- RSS feeds might be down
- Check date filtering in aggregate-news.js

**Duplicate subscribers:**
- Database handles this automatically
- Check Supabase logs if issues persist

## Local Development Tips

1. Use Resend's test mode for development
2. Comment out email sending while testing
3. Use smaller article limits for faster testing
4. Check Supabase logs for database issues

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
