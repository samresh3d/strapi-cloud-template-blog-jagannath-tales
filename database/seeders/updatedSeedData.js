/**
 * Seed data script for Strapi
 * 
 * This script will create an author, categories, and articles with dynamic content.
 * To use:
 * 1. Start Strapi in development mode: npm run develop
 * 2. In another terminal, run: node database/seeders/seedData.js
 */

// Set the environment to ensure we connect to the local server
process.env.NODE_ENV = 'development';

const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:1337/api';
const ADMIN_API_URL = 'http://localhost:1337/admin/content-manager/collection-types';
const API_TOKEN_URL = 'http://localhost:1337/admin/login';

// Auth credentials - replace with your admin credentials
const AUTH = {
  identifier: 'samreshpathak@yahoo.com',
  password: 'Samresh@1991'
};

let token = '';

// Replace the login process with a static API token
const API_TOKEN = 'beda15ba734854708373e10ab0fbf456f3930f465cc0fd92ad280008ee7f6ef3891adf8257089c90de81678186fa2f31d3d5e9aa7b972d27d1d90146fd2f8c0e137af09385b7613c6538a009a39c47723ba2c0c27aff0379cab1d4b84dee71087c48e216ad44a3149717f1e007154a7de6ecebb80716ada9fbbf3e54d50f2cc9'; // Replace with your actual API token

/**
 * Main seeding function
 */
