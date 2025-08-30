# Strapi Import Data Format Guide

This document explains how to format your JSON data files to be compatible with Strapi's import system.

## Data Structure Requirements

### Collection Types

For collection types (like authors, devotions, miracles, festivals), your JSON files should have this structure:

```json
{
  "data": [
    {
      "attribute1": "value1",
      "attribute2": "value2",
      "relationField": {
        "data": {
          "id": 1
        }
      },
      "componentField": {
        "componentAttribute1": "value1",
        "componentAttribute2": "value2"
      },
      "repeatedComponentField": [
        {
          "componentAttribute1": "value1",
          "componentAttribute2": "value2"
        }
      ],
      "dynamicZoneField": [
        {
          "__component": "component-type.component-name",
          "attribute1": "value1",
          "attribute2": "value2"
        }
      ]
    }
  ]
}
```

### Single Types

For single types (like site-config, global), your JSON files should have this structure:

```json
{
  "data": {
    "attribute1": "value1",
    "attribute2": "value2",
    "relationField": {
      "data": {
        "id": 1
      }
    }
  }
}
```

## Media Fields

Media fields require special handling. You need to define them as follows:

```json
"image": {
  "data": {
    "attributes": {
      "name": "image-name.jpg",
      "alternativeText": "Alt text",
      "caption": "Caption",
      "url": "/uploads/image-name.jpg"
    }
  }
}
```

## Component Fields

Components should be structured as follows:

```json
"componentField": {
  "attribute1": "value1",
  "attribute2": "value2"
}
```

## Dynamic Zone Fields

Dynamic zones require the `__component` field to specify which component type is being used:

```json
"dynamicZone": [
  {
    "__component": "shared.rich-text",
    "body": "<p>Content here</p>"
  },
  {
    "__component": "shared.heading",
    "text": "Heading text",
    "level": 2
  }
]
```

## Using the Data Conversion Tool

To import data into Strapi, you can use the seeding script:

1. Start your Strapi server:
   ```
   npm run develop
   ```

2. In another terminal, run the seed script:
   ```
   npm run seed
   ```

3. This will create sample content in your Strapi instance based on the configuration in the `database/seeders/seedData.js` file.

## Component Definitions

Our project uses the following components:

- `shared.rich-text` - For formatted HTML content
- `shared.heading` - For section headings with level attribute
- `shared.image` - For images with captions
- `shared.quote` - For quoted text
- `shared.list` - For bulleted or numbered lists
- `author.social` - For author social media links

## Relations

Relations need to reference existing content:

```json
"author": {
  "data": {
    "id": 1
  }
}
```

For more detailed information on Strapi's data structure, refer to the [official Strapi documentation](https://docs.strapi.io/cms/backend-customization/models).
