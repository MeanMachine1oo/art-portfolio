export interface Artwork {
  _id: string
  title: string
  slug: { current: string }
  image: any
  description?: string
  year?: number
}

export interface ArtistInfo {
  name: string
  bio?: any
  photo?: any
}
