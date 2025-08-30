module.exports = () => ({
  "export-import-kkm": {
    enabled: true,
    config: {
      // Plugin configuration options can go here if needed
    },
  },
  graphql: {
    enabled: true,
    config: {
      defaultLimit: 100,
      maxLimit: 500,
      apolloServer: {
        introspection: true,
      },
    },
  },
});
