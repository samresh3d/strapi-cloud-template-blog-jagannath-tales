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
    throw error; // Re-throw if we couldn't recover
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
      publishedAt: new Date().toISOString()
    },
    { 
      name: 'Divine Miracles', 
      slug: 'divine-miracles',
      publishedAt: new Date().toISOString()
    },
    { 
      name: 'Sacred Festivals', 
      slug: 'sacred-festivals',
      publishedAt: new Date().toISOString()
    }
  ];
  
  const categories = [];
  
  // First try to get the JWT token for admin access
  console.log('Getting admin authentication token...');
  let adminToken = '';
  
  try {
    const authResponse = await axios.post(API_TOKEN_URL, AUTH);
    adminToken = authResponse.data.data.token;
    console.log('✅ Admin authentication successful');
  } catch (authError) {
    console.error('❌ Failed to authenticate as admin:', authError.message);
    console.log('Falling back to API token for limited operations');
    // We'll continue with the regular API token
  }
  
  for (const categoryData of categoriesData) {
    try {
      // First check if the category exists
      console.log(`Checking if category '${categoryData.name}' exists...`);
      try {
        const checkResponse = await axios.get(
          `${API_URL}/categories?filters[slug][$eq]=${categoryData.slug}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        if (checkResponse.data.data && checkResponse.data.data.length > 0) {
          console.log(`✅ Category '${categoryData.name}' already exists, using existing record`);
          categories.push({
            id: checkResponse.data.data[0].id,
            ...checkResponse.data.data[0].attributes
          });
          continue;
        }
      } catch (checkError) {
        console.log(`Unable to check for existing category: ${checkError.message}`);
      }
      
      // Try to create using the direct database connection via admin API
      console.log(`Creating category: ${categoryData.name}`);
      
      try {
        // First try with admin token if available
        const headers = adminToken 
          ? { 'Authorization': `Bearer ${adminToken}`, 'Content-Type': 'application/json' }
          : { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
          
        const response = await axios.post(
          `${API_URL}/categories`, 
          { data: categoryData }, 
          { headers }
        );
        
        const newCategory = {
          id: response.data.data.id,
          ...response.data.data.attributes
        };
        
        categories.push(newCategory);
        console.log(`✅ Category created: ${categoryData.name} (ID: ${newCategory.id})`);
      } catch (createError) {
        console.error(`❌ Failed to create category via API: ${createError.message}`);
        
        // Add a placeholder with the specified ID to allow the script to continue
        console.log('Adding placeholder category to continue script execution');
        categories.push({
          id: categories.length + 1, // Use sequential IDs starting from 1
          name: categoryData.name,
          slug: categoryData.slug
        });
      }
    } catch (error) {
      console.error(`❌ Error processing category ${categoryData.name}:`, error.message);
    }
  }
  
  return categories;
}

/**
 * Create or update global settings with quotes
 */
async function createOrUpdateGlobalSettings() {
  try {
    console.log('Checking if global settings exist...');
    let globalRecord = null;
    
    try {
      const checkResponse = await axios.get(
        `${API_URL}/global`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (checkResponse.data && checkResponse.data.data) {
        console.log('✅ Global settings exist');
        globalRecord = {
          id: checkResponse.data.data.id,
          ...checkResponse.data.data.attributes
        };
      }
    } catch (checkError) {
      console.log(`Unable to check for existing global settings: ${checkError.message}`);
    }
    
    // Define default quotes
    const defaultGlobalQuotes = [
      {
        text: "Faith is taking the first step even when you don't see the whole staircase.",
        author: "Martin Luther King Jr.",
        source: "Strength to Love"
      },
      {
        text: "The best way to find yourself is to lose yourself in the service of others.",
        author: "Mahatma Gandhi",
        source: ""
      },
      {
        text: "Devotion is the sublime path that leads to the Divine.",
        author: "Sri Jagannath",
        source: "Jagannath Wisdom"
      }
    ];
    
    if (globalRecord) {
      // Update existing global settings
      console.log('Updating global settings with quotes...');
      
      const updateData = {
        data: {
          globalQuotes: globalRecord.globalQuotes || defaultGlobalQuotes
        }
      };
      
      // If there are no existing quotes, add the default ones
      if (!globalRecord.globalQuotes || globalRecord.globalQuotes.length === 0) {
        updateData.data.globalQuotes = defaultGlobalQuotes;
      }
      
      const updateResponse = await axios.put(
        `${API_URL}/global`,
        updateData,
        { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      
      return {
        id: updateResponse.data.data.id,
        ...updateResponse.data.data.attributes
      };
    } else {
      // Create new global settings
      console.log('Creating new global settings with quotes...');
      
      const createData = {
        data: {
          siteName: "Jagannath Tales",
          siteDescription: "Stories, legends, and wisdom from Lord Jagannath",
          globalQuotes: defaultGlobalQuotes,
          publishedAt: new Date().toISOString()
        }
      };
      
      const createResponse = await axios.post(
        `${API_URL}/global`,
        createData,
        { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      
      return {
        id: createResponse.data.data.id,
        ...createResponse.data.data.attributes
      };
    }
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
 * Create reusable quotes
 */
async function createQuotes() {
  const quotesData = [
    {
      text: "Faith is taking the first step even when you don't see the whole staircase.",
      author: "Martin Luther King Jr.",
      source: "Strength to Love",
      category: "Faith",
      slug: "faith-first-step",
      publishedAt: new Date().toISOString()
    },
    {
      text: "The best way to find yourself is to lose yourself in the service of others.",
      author: "Mahatma Gandhi",
      source: "",
      category: "Service",
      slug: "lose-yourself-service",
      publishedAt: new Date().toISOString()
    },
    {
      text: "When you surrender to what is and so become fully present, the past ceases to have any power.",
      author: "Eckhart Tolle",
      source: "The Power of Now",
      category: "Spirituality",
      slug: "surrender-present-moment",
      publishedAt: new Date().toISOString()
    },
    {
      text: "The divine mother never turns away from the sincere prayers of her children.",
      author: "Village Elder",
      source: "Oral Tradition",
      category: "Devotion",
      slug: "divine-mother-prayers",
      publishedAt: new Date().toISOString()
    },
    {
      text: "The essence of all religions is love, compassion, and tolerance.",
      author: "Dalai Lama",
      source: "",
      category: "Religion",
      slug: "essence-all-religions",
      publishedAt: new Date().toISOString()
    }
  ];
  
  const quotes = [];
  
  // First try to get the JWT token for admin access
  console.log('Getting admin authentication token...');
  let adminToken = '';
  
  try {
    if (!global.adminToken) {
      const authResponse = await axios.post(API_TOKEN_URL, AUTH);
      adminToken = authResponse.data.data.token;
      global.adminToken = adminToken;
      console.log('✅ Admin authentication successful');
    } else {
      adminToken = global.adminToken;
    }
  } catch (authError) {
    console.error('❌ Failed to authenticate as admin:', authError.message);
    console.log('Falling back to API token for limited operations');
  }
  
  for (const quoteData of quotesData) {
    try {
      // Check if quote exists
      console.log(`Checking if quote '${quoteData.text.substring(0, 30)}...' exists...`);
      
      try {
        const checkResponse = await axios.get(
          `${API_URL}/quotes?filters[slug][$eq]=${quoteData.slug}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        if (checkResponse.data.data && checkResponse.data.data.length > 0) {
          console.log(`✅ Quote already exists, using existing record`);
          quotes.push({
            id: checkResponse.data.data[0].id,
            ...checkResponse.data.data[0].attributes
          });
          continue;
        }
      } catch (checkError) {
        console.log(`Unable to check for existing quote: ${checkError.message}`);
      }
      
      // Try to create the quote
      console.log(`Creating quote: ${quoteData.text.substring(0, 30)}...`);
      
      try {
        const headers = adminToken 
          ? { 'Authorization': `Bearer ${adminToken}`, 'Content-Type': 'application/json' }
          : { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
          
        const response = await axios.post(
          `${API_URL}/quotes`, 
          { data: quoteData },
          { headers }
        );
        
        const quote = {
          id: response.data.data.id,
          ...response.data.data.attributes
        };
        
        quotes.push(quote);
        console.log(`✅ Quote created: ID ${quote.id}`);
      } catch (createError) {
        console.error('❌ Failed to create quote:', createError.message);
        if (createError.response) {
          console.error('Response status:', createError.response.status);
          console.error('Response data:', createError.response.data);
        }
      }
    } catch (error) {
      console.error(`❌ Error processing quote: ${error.message}`);
    }
  }
  
  return quotes;
}

/**
 * Create festival events
 */
async function createFestivalEvents() {
  const now = new Date();
  const currentYear = now.getFullYear();
  
  const festivalEventsData = [
    {
      name: "Jagannath Rath Yatra",
      slug: "jagannath-rath-yatra-" + currentYear,
      description: "The famous chariot festival where Lord Jagannath, Lord Balabhadra, and Goddess Subhadra are taken in a procession on three magnificent chariots.",
      startDate: new Date(currentYear, 6, 7).toISOString().split('T')[0], // July 7
      endDate: new Date(currentYear, 6, 15).toISOString().split('T')[0], // July 15
      isAllDay: true,
      location: "Puri, Odisha",
      importance: "major",
      rituals: "The festival begins with 'Pahandi Bije' where the deities are carried to their chariots. The chariots are then pulled by devotees through the streets of Puri to the Gundicha Temple.",
      publishedAt: new Date().toISOString()
    },
    {
      name: "Chandan Yatra",
      slug: "chandan-yatra-" + currentYear,
      description: "A 21-day water festival where the representative images of the deities are taken in a procession in beautifully decorated boats.",
      startDate: new Date(currentYear, 4, 15).toISOString().split('T')[0], // May 15
      endDate: new Date(currentYear, 5, 5).toISOString().split('T')[0], // June 5
      isAllDay: true,
      location: "Narendra Pond, Puri",
      importance: "major",
      rituals: "The festival involves daily boat rides of the deities in Narendra Pond. Sandalwood paste is applied to cool the deities during summer.",
      publishedAt: new Date().toISOString()
    },
    {
      name: "Snana Purnima",
      slug: "snana-purnima-" + currentYear,
      description: "The bathing festival that marks the first public appearance of the deities after they remain in seclusion following the Devasnana Purnima.",
      startDate: new Date(currentYear, 5, 22).toISOString().split('T')[0], // June 22
      isAllDay: true,
      location: "Jagannath Temple, Puri",
      importance: "major",
      rituals: "The deities are bathed with 108 pitchers of perfumed water and then dressed as elephants (Gajavesha).",
      publishedAt: new Date().toISOString()
    },
    {
      name: "Diwali Celebration",
      slug: "diwali-celebration-" + currentYear,
      description: "Special celebration of Diwali at Jagannath Temple with thousands of lamps and lights.",
      startDate: new Date(currentYear, 10, 12).toISOString().split('T')[0], // November 12
      isAllDay: true,
      location: "Jagannath Temple, Puri",
      importance: "major",
      rituals: "Special puja, lighting of lamps, fireworks, and distribution of sweets.",
      publishedAt: new Date().toISOString()
    },
    {
      name: "Chitalagi Amavasya",
      slug: "chitalagi-amavasya-" + currentYear,
      description: "A regional festival marking the beginning of the agricultural season.",
      startDate: new Date(currentYear, 2, 10).toISOString().split('T')[0], // March 10
      isAllDay: true,
      location: "Various Jagannath Temples",
      importance: "regional",
      publishedAt: new Date().toISOString()
    }
  ];
  
  const festivalEvents = [];
  
  // First try to get the JWT token for admin access
  console.log('Getting admin authentication token for festival events...');
  let adminToken = '';
  
  try {
    if (!global.adminToken) {
      const authResponse = await axios.post(API_TOKEN_URL, AUTH);
      adminToken = authResponse.data.data.token;
      global.adminToken = adminToken;
      console.log('✅ Admin authentication successful');
    } else {
      adminToken = global.adminToken;
    }
  } catch (authError) {
    console.error('❌ Failed to authenticate as admin:', authError.message);
    console.log('Falling back to API token for limited operations');
  }
  
  for (const eventData of festivalEventsData) {
    try {
      // Check if event exists
      console.log(`Checking if festival event '${eventData.name}' exists...`);
      
      try {
        const checkResponse = await axios.get(
          `${API_URL}/festival-events?filters[slug][$eq]=${eventData.slug}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        if (checkResponse.data.data && checkResponse.data.data.length > 0) {
          console.log(`✅ Festival event already exists, using existing record`);
          festivalEvents.push({
            id: checkResponse.data.data[0].id,
            ...checkResponse.data.data[0].attributes
          });
          continue;
        }
      } catch (checkError) {
        console.log(`Unable to check for existing festival event: ${checkError.message}`);
      }
      
      // Try to create the event
      console.log(`Creating festival event: ${eventData.name}`);
      
      try {
        const headers = adminToken 
          ? { 'Authorization': `Bearer ${adminToken}`, 'Content-Type': 'application/json' }
          : { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
          
        const response = await axios.post(
          `${API_URL}/festival-events`, 
          { data: eventData },
          { headers }
        );
        
        const event = {
          id: response.data.data.id,
          ...response.data.data.attributes
        };
        
        festivalEvents.push(event);
        console.log(`✅ Festival event created: ID ${event.id}`);
      } catch (createError) {
        console.error('❌ Failed to create festival event:', createError.message);
        if (createError.response) {
          console.error('Response status:', createError.response.status);
          console.error('Response data:', createError.response.data);
        }
      }
    } catch (error) {
      console.error(`❌ Error processing festival event: ${error.message}`);
    }
  }
  
  return festivalEvents;
}

/**
 * Create articles with dynamic content
 */
async function createArticles(authorId, categoryId, quotes = [], festivalEvents = []) {
  const articlesData = [
    {
      title: 'Narada\'s Divine Test',
      slug: 'naradas-divine-test',
      description: 'A tale of humility and divine lessons.',
      contentType: 'devotion',
      publishDate: '2023-06-30',
      readingTime: 3,
      featured: true,
      category: categoryId,
      author: authorId,
      content: [
        {
          __component: 'story.heading',
          text: 'The Challenge',
          level: '2'
        },
        {
          __component: 'story.paragraph',
          text: 'Narada, the celestial sage known for his unwavering devotion to the divine, approached Lord Jagannath with pride in his heart. He believed his devotion was unmatched in all the three worlds. Sensing this pride, Lord Jagannath decided to teach him a gentle but profound lesson.'
        },
        {
          __component: 'story.quote',
          text: 'True devotion is not measured by the length of prayers or the sweetness of bhajans, but by the purity of one\'s heart and the absence of ego.',
          author: 'Lord Jagannath'
        },
        {
          __component: 'story.heading',
          text: 'The Revelation',
          level: '2'
        },
        {
          __component: 'story.paragraph',
          text: 'Lord Jagannath asked Narada to carry a bowl filled to the brim with oil through the busy streets of Puri without spilling a single drop. Throughout the journey, Narada\'s mind was so focused on the oil that he couldn\'t remember to chant the Lord\'s name even once.'
        },
        {
          __component: 'story.paragraph',
          text: 'When he returned, Lord Jagannath revealed that a humble farmer who remembered Him just once while performing his daily duties with full concentration had shown truer devotion than Narada\'s ostentatious displays.'
        },
        {
          __component: 'story.heading',
          text: 'The Lesson',
          level: '2'
        },
        {
          __component: 'story.paragraph',
          text: 'Narada understood that true devotion lies in remembering the divine while performing one\'s duties with complete focus and without ego. It\'s about carrying the divine in one\'s heart throughout life\'s journey, not just during formal worship.'
        }
      ],
      publishedAt: new Date().toISOString()
    },
    {
      title: 'Lord Balabhadra\'s Divine Protection',
      slug: 'lord-balabhadras-divine-protection',
      description: 'A miracle of faith during a fierce storm.',
      contentType: 'devotion',
      publishDate: '2023-05-19',
      readingTime: 2,
      featured: false,
      category: categoryId,
      author: authorId,
      content: [
        {
          __component: 'story.heading',
          text: 'The Raging Storm',
          level: '2'
        },
        {
          __component: 'story.paragraph',
          text: 'A devastating cyclone struck Puri, with winds so powerful they uprooted ancient trees and destroyed sturdy structures. The devotees feared for the temple of Lord Jagannath as the storm raged with increasing fury.'
        },
        {
          __component: 'story.heading',
          text: 'The Unwavering Flag',
          level: '2'
        },
        {
          __component: 'story.paragraph',
          text: 'As the storm reached its peak, witnesses were astounded to see the flag atop the Jagannath Temple flying defiantly against the direction of the wind. The cloth rippled as if being blown from the opposite direction, defying the natural forces.'
        },
        {
          __component: 'story.paragraph',
          text: 'Devotees recognized this as Lord Balabhadra\'s divine intervention, protecting the sacred temple and all those who had sought refuge within its walls. Not a single person inside the temple was harmed, despite the destruction that surrounded them.'
        },
        {
          __component: 'story.quote',
          text: 'When divine protection embraces you, even the fiercest storms must bow in reverence.',
          author: 'Temple Priest'
        }
      ],
      publishedAt: new Date().toISOString()
    },
    {
      title: 'Goddess Subhadra\'s Blessing',
      slug: 'goddess-subhadras-blessing',
      description: 'A story of compassion and timely blessings.',
      contentType: 'devotion',
      publishDate: '2023-04-14',
      readingTime: 2,
      featured: false,
      category: categoryId,
      author: authorId,
      content: [
        {
          __component: 'story.heading',
          text: 'The Endless Drought',
          level: '2'
        },
        {
          __component: 'story.paragraph',
          text: 'The land of Odisha suffered through months of severe drought. Crops withered in the fields, and the life-giving rivers dried to mere trickles. The people, desperate and hungry, turned to Goddess Subhadra with their prayers.'
        },
        {
          __component: 'story.heading',
          text: 'The Heartfelt Prayers',
          level: '2'
        },
        {
          __component: 'story.paragraph',
          text: 'For nine days and nights, the devotees kept vigil at the temple, singing bhajans and offering special prayers to the compassionate Goddess. On the ninth day, as they completed the final aarti, a small dark cloud appeared in the clear sky.'
        },
        {
          __component: 'story.heading',
          text: 'The Gift of Rain',
          level: '2'
        },
        {
          __component: 'story.paragraph',
          text: 'The lone cloud grew rapidly, calling forth more clouds until the sky darkened completely. Then, with gentle mercy, the rain began to fall. It continued steadily for three days, replenishing the parched earth without causing floods or damage.'
        },
        {
          __component: 'story.paragraph',
          text: 'The people rejoiced, recognizing Goddess Subhadra\'s blessing in this perfectly timed miracle. The crops recovered, and the threat of famine disappeared, all through the divine grace of the compassionate Goddess.'
        },
        {
          __component: 'story.quote',
          text: 'The divine mother never turns away from the sincere prayers of her children.',
          author: 'Village Elder'
        }
      ],
      publishedAt: new Date().toISOString()
    }
  ];
  
  // First try to get the JWT token for admin access if we haven't already
  let adminToken = '';
  
  try {
    if (!global.adminToken) {
      console.log('Getting admin authentication token for article creation...');
      const authResponse = await axios.post(API_TOKEN_URL, AUTH);
      adminToken = authResponse.data.data.token;
      global.adminToken = adminToken;
      console.log('✅ Admin authentication successful');
    } else {
      adminToken = global.adminToken;
    }
  } catch (authError) {
    console.error('❌ Failed to authenticate as admin:', authError.message);
    console.log('Falling back to API token for limited operations');
    // We'll continue with the regular API token
  }
  
  for (const articleData of articlesData) {
    try {
      // Check if article exists by slug
      console.log(`Checking if article '${articleData.title}' exists...`);
      
      try {
        const checkResponse = await axios.get(
          `${API_URL}/articles?filters[slug][$eq]=${articleData.slug}`, 
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        // If article exists, skip it
        if (checkResponse.data.data && checkResponse.data.data.length > 0) {
          console.log(`✅ Article '${articleData.title}' already exists, skipping`);
          continue;
        }
      } catch (checkError) {
        console.log(`Unable to check for existing article: ${checkError.message}`);
        console.log('Continuing with article creation attempt...');
      }
      
      // If article doesn't exist, create it
      console.log(`Creating article: ${articleData.title}`);
      
      try {
        // Choose the best token to use - admin token if available, otherwise API token
        const headers = adminToken 
          ? { 'Authorization': `Bearer ${adminToken}`, 'Content-Type': 'application/json' }
          : { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
        
        // Prepare article data with relations if available
        const articleWithRelations = { 
          ...articleData,
          // Initialize with empty arrays/values for TypeScript
          quotes: [],
          featuredQuote: null,
          festivalEvents: [],
          featuredEvent: null 
        };
        
        // Add quotes relation if we have quotes
        if (quotes && quotes.length > 0) {
          // Select 1-3 random quotes
          const numQuotes = Math.floor(Math.random() * 3) + 1;
          const selectedQuoteIds = [];
          
          for (let i = 0; i < numQuotes && i < quotes.length; i++) {
            // Get a random quote
            const randomIndex = Math.floor(Math.random() * quotes.length);
            const quoteId = quotes[randomIndex].id;
            
            // Make sure we don't add duplicates
            if (!selectedQuoteIds.includes(quoteId)) {
              selectedQuoteIds.push(quoteId);
            }
          }
          
          // Add the quotes to the article data
          if (selectedQuoteIds.length > 0) {
            articleWithRelations.quotes = selectedQuoteIds;
            
            // Also set a featured quote (the first one)
            articleWithRelations.featuredQuote = selectedQuoteIds[0];
          }
        }
        
        // Add festival event relations if we have events
        if (festivalEvents && festivalEvents.length > 0) {
          // Select 0-2 random festival events (some articles might not have events)
          const shouldAddEvents = Math.random() > 0.3; // 70% chance to add events
          
          if (shouldAddEvents) {
            const numEvents = Math.floor(Math.random() * 2) + 1;
            const selectedEventIds = [];
            
            for (let i = 0; i < numEvents && i < festivalEvents.length; i++) {
              // Get a random event
              const randomIndex = Math.floor(Math.random() * festivalEvents.length);
              const eventId = festivalEvents[randomIndex].id;
              
              // Make sure we don't add duplicates
              if (!selectedEventIds.includes(eventId)) {
                selectedEventIds.push(eventId);
              }
            }
            
            // Add the events to the article data
            if (selectedEventIds.length > 0) {
              articleWithRelations.festivalEvents = selectedEventIds;
              
              // Also set a featured event (the first one)
              articleWithRelations.featuredEvent = selectedEventIds[0];
            }
          }
        }
        
        // First attempt to create via the regular API
        const response = await axios.post(
          `${API_URL}/articles`, 
          { data: articleWithRelations },
          { headers }
        );
        
        console.log(`✅ Article created successfully: ${articleData.title} (ID: ${response.data.data.id})`);
      } catch (createError) {
        console.error(`❌ Failed to create article via API: ${createError.message}`);
        
        if (createError.response) {
          console.error('Response status:', createError.response.status);
          console.error('Response data:', createError.response.data);
          
          // Try the admin content manager API as a fallback
          if (adminToken) {
            try {
              console.log('Attempting to create article via admin API...');
              
              // Clone the article data without the nested content for simpler creation
              const simpleArticleData = { 
                title: articleData.title,
                slug: articleData.slug,
                description: articleData.description,
                contentType: articleData.contentType,
                publishDate: articleData.publishDate,
                readingTime: articleData.readingTime,
                featured: articleData.featured,
                author: articleData.author,
                category: articleData.category,
                publishedAt: new Date().toISOString()
              };
              
              // Log what we're trying to do
              console.log('Creating basic article without complex content for now');
              
              const adminResponse = await axios.post(
                `${API_URL}/articles`, 
                { data: simpleArticleData },
                { headers: { 'Authorization': `Bearer ${adminToken}`, 'Content-Type': 'application/json' } }
              );
              
              console.log(`✅ Basic article created via admin API: ${articleData.title} (ID: ${adminResponse.data.data.id})`);
              console.log('Note: Dynamic content zones will need to be added manually');
            } catch (adminError) {
              console.error('❌ Admin API article creation also failed:', adminError.message);
              console.log('Please create this article manually using the Strapi admin UI');
            }
          } else {
            console.log('No admin token available for fallback creation attempt');
            console.log('Please create this article manually using the Strapi admin UI');
          }
        }
      }
    } catch (error) {
      console.error(`❌ Failed to process article ${articleData.title}:`, error.message);
    }
  }
}

// Run the seed function
seed();
