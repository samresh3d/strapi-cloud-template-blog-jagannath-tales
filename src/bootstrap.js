'use strict';

const fs = require('fs-extra');
const path = require('path');
const mime = require('mime-types');
const { categories, authors, articles, global, about } = require('../data/data.json');

async function seedExampleApp() {
  // Optional env guard so prod won't seed by default
  const isProd = strapi?.config?.environment === 'production' || process.env.NODE_ENV === 'production';
  if (isProd && process.env.SEED_ENABLED !== 'true') {
    console.log('Seeding disabled in production. Set SEED_ENABLED=true to enable.');
    return;
  }
  const shouldImportSeedData = await isFirstRun();

  if (shouldImportSeedData) {
    try {
      console.log('Setting up the template...');
      await importSeedData();
      console.log('Ready to go');
    } catch (error) {
      console.log('Could not import seed data');
      console.error(error);
    }
  } else {
    console.log(
      'Seed data has already been imported. We cannot reimport unless you clear your database first.'
    );
    // Ensure newly added single-types (like Footer, Navigation Header) exist even after first run
    try {
      await importFooter();
      console.log('Ensured footer exists.');
      await importNavigationHeader();
      console.log('Ensured navigation header exists.');
    } catch (err) {
      console.error('Failed to ensure single-types:', err.message || err);
    }
  }
}

async function isFirstRun() {
  const pluginStore = strapi.store({
    environment: strapi.config.environment,
    type: 'type',
    name: 'setup',
  });
  const initHasRun = await pluginStore.get({ key: 'initHasRun' });
  await pluginStore.set({ key: 'initHasRun', value: true });
  return !initHasRun;
}

async function setPublicPermissions(newPermissions) {
  // Find the ID of the public role
  const publicRole = await strapi.query('plugin::users-permissions.role').findOne({
    where: {
      type: 'public',
    },
  });

  // Create the new permissions and link them to the public role
  const allPermissionsToCreate = [];
  Object.keys(newPermissions).map((controller) => {
    const actions = newPermissions[controller];
    const permissionsToCreate = actions.map((action) => {
      return strapi.query('plugin::users-permissions.permission').create({
        data: {
          action: `api::${controller}.${controller}.${action}`,
          role: publicRole.id,
        },
      });
    });
    allPermissionsToCreate.push(...permissionsToCreate);
  });
  await Promise.all(allPermissionsToCreate);
}

function getFileSizeInBytes(filePath) {
  const stats = fs.statSync(filePath);
  const fileSizeInBytes = stats['size'];
  return fileSizeInBytes;
}

function getFileData(fileName) {
  const filePath = path.join('data', 'uploads', fileName);
  // Parse the file metadata
  const size = getFileSizeInBytes(filePath);
  const ext = fileName.split('.').pop();
  const mimeType = mime.lookup(ext || '') || '';

  return {
    filepath: filePath,
    originalFileName: fileName,
    size,
    mimetype: mimeType,
  };
}

async function uploadFile(file, name) {
  return strapi
    .plugin('upload')
    .service('upload')
    .upload({
      files: file,
      data: {
        fileInfo: {
          alternativeText: `An image uploaded to Strapi called ${name}`,
          caption: name,
          name,
        },
      },
    });
}

// Create an entry and attach files if there are any
async function createEntry({ model, entry }) {
  try {
    // Actually create the entry in Strapi
    await strapi.documents(`api::${model}.${model}`).create({
      data: entry,
    });
  } catch (error) {
    console.error({ model, entry, error });
  }
}

async function checkFileExistsBeforeUpload(files) {
  const existingFiles = [];
  const uploadedFiles = [];
  const filesCopy = [...files];

  for (const fileName of filesCopy) {
    // Check if the file already exists in Strapi
    const fileWhereName = await strapi.query('plugin::upload.file').findOne({
      where: {
        name: fileName.replace(/\..*$/, ''),
      },
    });

    if (fileWhereName) {
      // File exists, don't upload it
      existingFiles.push(fileWhereName);
    } else {
      // File doesn't exist, upload it
      const fileData = getFileData(fileName);
      const fileNameNoExtension = fileName.split('.').shift();
      const [file] = await uploadFile(fileData, fileNameNoExtension);
      uploadedFiles.push(file);
    }
  }
  const allFiles = [...existingFiles, ...uploadedFiles];
  // If only one file then return only that file
  return allFiles.length === 1 ? allFiles[0] : allFiles;
}

