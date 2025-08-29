# Jagannath Tales Seed Script

## Overview

This document explains how to use the seed script to populate your Strapi database with initial data for the Jagannath Tales project.

## Prerequisites

1. Make sure Strapi server is running:
   ```bash
   npm run develop
   ```
2. Ensure you have the right API token configured in `database/seeders/seedData.js`

## Running the Seed Script

Execute the following command:

```bash
npm run seed
```

Or run directly:

```bash
node database/seeders/seedData.js
```

## What the Seed Script Does

1. **Creates/Finds Author**: The script will create an author named "Samresh Pathak" or use an existing one if found.

2. **Sets Up Categories**: The script defines three categories:
   - Devotional Stories
   - Divine Miracles
   - Sacred Festivals

3. **Simulates Article Creation**: The script will outline three articles but won't actually create them in the database due to API limitations:
   - Narada's Divine Test
   - Lord Balabhadra's Divine Protection
   - Goddess Subhadra's Blessing

## Manual Steps Required

After running the seed script, you'll need to:

1. Log in to the Strapi Admin UI at `http://localhost:1337/admin`
2. Create the articles manually using the data provided in the console output

## Troubleshooting

- If you see "Request failed with status code 404" for articles, this is expected as we're only simulating article creation.
- If the author creation fails, check if the `authors` collection type is properly configured and accessible via the API.

## Customization

To add more seed data, edit the arrays in the following functions in `database/seeders/seedData.js`:
- `createAuthor()` - To change author details
- `createCategories()` - To add more categories
- `createArticles()` - To add more articles

Remember to restart the Strapi server after making schema changes before running the seed script.
