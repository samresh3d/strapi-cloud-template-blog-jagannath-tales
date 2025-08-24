declare module '@strapi/strapi' {
  export interface StrapiFactories {
    factories: {
      createCoreController: (uid: string, config?: any) => any;
      createCoreRouter: (uid: string, config?: any) => any;
      createCoreService: (uid: string, config?: any) => any;
    }
  }
  
  export interface Strapi {
    factories: StrapiFactories['factories'];
  }
  
  export function createStrapi(): Strapi;
}
