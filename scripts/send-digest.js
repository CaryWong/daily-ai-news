require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');
const { format } = require('date-fns');

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

async function getSubscribers() {
  const { data, error } = await supabase
    .from('subscribers')
    .select('email, id')
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching subscribers:', error);
    throw error;
  }

  console.log(`Found ${data.length} active subscribers`);
  return data;
}

async function getTodaysArticles() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .gte('created_at', today.toISOString())
    .order('pub_date', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching articles:', error);
    throw error;
  }

  console.log(`Found ${data.length} articles for today`);
  return data;
}

function generateEmailHTML(articles) {
  const today = format(new Date(), 'MMMM d, yyyy');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Daily AI News - ${today}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px; margin-bottom: 30px;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Daily AI News</h1>
    <p style="color: #f0f0f0; margin: 10px 0 0 0;">${today}</p>
  </div>

  <div style="margin-bottom: 30px;">
    <p style="font-size: 16px; color: #555;">
      Your daily digest of the latest AI news and developments.
    </p>
  </div>

  ${articles.map((article, index) => `
    <div style="margin-bottom: 30px; padding-bottom: 30px; border-bottom: 1px solid #eee;">
      <h2 style="margin: 0 0 10px 0; font-size: 20px;">
        <a href="${article.link}" style="color: #667eea; text-decoration: none;">
          ${article.title}
        </a>
      </h2>

      <div style="font-size: 12px; color: #999; margin-bottom: 10px;">
        ${article.source} • ${format(new Date(article.pub_date), 'h:mm a')}
      </div>

      <p style="margin: 0; color: #555; font-size: 15px;">
        ${article.summary || article.content?.slice(0, 200) + '...'}
      </p>

      <a href="${article.link}" style="display: inline-block; margin-top: 10px; color: #667eea; text-decoration: none; font-size: 14px;">
        Read more →
      </a>
    </div>
  `).join('')}

  <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #eee; text-align: center; color: #999; font-size: 12px;">
    <p>
      You're receiving this because you subscribed to Daily AI News.
    </p>
    <p>
      <a href="{{unsubscribe_url}}" style="color: #667eea; text-decoration: none;">Unsubscribe</a>
    </p>
  </div>

</body>
</html>
  `;
}

async function sendEmails(subscribers, articles) {
  console.log('Sending emails...');

  const batchSize = 100; // Resend allows batch sending
  let sentCount = 0;

  for (let i = 0; i < subscribers.length; i += batchSize) {
    const batch = subscribers.slice(i, i + batchSize);

    try {
      const emailPromises = batch.map(subscriber => {
        const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/unsubscribe?id=${subscriber.id}`;
        const html = generateEmailHTML(articles).replace('{{unsubscribe_url}}', unsubscribeUrl);

        return resend.emails.send({
          from: `Daily AI News <${process.env.FROM_EMAIL}>`,
          to: subscriber.email,
          subject: `Daily AI News - ${format(new Date(), 'MMMM d, yyyy')}`,
          html: html,
        });
      });

      await Promise.all(emailPromises);
      sentCount += batch.length;
      console.log(`Sent ${sentCount}/${subscribers.length} emails`);
    } catch (error) {
      console.error('Error sending batch:', error);
    }
  }

  // Log the digest send
  await supabase
    .from('digest_logs')
    .insert({
      sent_at: new Date().toISOString(),
      article_count: articles.length,
      subscriber_count: sentCount,
    });

  console.log(`Email digest sent to ${sentCount} subscribers`);
}

async function main() {
  try {
    console.log('Starting email digest send...');

    const articles = await getTodaysArticles();

    if (articles.length === 0) {
      console.log('No articles to send today');
      return;
    }

    const subscribers = await getSubscribers();

    if (subscribers.length === 0) {
      console.log('No active subscribers');
      return;
    }

    await sendEmails(subscribers, articles);

    console.log('Email digest completed successfully!');
  } catch (error) {
    console.error('Error sending digest:', error);
    process.exit(1);
  }
}

main();
