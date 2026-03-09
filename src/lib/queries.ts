import { client } from './sanity'
import type { Artwork, ArtistInfo } from './types'

export async function getAllArtworks(): Promise<Artwork[]> {
  return client.fetch(`*[_type == "artwork"] | order(_createdAt desc)`)
}

export async function getArtistInfo(): Promise<ArtistInfo> {
  return client.fetch(`*[_type == "artist"][0]`)
}