async function updateBlocks(blocks) {
  const updatedBlocks = [];
  for (const block of blocks) {
    if (block.__component === 'shared.media') {
      const uploadedFiles = await checkFileExistsBeforeUpload([block.file]);
      // Copy the block to not mutate directly
      const blockCopy = { ...block };
      // Replace the file name on the block with the actual file
      blockCopy.file = uploadedFiles;
      updatedBlocks.push(blockCopy);
    } else if (block.__component === 'shared.slider') {
      // Get files already uploaded to Strapi or upload new files
      const existingAndUploadedFiles = await checkFileExistsBeforeUpload(block.files);
      // Copy the block to not mutate directly
      const blockCopy = { ...block };
      // Replace the file names on the block with the actual files
      blockCopy.files = existingAndUploadedFiles;
      // Push the updated block
      updatedBlocks.push(blockCopy);
    } else {
      // Just push the block as is
      updatedBlocks.push(block);
    }
  }

  return updatedBlocks;
}

async function importArticles() {
  for (const article of articles) {
    const cover = await checkFileExistsBeforeUpload([`${article.slug}.jpg`]);
    const updatedBlocks = await updateBlocks(article.blocks);

    await createEntry({
      model: 'article',
      entry: {
        ...article,
        cover,
        blocks: updatedBlocks,
        // Make sure it's not a draft
        publishedAt: Date.now(),
      },
    });
  }
}

async function importGlobal() {
  const favicon = await checkFileExistsBeforeUpload(['favicon.png']);
  const shareImage = await checkFileExistsBeforeUpload(['default-image.png']);
  
  // Add default global quotes
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
  
  return createEntry({
    model: 'global',
    entry: {
      ...global,
      favicon,
      // Make sure it's not a draft
      publishedAt: Date.now(),
      globalQuotes: defaultGlobalQuotes,
      defaultSeo: {
        ...global.defaultSeo,
        shareImage,
      },
    },
  });
}

async function importAbout() {
  const updatedBlocks = await updateBlocks(about.blocks);

  await createEntry({
    model: 'about',
    entry: {
      ...about,
      blocks: updatedBlocks,
      // Make sure it's not a draft
      publishedAt: Date.now(),
    },
  });
}

// Create or complete a default Footer single-type entry
async function importFooter() {
  try {
    const existing = await strapi.db.query('api::footer.footer').findMany({ limit: 1 });

    const defaultSections = [
      {
        title: 'Explore',
        links: [
          { label: 'Devotional Stories', url: '/devotional-stories', newTab: false, ariaLabel: 'Explore Devotional Stories' },
          { label: 'Divine Miracles', url: '/divine-miracles', newTab: false, ariaLabel: 'Explore Divine Miracles' },
          { label: 'Sacred Festivals', url: '/sacred-festivals', newTab: false, ariaLabel: 'Explore Sacred Festivals' }
        ]
      },
      {
        title: 'About',
        links: [
          { label: 'About', url: '/about', newTab: false, ariaLabel: 'About Jagannath Tales' },
          { label: 'Contact', url: '/contact', newTab: false, ariaLabel: 'Contact us' },
          { label: 'Privacy Policy', url: '/privacy-policy', newTab: false, ariaLabel: 'Privacy policy' },
          { label: 'Terms of Use', url: '/terms-of-use', newTab: false, ariaLabel: 'Terms of use' },
          { label: 'Sitemap', url: '/sitemap.xml', newTab: false, ariaLabel: 'Sitemap' }
        ]
      }
    ];

    const defaultConnect = {
      connectTitle: 'Connect',
      connectDescription:
        'Receive updates on new stories, upcoming festivals, and exclusive content.',
      subscriptionForm: {
        emailPattern: '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$',
        buttonText: 'Subscribe',
        placeholder: 'Your email address'
      },
      socialLinks: [
        { label: 'Twitter', url: 'https://twitter.com/jagannathtales', icon: 'x' },
        { label: 'Facebook', url: 'https://facebook.com/jagannathtales', icon: 'facebook' },
        { label: 'Instagram', url: 'https://instagram.com/jagannathtales', icon: 'instagram' },
        { label: 'YouTube', url: 'https://youtube.com/@jagannathtales', icon: 'youtube' }
      ]
    };

    if (!existing || existing.length === 0) {
      await createEntry({
        model: 'footer',
        entry: {
          sections: defaultSections,
          ...defaultConnect,
          publishedAt: Date.now()
        }
      });
      console.log('Seeded default footer');
      return;
    }

    const footer = existing[0];
    const patch = {};
    if (!footer.sections || footer.sections.length === 0) patch.sections = defaultSections;
    if (!footer.connectTitle) patch.connectTitle = defaultConnect.connectTitle;
    if (!footer.connectDescription) patch.connectDescription = defaultConnect.connectDescription;
    if (!footer.subscriptionForm) patch.subscriptionForm = defaultConnect.subscriptionForm;
    if (!footer.socialLinks || footer.socialLinks.length === 0) patch.socialLinks = defaultConnect.socialLinks;

    if (Object.keys(patch).length > 0) {
      await strapi.documents('api::footer.footer').update({
        documentId: footer.id,
        data: patch
      });
      console.log('Updated footer with missing fields');
    } else {
      console.log('Footer already complete, no updates applied');
    }
  } catch (err) {
    console.error('Failed to seed footer:', err.message || err);
  }
}

