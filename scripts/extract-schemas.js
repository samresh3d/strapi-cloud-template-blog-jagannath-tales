/**
 * Schema Extraction Utility for Strapi
 * 
 * This script extracts schema definitions from Strapi content types
 * and generates a comprehensive JSON representation for use in seeding operations.
 * 
 * Usage:
 * node scripts/extract-schemas.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const API_DIR = path.join(__dirname, '..', 'src', 'api');
const OUTPUT_FILE = path.join(__dirname, '..', 'schemas.json');

// Main function to extract schemas
async function extractSchemas() {
  try {
    console.log('🔍 Starting schema extraction process...');
    const schemas = [];
    
    // Get all directories in the API folder
    const apiDirs = fs.readdirSync(API_DIR).filter(dir => {
      return fs.statSync(path.join(API_DIR, dir)).isDirectory() && dir !== '.gitkeep';
    });
    
    console.log(`Found ${apiDirs.length} potential API endpoints`);
    
    // Process each API endpoint
    for (const apiDir of apiDirs) {
      console.log(`Processing ${apiDir}...`);
      
      // Check if content-types directory exists
      const contentTypesDir = path.join(API_DIR, apiDir, 'content-types');
      if (!fs.existsSync(contentTypesDir)) {
        console.log(`Skipping ${apiDir}: No content-types directory found`);
        continue;
      }
      
      // Find all content type directories
      const contentTypeSubDirs = fs.readdirSync(contentTypesDir);
      
      for (const contentTypeSubDir of contentTypeSubDirs) {
        const schemaPath = path.join(contentTypesDir, contentTypeSubDir, 'schema.json');
        
        if (fs.existsSync(schemaPath)) {
          try {
            const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
            
            // Extract endpoint information
            const endpoint = `/api/${schema.info.pluralName}`;
            const schemaInfo = extractSchemaInfo(schema);
            
            schemas.push({
              endpoint,
              contentType: schema.info.singularName,
              displayName: schema.info.displayName,
              description: schema.info.description || '',
              kind: schema.kind,
              schema: schemaInfo
            });
            
            console.log(`✅ Extracted schema for ${endpoint}`);
          } catch (err) {
            console.error(`Error processing schema for ${contentTypeSubDir}:`, err.message);
          }
        }
      }
    }
    
    // Save the schemas to the output file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(schemas, null, 2));
    console.log(`✅ Schema extraction complete! Saved to ${OUTPUT_FILE}`);
    
    // Print summary
    console.log('\n🔢 Summary:');
    console.log(`Total APIs processed: ${schemas.length}`);
    schemas.forEach(schema => {
      console.log(`- ${schema.endpoint} (${Object.keys(schema.schema).length} fields)`);
    });
    
    return schemas;
  } catch (error) {
    console.error('❌ Error extracting schemas:', error);
    throw error;
  }
}

// Helper function to extract schema information from a content type
function extractSchemaInfo(schema) {
  const schemaInfo = {};
  const attributes = schema.attributes || {};
  
  // Process each attribute
  for (const [fieldName, fieldConfig] of Object.entries(attributes)) {
    let fieldInfo;
    
    switch (fieldConfig.type) {
      case 'relation':
        fieldInfo = {
          type: 'relation',
          relation: fieldConfig.relation,
          target: fieldConfig.target,
          targetModel: fieldConfig.target.split('.').pop(),
          inversedBy: fieldConfig.inversedBy,
          mappedBy: fieldConfig.mappedBy
        };
        break;
        
      case 'component':
        fieldInfo = {
          type: 'component',
          component: fieldConfig.component,
          repeatable: !!fieldConfig.repeatable
        };
        break;
        
      case 'dynamiczone':
        fieldInfo = {
          type: 'dynamiczone',
          components: fieldConfig.components
        };
        break;
        
      case 'media':
        fieldInfo = {
          type: 'media',
          multiple: !!fieldConfig.multiple,
          allowedTypes: fieldConfig.allowedTypes
        };
        break;
        
      default:
        fieldInfo = {
          type: fieldConfig.type
        };
    }
    
    // Add common field properties
    if (fieldConfig.required) fieldInfo.required = true;
    if (fieldConfig.default !== undefined) fieldInfo.default = fieldConfig.default;
    if (fieldConfig.min !== undefined) fieldInfo.min = fieldConfig.min;
    if (fieldConfig.max !== undefined) fieldInfo.max = fieldConfig.max;
    if (fieldConfig.enum) fieldInfo.enum = fieldConfig.enum;
    if (fieldConfig.regex) fieldInfo.regex = fieldConfig.regex;
    if (fieldConfig.targetField) fieldInfo.targetField = fieldConfig.targetField;
    
    schemaInfo[fieldName] = fieldInfo;
  }
  
  // Add system fields
  schemaInfo.id = { type: 'number' };
  
  if (schema.options && schema.options.draftAndPublish) {
    schemaInfo.publishedAt = { type: 'datetime' };
  }
  
  schemaInfo.createdAt = { type: 'datetime' };
  schemaInfo.updatedAt = { type: 'datetime' };
  
  return schemaInfo;
}

// Helper function to extract component schemas
function extractComponentSchemas() {
  const COMPONENTS_DIR = path.join(__dirname, '..', 'src', 'components');
  const componentSchemas = {};
  
  if (!fs.existsSync(COMPONENTS_DIR)) {
    console.log('No components directory found, skipping component schema extraction');
    return componentSchemas;
  }
  
  // Get all component category directories
  const componentCategories = fs.readdirSync(COMPONENTS_DIR).filter(dir => {
    return fs.statSync(path.join(COMPONENTS_DIR, dir)).isDirectory();
  });
  
  for (const category of componentCategories) {
    const categoryDir = path.join(COMPONENTS_DIR, category);
    
    // Read all component files in this category
    const componentFiles = fs.readdirSync(categoryDir).filter(file => file.endsWith('.json'));
    
    for (const componentFile of componentFiles) {
      try {
        const componentPath = path.join(categoryDir, componentFile);
        const componentSchema = JSON.parse(fs.readFileSync(componentPath, 'utf8'));
        const componentName = `${category}.${path.basename(componentFile, '.json')}`;
        
        componentSchemas[componentName] = {
          info: componentSchema.info,
          attributes: extractSchemaInfo({ attributes: componentSchema.attributes })
        };
        
        console.log(`✅ Extracted component schema for ${componentName}`);
      } catch (err) {
        console.error(`Error processing component ${componentFile}:`, err.message);
      }
    }
  }
  
  // Save the component schemas to a separate file
  const outputFile = path.join(__dirname, '..', 'component-schemas.json');
  fs.writeFileSync(outputFile, JSON.stringify(componentSchemas, null, 2));
  console.log(`✅ Component schema extraction complete! Saved to ${outputFile}`);
  
  return componentSchemas;
}

// Generate example seed data based on schema
function generateExampleSeedData(schemas) {
  const seedData = {};
  
  for (const apiSchema of schemas) {
    const { contentType, schema } = apiSchema;
    seedData[contentType] = generateExampleForContentType(schema);
  }
  
  // Save the example seed data to a file
  const outputFile = path.join(__dirname, '..', 'example-seed-data.json');
  fs.writeFileSync(outputFile, JSON.stringify(seedData, null, 2));
  console.log(`✅ Example seed data generated! Saved to ${outputFile}`);
  
  return seedData;
}

// Generate example data for a content type
function generateExampleForContentType(schema) {
  const example = {};
  
  for (const [fieldName, fieldConfig] of Object.entries(schema)) {
    // Skip system fields
    if (['id', 'createdAt', 'updatedAt', 'publishedAt'].includes(fieldName)) {
      continue;
    }
    
    switch (fieldConfig.type) {
      case 'string':
        example[fieldName] = `Example ${fieldName}`;
        break;
        
      case 'text':
        example[fieldName] = `This is an example ${fieldName} with multiple sentences. It demonstrates what the content might look like.`;
        break;
        
      case 'richtext':
        example[fieldName] = `# Example ${fieldName}\n\nThis is a rich text field with **bold** and *italic* formatting.`;
        break;
        
      case 'integer':
      case 'number':
        example[fieldName] = 42;
        break;
        
      case 'float':
      case 'decimal':
        example[fieldName] = 42.5;
        break;
        
      case 'boolean':
        example[fieldName] = true;
        break;
        
      case 'date':
        example[fieldName] = '2025-08-30';
        break;
        
      case 'datetime':
        example[fieldName] = new Date().toISOString();
        break;
        
      case 'email':
        example[fieldName] = 'example@example.com';
        break;
        
      case 'enumeration':
        if (fieldConfig.enum && fieldConfig.enum.length > 0) {
          example[fieldName] = fieldConfig.enum[0];
        } else {
          example[fieldName] = 'example-enum';
        }
        break;
        
      case 'uid':
        example[fieldName] = `example-${fieldName}-uid`;
        break;
        
      case 'relation':
        if (fieldConfig.relation.startsWith('many')) {
          example[fieldName] = [1];
        } else {
          example[fieldName] = 1;
        }
        break;
        
      case 'media':
        if (fieldConfig.multiple) {
          example[fieldName] = [1];
        } else {
          example[fieldName] = 1;
        }
        break;
        
      case 'component':
        example[fieldName] = { /* Component fields would go here */ };
        break;
        
      case 'dynamiczone':
        example[fieldName] = [
          {
            __component: fieldConfig.components ? fieldConfig.components[0] : 'example.component',
            /* Component fields would go here */
          }
        ];
        break;
        
      default:
        example[fieldName] = null;
    }
  }
  
  return example;
}

// Execute the script if run directly
if (require.main === module) {
  (async () => {
    try {
      const schemas = await extractSchemas();
      const componentSchemas = extractComponentSchemas();
      generateExampleSeedData(schemas);
    } catch (error) {
      console.error('Script execution failed:', error);
      process.exit(1);
    }
  })();
}

module.exports = {
  extractSchemas,
  extractComponentSchemas,
  generateExampleSeedData
};
