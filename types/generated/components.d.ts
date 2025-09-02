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

export interface QuoteContent extends Struct.ComponentSchema {
  collectionName: 'components_quote_contents';
  info: {
    description: 'Sanskrit quote and its English translation';
    displayName: 'Quote Content';
    icon: 'feather';
  };
  attributes: {
    english_translation: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.Private;
    sanskrit_text: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.Private;
  };
}

export interface QuoteMetadata extends Struct.ComponentSchema {
  collectionName: 'components_quote_metadata';
  info: {
    description: 'Source and attribution information for quotes';
    displayName: 'Quote Metadata';
    icon: 'information';
  };
  attributes: {
    author: Schema.Attribute.String & Schema.Attribute.Private;
    context: Schema.Attribute.Text;
    source: Schema.Attribute.String & Schema.Attribute.Private;
  };
}

export interface QuoteRelations extends Struct.ComponentSchema {
  collectionName: 'components_quote_relations';
  info: {
    description: 'Related content that uses this quote';
    displayName: 'Content Relations';
    icon: 'link';
  };
  attributes: {
    articles: Schema.Attribute.Relation<
      'manyToMany',
      'api::pages-article.pages-article'
    > &
      Schema.Attribute.Private;
    pages: Schema.Attribute.Relation<
      'manyToMany',
      'api::pages-page.pages-page'
    > &
      Schema.Attribute.Private;
  };
}

export interface SharedFestivalEventReference extends Struct.ComponentSchema {
  collectionName: 'components_shared_festival_event_references';
  info: {
    description: 'Reference to an upcoming festival or celebration';
    displayName: 'Festival Event Reference';
    icon: 'calendar-alt';
  };
  attributes: {
    customTitle: Schema.Attribute.String;
    displayMode: Schema.Attribute.Enumeration<
      ['compact', 'detailed', 'card', 'countdown']
    > &
      Schema.Attribute.DefaultTo<'compact'>;
    festivalEvent: Schema.Attribute.Relation<
      'oneToOne',
      'api::data-festival-event.data-festival-event'
    >;
    showDescription: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<true>;
    showImage: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    showLocation: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
  };
}

export interface SharedFestivalEventsList extends Struct.ComponentSchema {
  collectionName: 'components_shared_festival_events_list';
  info: {
    description: 'Display a list or calendar of upcoming festival events';
    displayName: 'Festival Events List';
    icon: 'calendar-week';
  };
  attributes: {
    daysToLookAhead: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 365;
          min: 7;
        },
        number
      > &
      Schema.Attribute.DefaultTo<90>;
    displayMode: Schema.Attribute.Enumeration<
      ['list', 'grid', 'calendar', 'timeline']
    > &
      Schema.Attribute.DefaultTo<'list'>;
    filterByImportance: Schema.Attribute.Enumeration<
      ['all', 'major', 'major+regional', 'regional+local']
    > &
      Schema.Attribute.DefaultTo<'all'>;
    maxItems: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 20;
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<5>;
    showPastEvents: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    specificEvents: Schema.Attribute.Relation<
      'oneToMany',
      'api::data-festival-event.data-festival-event'
    >;
    title: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Upcoming Festivals & Celebrations'>;
  };
}

