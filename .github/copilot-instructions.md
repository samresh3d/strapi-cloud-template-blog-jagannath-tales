# AI Coding Agent Instructions for Jagannath Tales Codebase

## Overview
This project is a Strapi-based CMS for managing content related to Jagannath Tales. It uses SQLite as the database and includes custom content types, components, and seeding scripts for initial data population.

## Architecture
- **Content Types**: Defined under `src/api/<content-type>/content-types/<content-type>/schema.json`. Examples include `article`, `author`, and `category`.
- **Dynamic Zones**: Articles use dynamic zones to include flexible content blocks like headings, paragraphs, and quotes.
- **Components**: Reusable content blocks are defined in `src/components/`.
- **Seeding**: Initial data is populated using `database/seeders/seedData.js`.
- **Admin Panel**: The admin panel is built using `npm run build` and served via Strapi.

## Developer Workflows
### Starting the Application
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the Strapi server in development mode:
   ```bash
   npm run develop
   ```

### Seeding the Database
1. Ensure the Strapi server is running.
2. Run the seeding script:
   ```bash
   node database/seeders/seedData.js
   ```

### Building the Admin Panel
```bash
npm run build
```

### Debugging
- Use detailed logs in `seedData.js` to debug API requests.
- Check the `logs` directory for server logs.

## Project-Specific Conventions
- **Content Type Slugs**: Use kebab-case for slugs (e.g., `devotional-stories`).
- **Dynamic Zone Components**: Follow the naming convention `story.<component-name>` (e.g., `story.heading`).
- **API Token Authentication**: Use a static API token for authentication in scripts.

## Integration Points
- **Database**: SQLite database located at `.tmp/data.db`.
- **API**: REST API endpoints are available at `http://localhost:1337/api`.
- **Admin Panel**: Accessible at `http://localhost:1337/admin`.

## External Dependencies
- **Axios**: Used for making HTTP requests in scripts.
- **Strapi**: Headless CMS framework.

## Examples
### Adding a New Content Type
1. Create a new folder under `src/api/<content-type>`.
2. Define the schema in `content-types/<content-type>/schema.json`.
3. Add controllers, services, and routes as needed.

### Adding a New Component
1. Create a new JSON file in `src/components/<category>/<component-name>.json`.
2. Reference the component in a dynamic zone or content type schema.

---

For more details, refer to the [Strapi documentation](https://docs.strapi.io).
