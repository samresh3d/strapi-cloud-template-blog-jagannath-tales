# Development Environment Setup

This Strapi project is configured to work with both SQLite (local development) and PostgreSQL (Strapi Cloud) databases.

## Database Configuration

The database connection is configured in `config/database.js` and uses environment variables to determine which database to use.

### Local Development with SQLite

For local development, the project uses SQLite by default. To ensure you're using SQLite locally:

1. Make sure your `.env` file has `DB_CLIENT=sqlite` (created by default)
2. Run the development server:

```bash
# Using npm script
npm run dev

# OR using convenience scripts
# On Unix/Mac
./start-dev.sh
# On Windows
start-dev.bat
```

This will:
- Clean up any existing build artifacts
- Start the development server with SQLite
- Create a `data.db` file in the project root (this file is gitignored)

### Strapi Cloud with PostgreSQL

When deploying to Strapi Cloud, the environment will have `DB_CLIENT=postgres` and the appropriate PostgreSQL connection details set.

No manual configuration is needed for cloud deployment - the application will automatically use the PostgreSQL database when deployed.

## Managing Environment Variables

- `.env.example` - Template showing required variables
- `.env` - Your local development environment (already gitignored)

To add new environment variables:
1. Add them to your `.env` file for local testing
2. Add them to `.env.example` as a reference for other developers
3. Add them to your Strapi Cloud environment variables if needed for production

## Cleaning Build Artifacts

If you need to clean the project:

```bash
# Clean development files including database
npm run clean:dev

# Clean only build artifacts (keep database)
npm run clean
```
