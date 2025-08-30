module.exports = () => ({
  graphql: {
    enabled: true,
    config: {
      defaultLimit: 10,
      maxLimit: 100,
    }
  },
  'import-export-entries': {
    enabled: true,
    config: {
      // By default, the serverless image optimization is on
      serverlessImageOptimization: true,
    }
  },
  seo: {
    enabled: true,
  },
  'responsive-image': {
    enabled: true,
    config: {
      formats: ["webp", "jpeg"],
      breakpoints: {
        large: 1000,
        medium: 750,
        small: 500,
        thumbnail: 150
      },
      quality: 80,
    }
  },
});
