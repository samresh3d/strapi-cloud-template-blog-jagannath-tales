/**
 * Schema-Based Seed Generator for Strapi
 * 
 * This script uses the extracted schema to generate seeding operations
 * for all content types in your Strapi application.
 * 
 * Usage:
 * node scripts/generate-seed-script.js
 */

const fs = require('fs');
const path = require('path');
const { extractSchemas } = require('./extract-schemas');

// Configuration
const OUTPUT_DIR = path.join(__dirname, '..', 'database', 'seeders', 'generated');
const SCHEMAS_FILE = path.join(__dirname, '..', 'schemas.json');

// Main function to generate seed scripts
async function generateSeedScripts() {
  try {
    console.log('🌱 Starting seed script generation...');
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    
    // Extract schemas or use existing file if available
    let schemas;
    if (fs.existsSync(SCHEMAS_FILE)) {
      console.log('Using existing schemas file');
      schemas = JSON.parse(fs.readFileSync(SCHEMAS_FILE, 'utf8'));
    } else {
      console.log('Extracting schemas...');
      schemas = await extractSchemas();
    }
    
    console.log(`Processing ${schemas.length} content types`);
    
    // Generate main seed script that imports all individual seeders
    generateMainSeedScript(schemas);
    
    // Generate individual seed scripts for each content type
    schemas.forEach(schema => {
      generateSeedScriptForContentType(schema);
    });
    
    console.log('✅ Seed script generation complete!');
    
  } catch (error) {
    console.error('❌ Error generating seed scripts:', error);
    throw error;
  }
}

// Generate the main seed script that imports all individual seeders
function generateMainSeedScript(schemas) {
  const mainSeedScriptPath = path.join(OUTPUT_DIR, 'seed-all.js');
  
  let imports = [];
  let functionCalls = [];
  
  schemas.forEach(schema => {
    const functionName = `seed${capitalizeFirstLetter(schema.contentType)}`;
    const fileName = `seed-${schema.contentType}.js`;
    imports.push(`const { ${functionName} } = require('./${fileName}');`);
    functionCalls.push(`  await ${functionName}();`);
  });
  
  const mainSeedScriptContent = `/**
 * Main Seed Script for All Content Types
 * 
 * This script imports and executes all individual seed scripts
 * to populate the database with initial data for all content types.
 * 
 * Generated on: ${new Date().toISOString()}
 */

// Import necessary dependencies
const axios = require('axios');

// Import all seed functions
${imports.join('\n')}

// Configuration
const API_URL = 'http://localhost:1337/api';
const API_TOKEN = process.env.STRAPI_API_TOKEN || 'YOUR_API_TOKEN_HERE'; // Use environment variable or replace with your token

/**
 * Main seeding function
 */
async function seedAll() {
  try {
    console.log('🌱 Starting main seeding process...');
    
    // Verify Strapi server is running
    try {
      await axios.get('http://localhost:1337');
    } catch (error) {
      console.error('❌ Cannot connect to Strapi server. Is it running?');
      console.error('Error:', error.message);
      return;
    }
    
    // Execute all seed functions in appropriate order
    // Note: Order matters due to relationships between content types
${functionCalls.join('\n')}
    
    console.log('✅ All seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding process failed:', error.message);
  }
}

// Run the seeding function if this script is executed directly
if (require.main === module) {
  seedAll();
}

module.exports = {
  seedAll
};`;

  fs.writeFileSync(mainSeedScriptPath, mainSeedScriptContent);
  console.log(`✅ Generated main seed script: ${mainSeedScriptPath}`);
}

