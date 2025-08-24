/**
 * Script to convert existing JSON data to unified content format
 */
const fs = require('fs');
const path = require('path');

// Data directory
const dataDir = path.resolve(__dirname, '../data/json-data');

// Output content file
const outputFile = path.join(dataDir, 'content.json');

// Read all source files
const devotionsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'devotions.json'), 'utf8'));
const festivalsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'festivals.json'), 'utf8'));
const miraclesData = JSON.parse(fs.readFileSync(path.join(dataDir, 'miracles.json'), 'utf8'));
const pagesData = JSON.parse(fs.readFileSync(path.join(dataDir, 'pages.json'), 'utf8'));

// Helper function to convert content blocks to Strapi dynamic zone components
function convertContentBlocks(blocks) {
  if (!blocks) return [];
  
  return blocks.map(block => {
    if (block.__component) {
      // Already in Strapi format
      return block;
    }
    
    switch (block.type) {
      case 'paragraph':
        return {
          __component: 'shared.paragraph',
          content: block.text
        };
      case 'heading':
        return {
          __component: 'shared.heading',
          title: block.text,
          level: block.level || 2
        };
      case 'image':
        return {
          __component: 'shared.image',
          image: {
            url: block.src,
            alternativeText: block.alt || ''
          },
          caption: block.caption || ''
        };
      case 'quote':
        return {
          __component: 'shared.quote',
          quote: block.text,
          citation: block.author || ''
        };
      case 'ritual':
        return {
          __component: 'festival.ritual',
          name: block.name,
          description: block.description,
          timing: block.timing
        };
      default:
        return {
          __component: 'shared.rich-text',
          body: block.text || JSON.stringify(block)
        };
    }
  });
}

// Create unified content array
const unifiedContent = {
  data: []
};

// Process devotions
console.log('Processing devotions...');
if (devotionsData.devotions) {
  devotionsData.devotions.forEach(item => {
    unifiedContent.data.push({
      title: item.title,
      slug: item.slug,
      description: item.description,
      contentType: 'devotion',
      author: item.authorId ? { connect: [{ id: item.authorId }] } : null,
      publishDate: item.publishedDate ? new Date(item.publishedDate).toISOString() : null,
      updateDate: item.updatedDate ? new Date(item.updatedDate).toISOString() : null,
      readingTime: item.readingTime,
      featured: item.featured || false,
      featuredImage: item.featuredImage ? {
        name: path.basename(item.featuredImage),
        alternativeText: item.imageAlt || '',
        url: item.featuredImage
      } : null,
      imageAlt: item.imageAlt || '',
      tags: item.tags || [],
      content: convertContentBlocks(item.content),
      seo: {
        metaTitle: item.title,
        metaDescription: item.description,
        keywords: (item.tags || []).join(', ')
      }
    });
  });
}

// Process festivals
console.log('Processing festivals...');
if (festivalsData.festivals) {
  festivalsData.festivals.forEach(item => {
    unifiedContent.data.push({
      title: item.title,
      slug: item.slug,
      description: item.description,
      contentType: 'festival',
      author: item.authorId ? { connect: [{ id: item.authorId }] } : null,
      publishDate: item.publishedDate ? new Date(item.publishedDate).toISOString() : null,
      updateDate: item.updatedDate ? new Date(item.updatedDate).toISOString() : null,
      readingTime: item.readingTime,
      featured: item.featured || false,
      featuredImage: item.featuredImage ? {
        name: path.basename(item.featuredImage),
        alternativeText: item.imageAlt || '',
        url: item.featuredImage
      } : null,
      imageAlt: item.imageAlt || '',
      tags: item.tags || [],
      content: convertContentBlocks(item.content),
      monthCelebrated: item.monthCelebrated,
      duration: item.duration,
      significance: item.significance,
      rituals: item.rituals ? item.rituals.map(ritual => ({
        name: ritual.name,
        description: ritual.description,
        timing: ritual.timing
      })) : [],
      seo: {
        metaTitle: item.title,
        metaDescription: item.description,
        keywords: (item.tags || []).join(', ')
      }
    });
  });
}

// Process miracles
console.log('Processing miracles...');
if (miraclesData.miracles) {
  miraclesData.miracles.forEach(item => {
    unifiedContent.data.push({
      title: item.title,
      slug: item.slug,
      description: item.description,
      contentType: 'miracle',
      author: item.authorId ? { connect: [{ id: item.authorId }] } : null,
      publishDate: item.publishedDate ? new Date(item.publishedDate).toISOString() : null,
      updateDate: item.updatedDate ? new Date(item.updatedDate).toISOString() : null,
      readingTime: item.readingTime,
      featured: item.featured || false,
      featuredImage: item.featuredImage ? {
        name: path.basename(item.featuredImage),
        alternativeText: item.imageAlt || '',
        url: item.featuredImage
      } : null,
      imageAlt: item.imageAlt || '',
      tags: item.tags || [],
      content: convertContentBlocks(item.content),
      seo: {
        metaTitle: item.title,
        metaDescription: item.description,
        keywords: (item.tags || []).join(', ')
      }
    });
  });
}

// Process pages
console.log('Processing pages...');
if (pagesData.data) {
  pagesData.data.forEach(item => {
    if (item.contentType !== 'content') {
      // Only convert regular pages, not special pages
      unifiedContent.data.push({
        title: item.title,
        slug: item.slug,
        description: item.description || '',
        contentType: 'page',
        content: item.content || [],
        seo: item.seo || {
          metaTitle: item.title,
          metaDescription: item.description || ''
        }
      });
    }
  });
}

// Save the unified content
fs.writeFileSync(outputFile, JSON.stringify(unifiedContent, null, 2));
console.log(`Unified content saved to ${outputFile}`);