async function seed() {
  try {
    console.log('🌱 Starting seed process...');
    
    // Wait for the Strapi server to be fully initialized
    console.log('Waiting for the Strapi server to be ready...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Verify server connection
    try {
      console.log('Verifying server connection...');
      const pingResponse = await axios.get('http://localhost:1337');
      console.log('✅ Server is accessible:', pingResponse.status);
    } catch (pingError) {
      console.error('❌ Cannot connect to Strapi server. Is it running?');
      console.error('Connection error:', pingError.message);
      throw new Error('Server connection failed');
    }
    
    // Use the API token directly
    token = API_TOKEN;
    console.log('✅ Using API token for authentication');
    
    // Create data in the correct order to establish relationships
    const author = await createAuthor();
    if (author) {
      console.log(`✅ Author created/found: ${author.name || author.id}`);
    } else {
      throw new Error("Failed to create or find author");
    }
    
    const categories = await createCategories();
    if (categories && categories.length > 0) {
      console.log('✅ Categories created/found:', categories.map(c => c.name || c.id).join(', '));
      
      // Update or create global settings with quotes
      const globalSettings = await createOrUpdateGlobalSettings();
      if (globalSettings) {
        console.log('✅ Global settings updated with quotes');
      } else {
        console.warn('⚠️ Could not update global settings with quotes');
      }
      
      // Create reusable quotes
      const quotes = await createQuotes();
      if (quotes && quotes.length > 0) {
        console.log(`✅ Created/found ${quotes.length} reusable quotes`);
      } else {
        console.warn('⚠️ No quotes were created or found');
      }
      
      // Create reusable festival events
      const festivalEvents = await createFestivalEvents();
      if (festivalEvents && festivalEvents.length > 0) {
        console.log(`✅ Created/found ${festivalEvents.length} festival events`);
      } else {
        console.warn('⚠️ No festival events were created or found');
      }
      
      // Find the devotional stories category
      const devotionalCategory = categories.find(c => c.slug === 'devotional-stories' || c.name === 'Devotional Stories');
      
      if (!devotionalCategory) {
        throw new Error("Devotional Stories category not found");
      }
      
      // Create articles
      await createArticles(author.id, devotionalCategory.id, quotes, festivalEvents);
    } else {
      throw new Error("No categories were created or found");
    }
    
    console.log('🎉 Seed completed successfully!');
  } catch (error) {
    console.error('❌ Seed process failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      console.error('Response headers:', error.response.headers);
      
      // If we get a 403 error, it's likely an authentication issue
      if (error.response.status === 403) {
        console.error('Authentication error: Your API token might not have sufficient permissions');
        console.error('Please check your token in Strapi Admin > Settings > API Tokens');
        console.error('Ensure the token has create permissions for authors, categories, and articles');
      }
      // If we get a 500 error, it might be a validation issue
      else if (error.response.status === 500) {
        console.error('Server error: This might be due to validation issues or database constraints');
        console.error('Check the server logs for more details');
      }
    } else if (error.cause && error.cause.code) {
      console.error('Network error:', error.cause.code);
    } else {
      console.error('Error details:', error);
    }
  }
}

/**
 * Create author
 */
async function createAuthor() {
  const authorData = {
    name: 'Samresh Pathak',
    slug: 'samresh-pathak',
    bio: 'A devoted storyteller and follower of Lord Jagannath, dedicated to sharing the divine tales and spiritual wisdom from the temple of Puri.',
    publishedAt: new Date().toISOString()
  };
  
  console.log('Checking if author already exists...');
  
  try {
    // Check if author exists by slug
    const checkResponse = await axios.get(
      `${API_URL}/authors?filters[slug][$eq]=${authorData.slug}`, 
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    
    // If author exists, return it
    if (checkResponse.data.data && checkResponse.data.data.length > 0) {
      console.log(`✅ Author '${authorData.name}' already exists, using existing record`);
      return {
        id: checkResponse.data.data[0].id,
        ...checkResponse.data.data[0].attributes
      };
    }
    
    // If author doesn't exist, create it
    console.log('Creating author with data:', authorData);
    const createResponse = await axios.post(`${API_URL}/authors`, 
      { data: authorData },
      { headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        } 
      });
    
    return {
      id: createResponse.data.data.id,
      ...createResponse.data.data.attributes
    };
  } catch (error) {
    console.error('❌ Error creating/finding author:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      
      // If we got a 400 error and it's about uniqueness, try to fetch the existing author
      if (error.response.status === 400 && 
          error.response.data.error && 
          error.response.data.error.message === 'This attribute must be unique') {
        console.log('Attempting to fetch the existing author record...');
        const getResponse = await axios.get(
          `${API_URL}/authors?filters[slug][$eq]=${authorData.slug}`, 
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        if (getResponse.data.data && getResponse.data.data.length > 0) {
          console.log(`✅ Retrieved existing author: ${authorData.name}`);
          return {
            id: getResponse.data.data[0].id,
            ...getResponse.data.data[0].attributes
          };
        }
      }
    }
    throw error;
  }
}

/**
 * Create categories
 */
async function createCategories() {
  const categoriesData = [
    {
      name: 'Devotional Stories',
      slug: 'devotional-stories',
      description: 'Stories of devotion to Lord Jagannath and the divine experiences of his devotees.'
    },
    {
      name: 'Miracles',
      slug: 'miracles',
      description: 'Miraculous events associated with Lord Jagannath and his temple.'
    },
    {
      name: 'Festivals',
      slug: 'festivals',
      description: 'Information about festivals and celebrations related to Lord Jagannath.'
    },
    {
      name: 'Temple History',
      slug: 'temple-history',
      description: 'Historical accounts of the Jagannath Temple and its significance.'
    }
  ];
  
  console.log('Creating categories...');
  
  const createdCategories = [];
  
  for (const categoryData of categoriesData) {
    try {
      console.log(`Checking if category '${categoryData.name}' already exists...`);
      
      // Check if the category exists
      const checkResponse = await axios.get(
        `${API_URL}/categories?filters[slug][$eq]=${categoryData.slug}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      // If the category exists, use it
      if (checkResponse.data.data && checkResponse.data.data.length > 0) {
        console.log(`✅ Category '${categoryData.name}' already exists, using existing record`);
        createdCategories.push({
          id: checkResponse.data.data[0].id,
          ...checkResponse.data.data[0].attributes
        });
        continue;
      }
      
      // If the category doesn't exist, create it
      console.log(`Creating category: ${categoryData.name}`);
      const createResponse = await axios.post(
        `${API_URL}/categories`,
        { data: { ...categoryData, publishedAt: new Date().toISOString() } },
        { headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          } 
        }
      );
      
      createdCategories.push({
        id: createResponse.data.data.id,
        ...createResponse.data.data.attributes
      });
    } catch (error) {
      console.error(`❌ Error creating/finding category '${categoryData.name}':`, error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
    }
  }
  
  return createdCategories;
}

/**
 * Create or update global settings
 */
async function createOrUpdateGlobalSettings() {
  try {
    console.log('Updating global settings...');
    
    // First, get the current global settings
    const getResponse = await axios.get(
      `${API_URL}/global`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    
    if (!getResponse.data || !getResponse.data.data) {
      console.error('❌ Failed to retrieve global settings');
      return null;
    }
    
    const globalId = getResponse.data.data.id;
    const globalData = {
      siteName: 'Jagannath Tales',
      siteDescription: 'Divine stories and miracles of Lord Jagannath from the holy city of Puri',
      defaultSeo: {
        metaTitle: 'Jagannath Tales - Divine Stories and Miracles',
        metaDescription: 'Explore the divine stories, miracles, and festivals of Lord Jagannath from the holy city of Puri, Odisha.',
        shareImage: null
      }
    };
    
    // Update the global settings
    const updateResponse = await axios.put(
      `${API_URL}/global`,
      { data: globalData },
      { headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        } 
      }
    );
    
    return updateResponse.data;
  } catch (error) {
    console.error('❌ Error updating global settings:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return null;
  }
}

/**
 * Create quotes
 */
async function createQuotes() {
  const quotesData = [
    {
      text: "Lord Jagannath is the Lord of the Universe, watching over all beings with compassion.",
      author: "Jagannath Dasa",
      source: "Temple Scriptures",
      category: "Devotion"
    },
    {
      text: "The chariot festival of Jagannath is an invitation to pull the Lord into your heart.",
      author: "Balabhadra Swami",
      source: "Teachings of Puri",
      category: "Festival"
    },
    {
      text: "When the heart becomes pure, Lord Jagannath appears with his eternal smile.",
      author: "Subhadra Devi",
      source: "Divine Conversations",
      category: "Devotion"
    },
    {
      text: "The wooden form of Jagannath holds the mystery of the formless divine.",
      author: "Sudarshan Acharya",
      source: "Temple Manuscripts",
      category: "Philosophy"
    },
    {
      text: "In the kitchen of Jagannath, the Lord tastes every offering before it reaches the devotees.",
      author: "Temple Cook",
      source: "Prasadam Traditions",
      category: "Temple"
    }
  ];
  
  console.log('Creating quotes...');
  
  const createdQuotes = [];
  
  for (const quoteData of quotesData) {
    try {
      // Generate a slug from the text (first 50 characters)
      const slug = quoteData.text
        .substring(0, 50)
        .toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-');
      
      console.log(`Checking if quote '${slug}' already exists...`);
      
      // Check if the quote exists
      const checkResponse = await axios.get(
        `${API_URL}/data-quotes?filters[slug][$eq]=${slug}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      // If the quote exists, use it
      if (checkResponse.data.data && checkResponse.data.data.length > 0) {
        console.log(`✅ Quote '${slug}' already exists, using existing record`);
        createdQuotes.push({
          id: checkResponse.data.data[0].id,
          ...checkResponse.data.data[0].attributes
        });
        continue;
      }
      
      // If the quote doesn't exist, create it
      console.log(`Creating quote: ${slug}`);
      const createResponse = await axios.post(
        `${API_URL}/data-quotes`,
        { 
          data: { 
            ...quoteData, 
            slug,
            publishedAt: new Date().toISOString() 
          } 
        },
        { headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          } 
        }
      );
      
      createdQuotes.push({
        id: createResponse.data.data.id,
        ...createResponse.data.data.attributes
      });
    } catch (error) {
      console.error(`❌ Error creating/finding quote:`, error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
    }
  }
  
  return createdQuotes;
}

/**
 * Create festival events
 */
async function createFestivalEvents() {
  const festivalEventsData = [
    {
      name: "Ratha Yatra 2023",
      slug: "ratha-yatra-2023",
      description: "The annual chariot festival of Lord Jagannath, where the deities are brought out of the temple and placed on chariots pulled by devotees.",
      startDate: "2023-07-07",
      endDate: "2023-07-15",
      isAllDay: true,
      location: "Puri, Odisha",
      importance: "major",
      rituals: "The festival begins with the Pahandi (a ceremonial procession) of the deities from the temple to their respective chariots. The King of Puri performs the Chhera Pahara (sweeping of the chariots) before the chariots are pulled by devotees to the Gundicha Temple, where the deities stay for nine days before returning to the main temple."
    },
    {
      name: "Snana Yatra 2023",
      slug: "snana-yatra-2023",
      description: "The bathing festival of Lord Jagannath, where the deities are given a ceremonial bath with 108 pitchers of water.",
      startDate: "2023-06-04",
      endDate: "2023-06-04",
      isAllDay: true,
      location: "Puri, Odisha",
      importance: "major",
      rituals: "The deities are brought to the Snana Mandap (bathing platform) and bathed with 108 pitchers of perfumed water drawn from a well inside the temple complex. After the bath, the deities are dressed in the Hati Vesha (elephant attire)."
    },
    {
      name: "Netrotsava 2023",
      slug: "netrotsava-2023",
      description: "The eye-opening ceremony of the deities after they are given a new look following the Anasara period (when they are kept in isolation after the bathing festival).",
      startDate: "2023-06-28",
      endDate: "2023-06-28",
      isAllDay: true,
      location: "Puri, Odisha",
      importance: "major",
      rituals: "The eyes of the deities are painted by the temple priests, and the deities are given a new look. This ceremony marks the end of the Anasara period."
    },
    {
      name: "Chandan Yatra 2023",
      slug: "chandan-yatra-2023",
      description: "A 21-day festival where the representative images of the deities are taken on boat rides in a pond filled with sandalwood-scented water.",
      startDate: "2023-04-15",
      endDate: "2023-05-05",
      isAllDay: true,
      location: "Puri, Odisha",
      importance: "minor",
      rituals: "The representative images of the deities (Madana Mohana and Rama-Krishna) are taken on boat rides in the Narendra Tank, which is filled with sandalwood-scented water. Various rituals and cultural programs are performed during the festival."
    },
    {
      name: "Dola Purnima 2023",
      slug: "dola-purnima-2023",
      description: "The swing festival of Lord Jagannath, celebrated on the full moon day of the month of Phalguna.",
      startDate: "2023-03-07",
      endDate: "2023-03-07",
      isAllDay: true,
      location: "Puri, Odisha",
      importance: "minor",
      rituals: "The representative images of the deities are taken on a procession and placed on swings decorated with flowers. Devotees play with colored powders and celebrate Holi during this festival."
    }
  ];
  
  console.log('Creating festival events...');
  
  const createdFestivalEvents = [];
  
  for (const festivalEventData of festivalEventsData) {
    try {
      console.log(`Checking if festival event '${festivalEventData.name}' already exists...`);
      
      // Check if the festival event exists
      const checkResponse = await axios.get(
        `${API_URL}/data-festival-events?filters[slug][$eq]=${festivalEventData.slug}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      // If the festival event exists, use it
      if (checkResponse.data.data && checkResponse.data.data.length > 0) {
        console.log(`✅ Festival event '${festivalEventData.name}' already exists, using existing record`);
        createdFestivalEvents.push({
          id: checkResponse.data.data[0].id,
          ...checkResponse.data.data[0].attributes
        });
        continue;
      }
      
      // If the festival event doesn't exist, create it
      console.log(`Creating festival event: ${festivalEventData.name}`);
      const createResponse = await axios.post(
        `${API_URL}/data-festival-events`,
        { 
          data: { 
            ...festivalEventData, 
            publishedAt: new Date().toISOString() 
          } 
        },
        { headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          } 
        }
      );
      
      createdFestivalEvents.push({
        id: createResponse.data.data.id,
        ...createResponse.data.data.attributes
      });
    } catch (error) {
      console.error(`❌ Error creating/finding festival event '${festivalEventData.name}':`, error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
    }
  }
  
  return createdFestivalEvents;
}

/**
 * Create articles
 */
async function createArticles(authorId, categoryId, quotes, festivalEvents) {
  const articlesData = [
    {
      title: "The Divine Mystery of Jagannath",
      slug: "divine-mystery-jagannath",
      description: "Exploring the profound spiritual significance of Lord Jagannath and his wooden form.",
      contentType: "devotion",
      content: [
        {
          __component: "story.heading",
          level: 2,
          text: "The Origin of Lord Jagannath"
        },
        {
          __component: "story.paragraph",
          text: "Lord Jagannath, the 'Lord of the Universe,' is a deity worshipped primarily in the Indian state of Odisha. The image of Jagannath is a carved and decorated wooden stump with large round eyes and a benign smile. Along with Jagannath, his brother Balabhadra and sister Subhadra are also worshipped in the temple at Puri."
        },
        {
          __component: "story.paragraph",
          text: "According to legend, King Indradyumna was instructed by Lord Vishnu to build a temple for him. Vishnu appeared to the king in a dream and told him that a divine log would wash up on the shore, from which the king should carve the deities."
        },
        {
          __component: "shared.quote-reference",
          quote: "1"
        },
        {
          __component: "story.heading",
          level: 2,
          text: "The Incomplete Form"
        },
        {
          __component: "story.paragraph",
          text: "When the divine log was found, King Indradyumna summoned Vishwakarma, the divine architect, to carve the deities. Vishwakarma agreed but on one condition: he would work in complete isolation for 21 days, and no one should disturb him before the work was completed."
        },
        {
          __component: "story.paragraph",
          text: "However, the queen became anxious and couldn't wait. She persuaded the king to open the door before the 21 days were over. When they did, they found that Vishwakarma had disappeared, leaving the deities incomplete, without hands and with large round eyes."
        },
        {
          __component: "story.heading",
          level: 2,
          text: "The Spiritual Significance"
        },
        {
          __component: "story.paragraph",
          text: "This incomplete form of Lord Jagannath is believed to represent the supreme truth that the divine is formless and cannot be comprehended or limited by human perception. The large eyes symbolize that the divine sees everything, and the lack of hands signifies that devotees themselves are the hands of the Lord, performing his work in the world."
        },
        {
          __component: "shared.festival-event-reference",
          festivalEvent: "1",
          showDescription: true,
          showLocation: true,
          showDates: true
        },
        {
          __component: "story.paragraph",
          text: "The wooden form of Jagannath is also said to represent the unfinished nature of human spiritual evolution. We are all works in progress, striving towards perfection but never quite reaching it in our earthly form."
        },
        {
          __component: "story.heading",
          level: 2,
          text: "The Annual Renewal"
        },
        {
          __component: "story.paragraph",
          text: "Every 12 or 19 years, during an event called Nabakalebara (new body), the wooden images of the deities are replaced with new ones. This ritual symbolizes the cycle of life, death, and rebirth, and reminds devotees of the impermanence of physical form."
        },
        {
          __component: "shared.quote-reference",
          quote: "4"
        },
        {
          __component: "story.paragraph",
          text: "This ancient tradition continues to inspire millions of devotees who come to Puri to seek the blessings of Lord Jagannath, the Lord of the Universe."
        },
        {
          __component: "shared.festival-events-list",
          title: "Upcoming Festivals of Lord Jagannath",
          displayMode: "compact",
          limit: 3,
          sortBy: "startDate:asc",
          filterByImportance: ["major"]
        }
      ]
    }
  ];
  
  console.log('Creating articles...');
  
  const createdArticles = [];
  
  for (const articleData of articlesData) {
    try {
      console.log(`Checking if article '${articleData.title}' already exists...`);
      
      // Check if the article exists
      const checkResponse = await axios.get(
        `${API_URL}/pages-articles?filters[slug][$eq]=${articleData.slug}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      // If the article exists, update it
      if (checkResponse.data.data && checkResponse.data.data.length > 0) {
        console.log(`✅ Article '${articleData.title}' already exists, updating record`);
        
        const articleId = checkResponse.data.data[0].id;
        
        // Process content components to reference actual quotes and festival events
        const processedContent = processContent(articleData.content, quotes, festivalEvents);
        
        // Prepare article data with relationships
        const processedArticleData = {
          ...articleData,
          content: processedContent,
          author: authorId,
          categories: [categoryId],
          publishDate: new Date().toISOString(),
          readingTime: 5,
          featured: true,
          publishedAt: new Date().toISOString(),
          // Add quote and festival event relations if available
          quotes: quotes.length > 0 ? quotes.slice(0, 2).map(q => q.id) : [],
          festivalEvents: festivalEvents.length > 0 ? festivalEvents.slice(0, 2).map(fe => fe.id) : [],
          featuredQuote: quotes.length > 0 ? quotes[0].id : null,
          featuredEvent: festivalEvents.length > 0 ? festivalEvents[0].id : null
        };
        
        // Update the article
        const updateResponse = await axios.put(
          `${API_URL}/pages-articles/${articleId}`,
          { data: processedArticleData },
          { headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            } 
          }
        );
        
        createdArticles.push({
          id: updateResponse.data.data.id,
          ...updateResponse.data.data.attributes
        });
      } 
      // If the article doesn't exist, create it
      else {
        console.log(`Creating article: ${articleData.title}`);
        
        // Process content components to reference actual quotes and festival events
        const processedContent = processContent(articleData.content, quotes, festivalEvents);
        
        // Prepare article data with relationships
        const processedArticleData = {
          ...articleData,
          content: processedContent,
          author: authorId,
          categories: [categoryId],
          publishDate: new Date().toISOString(),
          readingTime: 5,
          featured: true,
          publishedAt: new Date().toISOString(),
          // Add quote and festival event relations if available
          quotes: quotes.length > 0 ? quotes.slice(0, 2).map(q => q.id) : [],
          festivalEvents: festivalEvents.length > 0 ? festivalEvents.slice(0, 2).map(fe => fe.id) : [],
          featuredQuote: quotes.length > 0 ? quotes[0].id : null,
          featuredEvent: festivalEvents.length > 0 ? festivalEvents[0].id : null
        };
        
        // Create the article
        const createResponse = await axios.post(
          `${API_URL}/pages-articles`,
          { data: processedArticleData },
          { headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            } 
          }
        );
        
        createdArticles.push({
          id: createResponse.data.data.id,
          ...createResponse.data.data.attributes
        });
      }
    } catch (error) {
      console.error(`❌ Error creating/updating article '${articleData.title}':`, error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
    }
  }
  
  return createdArticles;
}

/**
 * Process content components to replace quote and festival event references
 * with actual IDs from created entities
 */
function processContent(content, quotes, festivalEvents) {
  return content.map(component => {
    // Handle quote references
    if (component.__component === 'shared.quote-reference' && component.quote) {
      const quoteIndex = parseInt(component.quote) - 1;
      if (quotes[quoteIndex]) {
        return {
          ...component,
          quote: quotes[quoteIndex].id
        };
      }
    }
    
    // Handle festival event references
    if (component.__component === 'shared.festival-event-reference' && component.festivalEvent) {
      const eventIndex = parseInt(component.festivalEvent) - 1;
      if (festivalEvents[eventIndex]) {
        return {
          ...component,
          festivalEvent: festivalEvents[eventIndex].id
        };
      }
    }
    
    return component;
  });
}

// Start the seed process
seed();
