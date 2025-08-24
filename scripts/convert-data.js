/**
 * Data Conversion Script for Strapi Import
 * 
 * This script converts your existing JSON data structure to a Strapi-compliant format
 * that can be imported into your Strapi application.
 * 
 * Usage:
 * - Add this file to your project's scripts directory
 * - Run using: node scripts/convert-data.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

// Source and target directories
const SOURCE_DIR = path.join(__dirname, '../data/json-data');
const TARGET_DIR = path.join(__dirname, '../data/strapi-import');

// Ensure target directory exists
if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

// Convert authors data
function convertAuthorsData() {
  console.log('Converting authors data...');
  
  // Read authors data
  const authorsData = JSON.parse(fs.readFileSync(path.join(SOURCE_DIR, 'authors.json'), 'utf8'));
  
  // Convert to Strapi format
  const strapiAuthors = {
    data: authorsData.authors.map(author => ({
      name: author.name,
      slug: author.slug,
      bio: author.bio,
      // The image field will need proper handling in Strapi
      // For now, we'll just record the path
      image: {
        data: {
          attributes: {
            name: author.image.split('/').pop(),
            alternativeText: author.name,
            url: author.image
          }
        }
      },
      social: {
        twitter: author.social?.twitter || null,
        linkedin: author.social?.linkedin || null,
        facebook: author.social?.facebook || null
      }
    }))
  };
  
  // Write to target file
  fs.writeFileSync(
    path.join(TARGET_DIR, 'authors.json'),
    JSON.stringify(strapiAuthors, null, 2),
    'utf8'
  );
  
  console.log('Authors data converted successfully.');
}

// Convert pages data
function convertPagesData() {
  console.log('Converting pages data...');
  
  // Read pages data
  const pagesData = JSON.parse(fs.readFileSync(path.join(SOURCE_DIR, 'pages.json'), 'utf8'));
  
  // Define page mapping
  const pageMappings = {
    devotions: 'Devotions Page',
    miracles: 'Miracles Page',
    festivals: 'Festivals Page',
    about: 'About Jagannath Tales',
    contact: 'Contact Us',
    authors: 'Our Authors'
  };
  
  // Convert to Strapi format
  const strapiPages = {
    data: Object.entries(pageMappings).map(([key, title]) => {
      const pageData = pagesData[key];
      
      // Skip if no data found
      if (!pageData) return null;
      
      // Generate dynamic content based on page data
      const content = [];
      
      // Add page title
      content.push({
        __component: 'shared.heading',
        text: pageData.title || pageData.headerTitle || title,
        level: 1
      });
      
      // Add intro content if available
      if (pageData.intro) {
        content.push({
          __component: 'shared.rich-text',
          body: `<p>${pageData.intro}</p>`
        });
      }
      
      // Add about content if available (specific to about page)
      if (pageData.about) {
        content.push({
          __component: 'shared.rich-text',
          body: pageData.about
        });
      }
      
      // Add mission section if available (specific to about page)
      if (pageData.mission) {
        content.push({
          __component: 'shared.heading',
          text: pageData.mission,
          level: 2
        });
        
        if (pageData.missionText) {
          content.push({
            __component: 'shared.rich-text',
            body: `<p>${pageData.missionText}</p>`
          });
        }
      }
      
      return {
        title: title,
        slug: key,
        description: pageData.description || pageData.pageDescription || '',
        content: content,
        seo: {
          metaTitle: pageData.pageTitle || pageData.title || title,
          metaDescription: pageData.description || pageData.pageDescription || ''
        }
      };
    }).filter(Boolean) // Remove null entries
  };
  
  // Write to target file
  fs.writeFileSync(
    path.join(TARGET_DIR, 'pages.json'),
    JSON.stringify(strapiPages, null, 2),
    'utf8'
  );
  
  console.log('Pages data converted successfully.');
}

// Convert site config data
function convertSiteConfigData() {
  console.log('Converting site config data...');
  
  // Read site data
  const siteData = JSON.parse(fs.readFileSync(path.join(SOURCE_DIR, 'site.json'), 'utf8'));
  
  // Convert to Strapi format
  const strapiSiteConfig = {
    data: {
      siteTitle: siteData.siteInfo.title,
      siteTagline: siteData.siteInfo.tagline,
      siteDescription: siteData.siteInfo.description,
      contactEmail: siteData.siteInfo.contactEmail,
      copyright: siteData.siteInfo.copyright,
      navigation: {
        mainMenu: siteData.navigation.main.map(item => ({
          label: item.label,
          url: item.path,
          ariaLabel: item.ariaLabel
        })),
        footerMenu: siteData.navigation.footer.map(item => ({
          label: item.label,
          url: item.path,
          ariaLabel: item.ariaLabel
        }))
      },
      socialLinks: siteData.socialLinks?.map(link => ({
        platform: link.platform,
        url: link.url,
        ariaLabel: link.ariaLabel
      })) || [],
      seo: {
        metaTitle: siteData.seo?.metaTitle || siteData.siteInfo.title,
        metaDescription: siteData.seo?.metaDescription || siteData.siteInfo.description
      }
    }
  };
  
  // Write to target file
  fs.writeFileSync(
    path.join(TARGET_DIR, 'site-config.json'),
    JSON.stringify(strapiSiteConfig, null, 2),
    'utf8'
  );
  
  console.log('Site config data converted successfully.');
}

// Main execution
try {
  console.log('Starting data conversion for Strapi import...');
  
  convertAuthorsData();
  convertPagesData();
  convertSiteConfigData();
  
  // Add more conversion functions as needed
  
  console.log('Data conversion completed successfully!');
  console.log(`Converted data files available in: ${TARGET_DIR}`);
} catch (error) {
  console.error('Error converting data:', error);
  process.exit(1);
}
