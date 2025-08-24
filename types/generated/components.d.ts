import type { Schema, Struct } from '@strapi/strapi';

export interface AuthorSocial extends Struct.ComponentSchema {
  collectionName: 'components_author_socials';
  info: {
    description: "Author's social media links";
    displayName: 'Social Links';
  };
  attributes: {
    linkedin: Schema.Attribute.String;
    twitter: Schema.Attribute.String;
  };
}

export interface FestivalCalendarSeason extends Struct.ComponentSchema {
  collectionName: 'components_festival_calendar_seasons';
  info: {
    description: 'Season/month for festival calendar';
    displayName: 'Calendar Season';
  };
  attributes: {
    festivals: Schema.Attribute.JSON;
    month: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface FestivalRitual extends Struct.ComponentSchema {
  collectionName: 'components_festival_rituals';
  info: {
    description: 'Festival ritual details';
    displayName: 'Ritual';
  };
  attributes: {
    description: Schema.Attribute.Text;
    name: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface FestivalUpcomingDate extends Struct.ComponentSchema {
  collectionName: 'components_festival_upcoming_dates';
  info: {
    description: 'Upcoming dates for festivals';
    displayName: 'Upcoming Date';
  };
  attributes: {
    date: Schema.Attribute.Date & Schema.Attribute.Required;
    year: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface FormsContactForm extends Struct.ComponentSchema {
  collectionName: 'components_forms_contact_forms';
  info: {
    description: 'Configuration for contact form';
    displayName: 'Contact Form';
  };
  attributes: {
    emailLabel: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Your Email'>;
    errorMessage: Schema.Attribute.Text &
      Schema.Attribute.DefaultTo<'There was an error sending your message. Please try again later.'>;
    messageLabel: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Your Message'>;
    nameLabel: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Your Name'>;
    subjectLabel: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Subject'>;
    submitButtonText: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Send Message'>;
    successMessage: Schema.Attribute.Text &
      Schema.Attribute.DefaultTo<'Thank you for your message. We will get back to you soon.'>;
    title: Schema.Attribute.String & Schema.Attribute.DefaultTo<'Contact Us'>;
  };
}

export interface SharedHeading extends Struct.ComponentSchema {
  collectionName: 'components_shared_headings';
  info: {
    description: 'Section headings for content';
    displayName: 'Heading';
  };
  attributes: {
    level: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          max: 6;
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<2>;
    text: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedImage extends Struct.ComponentSchema {
  collectionName: 'components_shared_images';
  info: {
    description: 'Image with caption for content';
    displayName: 'Image';
  };
  attributes: {
    alt: Schema.Attribute.String & Schema.Attribute.Required;
    caption: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
  };
}

export interface SharedList extends Struct.ComponentSchema {
  collectionName: 'components_shared_lists';
  info: {
    description: 'Bulleted or numbered list';
    displayName: 'List';
  };
  attributes: {
    items: Schema.Attribute.JSON & Schema.Attribute.Required;
    listType: Schema.Attribute.Enumeration<['bullet', 'number']> &
      Schema.Attribute.DefaultTo<'bullet'>;
  };
}

export interface SharedMedia extends Struct.ComponentSchema {
  collectionName: 'components_shared_media';
  info: {
    displayName: 'Media';
    icon: 'file-video';
  };
  attributes: {
    file: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
  };
}

export interface SharedParagraph extends Struct.ComponentSchema {
  collectionName: 'components_shared_paragraphs';
  info: {
    description: 'Basic paragraph of text';
    displayName: 'Paragraph';
  };
  attributes: {
    text: Schema.Attribute.Text & Schema.Attribute.Required;
  };
}

export interface SharedQuote extends Struct.ComponentSchema {
  collectionName: 'components_shared_quotes';
  info: {
    description: 'Blockquote for content';
    displayName: 'Quote';
    icon: 'indent';
  };
  attributes: {
    author: Schema.Attribute.String;
    source: Schema.Attribute.String;
    text: Schema.Attribute.Text & Schema.Attribute.Required;
  };
}

export interface SharedRichText extends Struct.ComponentSchema {
  collectionName: 'components_shared_rich_texts';
  info: {
    description: 'Rich text content with formatting';
    displayName: 'Rich text';
    icon: 'align-justify';
  };
  attributes: {
    content: Schema.Attribute.RichText & Schema.Attribute.Required;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: 'SEO metadata for content';
    displayName: 'SEO';
    icon: 'allergies';
    name: 'Seo';
  };
  attributes: {
    canonicalURL: Schema.Attribute.String;
    keywords: Schema.Attribute.Text;
    metaDescription: Schema.Attribute.Text & Schema.Attribute.Required;
    metaImage: Schema.Attribute.Media<'images'>;
    metaTitle: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedSlider extends Struct.ComponentSchema {
  collectionName: 'components_shared_sliders';
  info: {
    description: '';
    displayName: 'Slider';
    icon: 'address-book';
  };
  attributes: {
    files: Schema.Attribute.Media<'images', true>;
  };
}

export interface SiteLanguage extends Struct.ComponentSchema {
  collectionName: 'components_site_languages';
  info: {
    description: 'Language option for the site';
    displayName: 'Language';
  };
  attributes: {
    code: Schema.Attribute.String & Schema.Attribute.Required;
    flag: Schema.Attribute.String;
    name: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SiteNavigationLink extends Struct.ComponentSchema {
  collectionName: 'components_site_navigation_links';
  info: {
    description: 'Links for site navigation';
    displayName: 'Navigation Link';
  };
  attributes: {
    ariaLabel: Schema.Attribute.String;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    newTab: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SiteScripture extends Struct.ComponentSchema {
  collectionName: 'components_site_scriptures';
  info: {
    description: 'Scripture of the day configuration';
    displayName: 'Scripture';
  };
  attributes: {
    reference: Schema.Attribute.String & Schema.Attribute.Required;
    text: Schema.Attribute.Text & Schema.Attribute.Required;
    translation: Schema.Attribute.String;
  };
}

export interface SiteSiteInfo extends Struct.ComponentSchema {
  collectionName: 'components_site_site_infos';
  info: {
    description: 'General site information';
    displayName: 'Site Info';
  };
  attributes: {
    contactEmail: Schema.Attribute.Email;
    copyright: Schema.Attribute.String;
    description: Schema.Attribute.Text & Schema.Attribute.Required;
    tagline: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SiteSocialLink extends Struct.ComponentSchema {
  collectionName: 'components_site_social_links';
  info: {
    description: 'Social media links for the site';
    displayName: 'Social Link';
  };
  attributes: {
    icon: Schema.Attribute.String;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SiteSubscriptionForm extends Struct.ComponentSchema {
  collectionName: 'components_site_subscription_forms';
  info: {
    description: 'Newsletter subscription form configuration';
    displayName: 'Subscription Form';
  };
  attributes: {
    buttonText: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    placeholder: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'author.social': AuthorSocial;
      'festival.calendar-season': FestivalCalendarSeason;
      'festival.ritual': FestivalRitual;
      'festival.upcoming-date': FestivalUpcomingDate;
      'forms.contact-form': FormsContactForm;
      'shared.heading': SharedHeading;
      'shared.image': SharedImage;
      'shared.list': SharedList;
      'shared.media': SharedMedia;
      'shared.paragraph': SharedParagraph;
      'shared.quote': SharedQuote;
      'shared.rich-text': SharedRichText;
      'shared.seo': SharedSeo;
      'shared.slider': SharedSlider;
      'site.language': SiteLanguage;
      'site.navigation-link': SiteNavigationLink;
      'site.scripture': SiteScripture;
      'site.site-info': SiteSiteInfo;
      'site.social-link': SiteSocialLink;
      'site.subscription-form': SiteSubscriptionForm;
    }
  }
}
