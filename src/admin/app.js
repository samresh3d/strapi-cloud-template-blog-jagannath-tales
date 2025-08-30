const config = {
  locales: ["en"],
  translations: {
    en: {
      "app.components.LeftMenu.navbrand.title": "Jagannath Tales",
      "Auth.form.welcome.title": "Jagannath Tales CMS",
      "Auth.form.welcome.subtitle": "Divine content management",
      "app.components.HomePage.welcome": "Welcome to Jagannath Tales CMS",
    },
  },
  theme: {
    colors: {
      primary100: "#f8f5ef",
      primary200: "#f6f2ea",
      primary500: "#E39C14",
      primary600: "#cc8c12",
      primary700: "#b57c10",
      buttonPrimary500: "#E39C14",
      buttonPrimary600: "#cc8c12",
      neutral0: "#ffffff",
      neutral100: "#f6f2ea",
      neutral150: "#f0e9dd",
      neutral200: "#e6dccb",
      neutral300: "#d9cbae",
      neutral400: "#c3b394",
    }
  },
  head: {
    favicon: {
      path: "/admin/jagannath_favicon.ico",
      type: "image/x-icon",
    },
    title: "Jagannath Tales � Admin",
  },
  auth: {
    logo: "/admin/logo.svg",
  },
  menu: {
    logo: "/admin/logo.svg",
  },
  tutorials: false,
  notifications: { release: false },
};

const bootstrap = (app) => {
  console.log("Jagannath Tales Admin Panel initialized");
};

export default {
  config,
  bootstrap,
};
