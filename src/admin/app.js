// Correct way to import assets in Strapi admin
import AuthLogo from './extensions/auth-logo.svg';
import MenuLogo from './extensions/menu-logo.svg';
import favicon from './extensions/favicon.ico';

export default {
  config: {
    // Replace the Strapi logo in auth (login) views
    auth: {
      logo: AuthLogo,
    },
    // Replace the favicon
    head: {
      favicon: favicon,
    },
    // Replace the Strapi logo in the main navigation
    menu: {
      logo: MenuLogo,
    },
    // Override or extend the theme
    theme: {
      colors: {
        primary100: '#f6ecfc',
        primary200: '#e0c1f4',
        primary500: '#ac73e6',
        primary600: '#9736e8',
        primary700: '#8312d1',
        danger700: '#b72b1a'
      },
    },
    // Extend the translations
    translations: {
      en: {
        // Main navigation title
        "app.components.LeftMenu.navbrand.title": "Jagannath Tales Dashboard",
        
        // Login page customizations
        "Auth.form.welcome.title": "Welcome to Jagannath Tales",
        "Auth.form.welcome.subtitle": "Log in to manage your content",
        "Auth.form.button.login.strapi": "Log in",
        "Auth.form.register.subtitle": "Credentials are only used to authenticate in the admin panel.",
        "Auth.form.username.placeholder": "Enter your username",
        "Auth.form.password.placeholder": "Enter your password",
        
        // Password recovery
        "Auth.form.forgot-password.title": "Reset Password",
        "Auth.form.forgot-password.email.label": "Email",
        "Auth.form.forgot-password.email.placeholder": "Enter your email",
      },
    },
    // Disable video tutorials
    tutorials: false,
    // Disable notifications about new Strapi releases
    notifications: { release: false },
    
    // Auth logo is already defined above
    
    // Customize the footer displayed on the login page
    customAuth: {
      components: {
        Login: {
          Footer: () => {
            const year = new Date().getFullYear();
            return {
              render: `<div style="text-align: center; margin-top: 32px; color: #666;">
                <p>© ${year} Jagannath Tales - All rights reserved</p>
              </div>`,
            };
          },
        },
      },
    },
  },

  bootstrap() {},
};