// Generate a seed script for a specific content type
function generateSeedScriptForContentType(schema) {
  const { contentType, endpoint, displayName, schema: schemaFields } = schema;
  
  const fileName = `seed-${contentType}.js`;
  const filePath = path.join(OUTPUT_DIR, fileName);
  
  // Generate example data
  const exampleData = generateExampleDataForSchema(schemaFields);
  
  // Create the content of the seed script
  const seedScriptContent = `/**
 * Seed Script for ${displayName} (${contentType})
 * 
 * This script populates the database with initial data for ${displayName}.
 * Endpoint: ${endpoint}
 * 
 * Generated on: ${new Date().toISOString()}
 */

// Import necessary dependencies
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const API_URL = 'http://localhost:1337/api';
const API_TOKEN = process.env.STRAPI_API_TOKEN || 'YOUR_API_TOKEN_HERE'; // Use environment variable or replace with your token

// Sample data for ${displayName}
const ${contentType}Data = [
  ${JSON.stringify(exampleData, null, 4)}
];

/**
 * Seed function for ${displayName}
 */
async function seed${capitalizeFirstLetter(contentType)}() {
  try {
    console.log('🌱 Starting ${displayName} seeding process...');
    
    // Check if entries already exist to avoid duplicates
    try {
      const response = await axios.get(\`\${API_URL}${endpoint}\`, {
        headers: {
          Authorization: \`Bearer \${API_TOKEN}\`
        }
      });
      
      if (response.data.data && response.data.data.length > 0) {
        console.log(\`Found \${response.data.data.length} existing ${displayName} entries\`);
        // Uncomment the next line if you want to skip seeding when entries exist
        // return console.log('Skipping ${displayName} seeding as entries already exist');
      }
    } catch (error) {
      console.log(\`No existing ${displayName} entries found or couldn't access API\`);
    }
    
    // Create new entries
    for (const entryData of ${contentType}Data) {
      try {
        const response = await axios.post(
          \`\${API_URL}${endpoint}\`,
          { data: entryData },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': \`Bearer \${API_TOKEN}\`
            }
          }
        );
        
        console.log(\`✅ Created ${displayName}: \${response.data.data.id}\`);
      } catch (error) {
        console.error(\`❌ Failed to create ${displayName}:\`, error.message);
        if (error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response data:', error.response.data);
        }
      }
    }
    
    console.log(\`✅ ${displayName} seeding completed\`);
  } catch (error) {
    console.error(\`❌ ${displayName} seeding process failed:\`, error.message);
    throw error;
  }
}

// Run the seeding function if this script is executed directly
if (require.main === module) {
  seed${capitalizeFirstLetter(contentType)}();
}

module.exports = {
  seed${capitalizeFirstLetter(contentType)}
};`;

  fs.writeFileSync(filePath, seedScriptContent);
  console.log(`✅ Generated seed script for ${displayName}: ${filePath}`);
}

// Generate example data based on schema fields
function generateExampleDataForSchema(schemaFields) {
  const exampleData = {};
  
  for (const [fieldName, fieldConfig] of Object.entries(schemaFields)) {
    // Skip system fields
    if (['id', 'createdAt', 'updatedAt', 'publishedAt'].includes(fieldName)) {
      continue;
    }
    
    switch (fieldConfig.type) {
      case 'string':
        exampleData[fieldName] = `Example ${fieldName}`;
        break;
        
      case 'text':
        exampleData[fieldName] = `This is an example ${fieldName} with multiple sentences. It demonstrates what the content might look like.`;
        break;
        
      case 'richtext':
        exampleData[fieldName] = `# Example ${fieldName}\n\nThis is a rich text field with **bold** and *italic* formatting.`;
        break;
        
      case 'integer':
      case 'number':
        exampleData[fieldName] = 42;
        break;
        
      case 'float':
      case 'decimal':
        exampleData[fieldName] = 42.5;
        break;
        
      case 'boolean':
        exampleData[fieldName] = true;
        break;
        
      case 'date':
        exampleData[fieldName] = '2025-08-30';
        break;
        
      case 'datetime':
        exampleData[fieldName] = new Date().toISOString();
        break;
        
      case 'email':
        exampleData[fieldName] = 'example@example.com';
        break;
        
      case 'enumeration':
        if (fieldConfig.enum && fieldConfig.enum.length > 0) {
          exampleData[fieldName] = fieldConfig.enum[0];
        } else {
          exampleData[fieldName] = 'example-enum';
        }
        break;
        
      case 'uid':
        exampleData[fieldName] = `example-${fieldName}-uid`;
        break;
        
      case 'relation':
        // For relations, we'll just reference IDs that should be created by other seeders
        if (fieldConfig.relation.includes('ToMany')) {
          exampleData[fieldName] = [1];
        } else {
          exampleData[fieldName] = 1;
        }
        break;
        
      case 'media':
        // For media, we'll just reference IDs that should be uploaded separately
        if (fieldConfig.multiple) {
          exampleData[fieldName] = [1];
        } else {
          exampleData[fieldName] = 1;
        }
        break;
        
      case 'component':
        // For components, we'll create a simple object
        exampleData[fieldName] = {};
        break;
        
      case 'dynamiczone':
        // For dynamic zones, we'll create an array with one component
        if (fieldConfig.components && fieldConfig.components.length > 0) {
          exampleData[fieldName] = [
            {
              __component: fieldConfig.components[0],
              // Add basic fields for the first component type
              title: 'Example Component Title',
              content: 'Example component content'
            }
          ];
        }
        break;
        
      default:
        exampleData[fieldName] = null;
    }
  }
  
  return exampleData;
}

// Helper function to capitalize the first letter of a string
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Execute the script if run directly
if (require.main === module) {
  generateSeedScripts().catch(error => {
    console.error('Script execution failed:', error);
    process.exit(1);
  });
}

module.exports = {
  generateSeedScripts
};
