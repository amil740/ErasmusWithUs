import { useEffect, useRef, useState } from 'react'
import { Building2 } from 'lucide-react'
import './UniversityPhoto.css'

type CommonsPage = {
  index?: number
  imageinfo?: Array<{
    thumburl?: string
    url?: string
    descriptionurl?: string
    extmetadata?: Record<string, { value?: string }>
  }>
}

type CommonsResponse = {
  query?: {
    pages?: Record<string, CommonsPage>
  }
}

type CampusPhotoData = {
  imageUrl: string
  sourceUrl: string
  creator: string
  license: string
}

const photoRequests = new Map<string, Promise<CampusPhotoData | null>>()

function plainMetadata(value?: string) {
  return value?.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim() ?? ''
}

async function searchCommons(search: string): Promise<CampusPhotoData | null> {
  const params = new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrsearch: search,
    gsrnamespace: '6',
    gsrlimit: '1',
    prop: 'imageinfo',
    iiprop: 'url|extmetadata',
    iiurlwidth: '640',
    format: 'json',
    origin: '*',
  })
  const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`)
  if (!response.ok) throw new Error(`Wikimedia Commons returned ${response.status}`)
  const result = await response.json() as CommonsResponse
  const page = Object.values(result.query?.pages ?? {}).sort((left, right) => (left.index ?? 0) - (right.index ?? 0))[0]
  const image = page?.imageinfo?.[0]
  if (!image?.thumburl?.startsWith('https://') || !image.descriptionurl?.startsWith('https://')) return null
  const metadata = image.extmetadata ?? {}
  return {
    imageUrl: image.thumburl,
    sourceUrl: image.descriptionurl,
    creator: plainMetadata(metadata.Artist?.value) || 'Creator not listed',
    license: plainMetadata(metadata.LicenseShortName?.value) || 'See source',
  }
}

function getCampusPhoto(university: string) {
  const cached = photoRequests.get(university)
  if (cached) return cached

  const request = searchCommons(`filetype:bitmap "${university}" campus`)
    .then((photo) => photo ?? searchCommons(`filetype:bitmap "${university}" university`))
    .catch((error: unknown) => {
      photoRequests.delete(university)
      throw error
    })
  photoRequests.set(university, request)
  return request
}

export default function UniversityPhoto({ university }: { university: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [photo, setPhoto] = useState<CampusPhotoData | null>(null)
  const [unavailable, setUnavailable] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)

  useEffect(() => {
    const node = containerRef.current
    if (!node) return
    let cancelLoad: (() => void) | undefined
    const load = () => {
      let active = true
      void getCampusPhoto(university).then((result) => {
        if (!active) return
        setPhoto(result)
        setUnavailable(!result)
      }).catch(() => {
        if (active) setUnavailable(true)
      })
      return () => { active = false }
    }
    if (!('IntersectionObserver' in window)) {
      return load()
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        cancelLoad = load()
        observer.disconnect()
      }
    }, { rootMargin: '180px' })
    observer.observe(node)
    return () => {
      observer.disconnect()
      cancelLoad?.()
    }
  }, [university])

  return <div className="university-photo-wrap" ref={containerRef}>
    {photo && !imageFailed
      ? <a className="university-photo" href={photo.sourceUrl} target="_blank" rel="noreferrer" title={`Photo by ${photo.creator} · ${photo.license}`}>
          <img src={photo.imageUrl} alt={`${university} campus`} loading="lazy" onError={() => setImageFailed(true)} />
          <span>{photo.creator} · {photo.license}</span>
        </a>
      : <div className="university-photo-placeholder" aria-label={unavailable ? `Photo unavailable for ${university}` : `Loading photo for ${university}`}>
          <Building2 size={20} />
        </div>}
  </div>
}
