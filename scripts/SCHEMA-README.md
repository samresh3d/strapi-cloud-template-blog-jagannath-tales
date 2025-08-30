# Strapi Schema Extraction Utility

This utility extracts schema definitions from your Strapi project's content types and generates comprehensive JSON schema representations for use in seeding operations.

## Features

- Automatically scans all API endpoints in the `src/api` directory
- Extracts schema information from each content type
- Generates a JSON representation of all schemas
- Creates example seed data based on extracted schemas
- Includes component schemas for complete data modeling

## Output Files

The script generates three files:

1. `schemas.json` - Contains the complete schema definitions for all content types
2. `component-schemas.json` - Contains schema definitions for all components
3. `example-seed-data.json` - Contains example seed data based on the schemas

## Usage

### Running the Script

```bash
node scripts/extract-schemas.js
```

### Using the Output for Seeding

You can use the generated schema files for various purposes:

1. **Understanding Data Structure**: Explore the structure of your content types and their relationships
2. **Generating Test Data**: Use the example seed data as a starting point for creating test data
3. **Creating Database Seeders**: Build seeders that respect the constraints of your data model
4. **API Documentation**: Use the schema information to document your API endpoints
5. **Form Generation**: Generate forms based on your data model

## Schema Format

The generated schema follows this structure:

```json
[
  {
    "endpoint": "/api/articles",
    "contentType": "article",
    "displayName": "Article",
    "description": "A blog post or other piece of content.",
    "kind": "collectionType",
    "schema": {
      "title": {
        "type": "string",
        "required": true
      },
      "slug": {
        "type": "uid",
        "targetField": "title",
        "required": true
      },
      // Other fields...
      "id": {
        "type": "number"
      },
      "createdAt": {
        "type": "datetime"
      },
      "updatedAt": {
        "type": "datetime"
      }
    }
  }
]
```

## Example Seed Data Format

The example seed data provides a starting point for creating realistic test data:

```json
{
  "article": {
    "title": "Example title",
    "slug": "example-title-uid",
    "description": "This is an example description with multiple sentences. It demonstrates what the content might look like.",
    // Other fields with appropriate example values...
  }
}
```

## Extending the Utility

You can extend this utility by:

1. Adding support for custom field types
2. Implementing more advanced example data generation
3. Creating automated seeding scripts based on the generated schemas
4. Building validation tools that use the schema definitions

## Troubleshooting

If you encounter issues:

1. Ensure all schema.json files are valid JSON
2. Check that your project structure follows Strapi conventions
3. Verify that you have the necessary permissions to read the files
4. Check for any customizations in your Strapi configuration that might affect schema extraction

## License

MIT