export interface SharedGlobalQuoteReference extends Struct.ComponentSchema {
  collectionName: 'components_shared_global_quote_references';
  info: {
    description: 'Reference to a quote from the global settings';
    displayName: 'Global Quote Reference';
    icon: 'quote-right';
  };
  attributes: {
    quoteId: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    showAuthor: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<true>;
    showSource: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<true>;
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

export interface SharedNewsletter extends Struct.ComponentSchema {
  collectionName: 'components_shared_newsletters';
  info: {
    description: 'Reusable newsletter subscription section for any page';
    displayName: 'Newsletter';
  };
  attributes: {
    description: Schema.Attribute.Text &
      Schema.Attribute.DefaultTo<'Receive updates on new stories, upcoming festivals, and exclusive content.'>;
    form: Schema.Attribute.Component<'site.subscription-form', false>;
    heading: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'Join Our Newsletter'>;
    theme: Schema.Attribute.Enumeration<['light', 'dark', 'brand']> &
      Schema.Attribute.DefaultTo<'light'>;
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

export interface SharedQuoteReference extends Struct.ComponentSchema {
  collectionName: 'components_shared_quote_references';
  info: {
    description: 'Reference to a reusable quote';
    displayName: 'Quote Reference';
    icon: 'quote-right';
  };
  attributes: {
    customStyle: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'default'>;
    quote: Schema.Attribute.Relation<'oneToOne', 'api::data-quote.data-quote'>;
    showAuthor: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<true>;
    showSource: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<true>;
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

export interface SharedYoutube extends Struct.ComponentSchema {
  collectionName: 'components_shared_youtube_embeds';
  info: {
    description: 'Embed a YouTube video by URL or ID';
    displayName: 'YouTube';
    icon: 'play';
  };
  attributes: {
    aspectRatio: Schema.Attribute.Enumeration<
      ['RATIO_16_9', 'RATIO_4_3', 'RATIO_1_1']
    > &
      Schema.Attribute.DefaultTo<'RATIO_16_9'>;
    autoplay: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    hideControls: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    startAt: Schema.Attribute.Integer;
    title: Schema.Attribute.String;
    youtubeUrl: Schema.Attribute.String & Schema.Attribute.Required;
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

export interface SiteLinkGroup extends Struct.ComponentSchema {
  collectionName: 'components_site_link_groups';
  info: {
    description: 'A titled group of navigation links for footers or menus';
    displayName: 'Link Group';
  };
  attributes: {
    links: Schema.Attribute.Component<'site.navigation-link', true> &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    title: Schema.Attribute.String & Schema.Attribute.Required;
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

export interface StoryHeading extends Struct.ComponentSchema {
  collectionName: 'components_story_headings';
  info: {
    displayName: 'Heading';
    icon: 'heading';
  };
  attributes: {
    level: Schema.Attribute.Enumeration<['h1', 'h2', 'h3']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'h2'>;
    text: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface StoryImageBlock extends Struct.ComponentSchema {
  collectionName: 'components_story_image_blocks';
  info: {
    displayName: 'ImageBlock';
    icon: 'image';
  };
  attributes: {
    caption: Schema.Attribute.Text;
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
  };
}

export interface StoryParagraph extends Struct.ComponentSchema {
  collectionName: 'components_story_paragraphs';
  info: {
    displayName: 'Paragraph';
    icon: 'align-justify';
  };
  attributes: {
    text: Schema.Attribute.RichText;
  };
}

export interface StoryQuote extends Struct.ComponentSchema {
  collectionName: 'components_story_quotes';
  info: {
    displayName: 'Quote';
    icon: 'quote-left';
  };
  attributes: {
    author: Schema.Attribute.String;
    text: Schema.Attribute.Text & Schema.Attribute.Required;
  };
}

export interface StoryRichText extends Struct.ComponentSchema {
  collectionName: 'components_story_rich_texts';
  info: {
    displayName: 'RichText';
    icon: 'file-alt';
  };
  attributes: {
    content: Schema.Attribute.RichText;
  };
}

export interface StoryVerseOfTheDay extends Struct.ComponentSchema {
  collectionName: 'components_story_verse_of_the_day';
  info: {
    description: 'A special verse display with title, sanskrit text, and reference';
    displayName: 'Verse of the Day';
    icon: 'book-open';
  };
  attributes: {
    reference: Schema.Attribute.String & Schema.Attribute.Required;
    sanskritText: Schema.Attribute.Text & Schema.Attribute.Required;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'Verse of the Day'>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'author.social': AuthorSocial;
      'festival.calendar-season': FestivalCalendarSeason;
      'festival.ritual': FestivalRitual;
      'festival.upcoming-date': FestivalUpcomingDate;
      'quote.content': QuoteContent;
      'quote.metadata': QuoteMetadata;
      'quote.relations': QuoteRelations;
      'shared.festival-event-reference': SharedFestivalEventReference;
      'shared.festival-events-list': SharedFestivalEventsList;
      'shared.global-quote-reference': SharedGlobalQuoteReference;
      'shared.heading': SharedHeading;
      'shared.image': SharedImage;
      'shared.list': SharedList;
      'shared.media': SharedMedia;
      'shared.newsletter': SharedNewsletter;
      'shared.paragraph': SharedParagraph;
      'shared.quote': SharedQuote;
      'shared.quote-reference': SharedQuoteReference;
      'shared.rich-text': SharedRichText;
      'shared.seo': SharedSeo;
      'shared.slider': SharedSlider;
      'shared.youtube': SharedYoutube;
      'site.language': SiteLanguage;
      'site.link-group': SiteLinkGroup;
      'site.navigation-link': SiteNavigationLink;
      'site.scripture': SiteScripture;
      'site.site-info': SiteSiteInfo;
      'site.social-link': SiteSocialLink;
      'site.subscription-form': SiteSubscriptionForm;
      'story.heading': StoryHeading;
      'story.image-block': StoryImageBlock;
      'story.paragraph': StoryParagraph;
      'story.quote': StoryQuote;
      'story.rich-text': StoryRichText;
      'story.verse-of-the-day': StoryVerseOfTheDay;
    }
  }
}
