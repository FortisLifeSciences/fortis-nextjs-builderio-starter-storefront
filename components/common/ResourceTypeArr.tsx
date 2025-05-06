export type ResourceType = {
  resourceType: string
  value: string
}

const resourceTypeArr: ResourceType[] = [
  {
    resourceType: 'Article',
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
  {
    resourceType: 'Podcast',
    value: 'podcasts',
  },
  {
    resourceType: 'CaseStudy',
    value: 'data_thresholding',
  },
  {
    resourceType: 'Application',
    value: 'summarize',
  },
  {
    resourceType: 'Guide',
    value: 'dataset',
  },
]

export default resourceTypeArr
