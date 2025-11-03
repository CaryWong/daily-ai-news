require('dotenv').config({ path: '.env.local' });

const Parser = require('rss-parser');
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const parser = new Parser();

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// AI news RSS feeds
const RSS_FEEDS = [
  'https://techcrunch.com/category/artificial-intelligence/feed/',
  'https://www.technologyreview.com/topic/artificial-intelligence/feed',
  'https://venturebeat.com/category/ai/feed/',
  'https://www.artificialintelligence-news.com/feed/',
  'https://www.marktechpost.com/feed/',
];

async function fetchRSSFeeds() {
  console.log('Fetching RSS feeds...');
  const articles = [];

  for (const feedUrl of RSS_FEEDS) {
    try {
      const feed = await parser.parseURL(feedUrl);
      console.log(`Fetched ${feed.items.length} items from ${feed.title}`);

      // Get articles from the last 24 hours
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

      feed.items.forEach(item => {
        const pubDate = new Date(item.pubDate);
        if (pubDate > yesterday) {
          articles.push({
            title: item.title,
            link: item.link,
            pubDate: item.pubDate,
            source: feed.title,
            content: item.contentSnippet || item.content,
            guid: item.guid || item.link,
          });
        }
      });
    } catch (error) {
      console.error(`Error fetching ${feedUrl}:`, error.message);
    }
  }

  return articles;
}

async function deduplicateArticles(articles) {
  console.log(`Processing ${articles.length} articles...`);

  // Check which articles already exist in database
  const guids = articles.map(a => a.guid);
  const { data: existingArticles } = await supabase
    .from('articles')
    .select('guid')
    .in('guid', guids);

  const existingGuids = new Set(existingArticles?.map(a => a.guid) || []);
  const newArticles = articles.filter(a => !existingGuids.has(a.guid));

  console.log(`Found ${newArticles.length} new articles`);
  return newArticles;
}

async function summarizeWithGemini(articles) {
  console.log('Generating AI summaries with Gemini...');

  const summaries = [];

  // Summarize top 10 articles
  for (const article of articles.slice(0, 10)) {
    try {
      const prompt = `Summarize this AI news article in 2-3 sentences. Be concise and focus on the key insight:\n\nTitle: ${article.title}\n\nContent: ${article.content?.slice(0, 1000)}`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const summary = response.text();

      summaries.push({
        ...article,
        summary: summary
      });

      console.log(`Summarized: ${article.title}`);
    } catch (error) {
      console.error(`Error summarizing article:`, error.message);
      summaries.push({
        ...article,
        summary: article.content?.slice(0, 200) + '...'
      });
    }
  }

  return summaries;
}

async function saveArticles(articles) {
  console.log(`Saving ${articles.length} articles to database...`);

  const { error } = await supabase
    .from('articles')
    .insert(articles.map(a => ({
      title: a.title,
      link: a.link,
      pub_date: a.pubDate,
      source: a.source,
      content: a.content,
      summary: a.summary,
      guid: a.guid,
      created_at: new Date().toISOString(),
    })));

  if (error) {
    console.error('Error saving articles:', error);
    throw error;
  }

  console.log('Articles saved successfully');
}

async function main() {
  try {
    console.log('Starting daily AI news aggregation...');

    // Fetch articles from RSS feeds
    const articles = await fetchRSSFeeds();

    if (articles.length === 0) {
      console.log('No new articles found');
      return;
    }

    // Remove duplicates
    const newArticles = await deduplicateArticles(articles);

    if (newArticles.length === 0) {
      console.log('No new articles to process');
      return;
    }

    // Summarize with Gemini
    const summarizedArticles = await summarizeWithGemini(newArticles);

    // Save to database
    await saveArticles(summarizedArticles);

    console.log('Daily aggregation completed successfully!');
  } catch (error) {
    console.error('Error in aggregation:', error);
    process.exit(1);
  }
}

main();
