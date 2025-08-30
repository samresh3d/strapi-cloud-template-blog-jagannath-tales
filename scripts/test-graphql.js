const fetch = require('node-fetch');

// GraphQL query
const query = `
query {
  articles {
    data {
      id
      attributes {
        title
        slug
        description
        publishedAt
      }
    }
  }
}
`;

async function fetchGraphQL() {
  try {
    const response = await fetch('http://localhost:1337/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // If your API requires authentication, add your token here:
        // 'Authorization': 'Bearer YOUR_API_TOKEN'
      },
      body: JSON.stringify({ query })
    });

    const data = await response.json();
    console.log('Articles data:');
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error fetching GraphQL data:', error);
  }
}

fetchGraphQL();
