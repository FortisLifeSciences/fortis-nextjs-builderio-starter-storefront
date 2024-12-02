export type ResourceType = {
  resourceType: string
  value: string
}

const resourceTypeArr: ResourceType[] = [
  {
    resourceType: 'Articles',
    value: 'article',
  },
  {
    resourceType: 'Protocol',
    value: 'integration_instructions',
  },
  {
    resourceType: 'Webinar',
    value: 'smart_display',
  },
  {
    resourceType: 'Whitepaper',
    value: 'description',
  },
  {
    resourceType: 'Ebook',
    value: 'book_2',
  },
  {
    resourceType: 'Poster',
    value: 'image',
  },
  {
    resourceType: 'Infographic',
    value: 'area_chart',
  },
  {
    resourceType: 'ApplicationNote',
    value: 'note_stack',
  },
]

export default resourceTypeArr
