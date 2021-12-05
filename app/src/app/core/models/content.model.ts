export interface ContentItem {
  body: string
}

export const BlankContentItem: ContentItem = {
  body: ''
}

export interface Content {
  welcome: ContentItem;
}