// Create or complete a default Navigation Header single-type entry
async function importNavigationHeader() {
  try {
    const existing = await strapi.db.query('api::navigation-header.navigation-header').findMany({ limit: 1 });

    const defaultLinks = [
      { label: 'Home', url: '/', newTab: false, ariaLabel: 'Home' },
      { label: 'Devotional Stories', url: '/devotional-stories', newTab: false, ariaLabel: 'Devotional Stories' },
      { label: 'Divine Miracles', url: '/divine-miracles', newTab: false, ariaLabel: 'Divine Miracles' },
      { label: 'Sacred Festivals', url: '/sacred-festivals', newTab: false, ariaLabel: 'Sacred Festivals' },
      { label: 'About', url: '/about', newTab: false, ariaLabel: 'About' },
      { label: 'Contact', url: '/contact', newTab: false, ariaLabel: 'Contact' },
    ];

    const defaults = {
      siteTitle: 'Jagannath Tales',
      siteTagline: 'Divine Stories of Lord Jagannath',
      links: defaultLinks,
    };

    if (!existing || existing.length === 0) {
      await createEntry({
        model: 'navigation-header',
        entry: { ...defaults, publishedAt: Date.now() },
      });
      console.log('Seeded default navigation header');
      return;
    }

    const header = existing[0];
    const patch = {};
    if (!header.siteTitle) patch.siteTitle = defaults.siteTitle;
    if (!header.siteTagline) patch.siteTagline = defaults.siteTagline;
    if (!header.links || header.links.length === 0) patch.links = defaults.links;

    if (Object.keys(patch).length > 0) {
      await strapi.documents('api::navigation-header.navigation-header').update({
        documentId: header.id,
        data: patch,
      });
      console.log('Updated navigation header with missing fields');
    } else {
      console.log('Navigation header already complete, no updates applied');
    }
  } catch (err) {
    console.error('Failed to seed navigation header:', err.message || err);
  }
}

async function importCategories() {
  for (const category of categories) {
    await createEntry({ model: 'category', entry: category });
  }
}

async function importAuthors() {
  for (const author of authors) {
    const avatar = await checkFileExistsBeforeUpload([author.avatar]);

    await createEntry({
      model: 'author',
      entry: {
        ...author,
        avatar,
      },
    });
  }
}

async function importSeedData() {
  // Allow read of application content types
  await setPublicPermissions({
    article: ['find', 'findOne'],
    category: ['find', 'findOne'],
    author: ['find', 'findOne'],
    global: ['find', 'findOne'],
    about: ['find', 'findOne'],
    footer: ['find'],
    'navigation-header': ['find'],
  });

  // Create all entries
  await importCategories();
  await importAuthors();
  await importArticles();
  await importGlobal();
  await importAbout();
  await importFooter();
  await importNavigationHeader();
}

async function main() {
  const { createStrapi, compileStrapi } = require('@strapi/strapi');

  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();

  app.log.level = 'error';

  await seedExampleApp();
  await app.destroy();

  process.exit(0);
}


module.exports = async () => {
  await seedExampleApp();
};
