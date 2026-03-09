import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './sanity/schemas'

const ARTIST_INFO_DOC_ID = 'artistInfo-singleton'

export default defineConfig({
  name: 'default',
  title: 'Art Portfolio',

  projectId: 'cpmtvctn',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Artist Info')
              .id('artistInfo')
              .child(
                S.document()
                  .schemaType('artistInfo')
                  .documentId(ARTIST_INFO_DOC_ID)
                  .title('Artist Info')
              ),
            S.divider(),
            S.documentTypeListItem('artwork').title('Artworks'),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
})