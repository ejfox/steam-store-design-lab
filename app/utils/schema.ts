/**
 * The full schema of assets required for a store page.
 * Dimensions and rules mirror the partner documentation standards
 * (capsule sizes, trailer specs, safe areas, tag/screenshot counts).
 */

export interface LanguageSupport {
  name: string
  interface: boolean
  fullAudio: boolean
  subtitles: boolean
}

export interface SystemReqsOS {
  os: string
  processor: string
  memory: string
  graphics: string
  directX?: string
  storage: string
  additional?: string
}

export interface SystemRequirements {
  windowsMin?: SystemReqsOS
  windowsRec?: SystemReqsOS
  macMin?: SystemReqsOS
  macRec?: SystemReqsOS
  linuxMin?: SystemReqsOS
  linuxRec?: SystemReqsOS
}

export interface MediaItem {
  id: string
  kind: 'screenshot' | 'video'
  assetKey: string
  thumbKey?: string
  videoUrl?: string
  videoCategory?: 'General/Cinematic' | 'Teaser' | 'Gameplay' | 'Interview/Dev Diary'
  caption?: string
}

export type ReviewSummary =
  | 'Overwhelmingly Positive'
  | 'Very Positive'
  | 'Mostly Positive'
  | 'Positive'
  | 'Mixed'
  | 'Mostly Negative'
  | 'Negative'
  | 'Very Negative'
  | 'Overwhelmingly Negative'
  | 'No Reviews'

export interface ReviewBreakdown {
  summary: ReviewSummary
  recentSummary?: ReviewSummary
  totalCount: number
  recentCount?: number
  positivePct: number
}

export interface ProjectState {
  /* Core identity */
  title: string
  shortDescription: string
  aboutThisGame: string

  /* Attribution */
  developer: string
  publisher: string
  franchise: string

  /* Release */
  releaseDate: string
  earlyAccess: boolean
  comingSoon: boolean

  /* Taxonomy */
  genres: string[]
  tags: string[]
  features: string[]

  /* Commerce */
  priceCents: number
  discountPct: number
  hasPrice: boolean

  /* Reviews */
  reviews: ReviewBreakdown

  /* Languages */
  languages: LanguageSupport[]

  /* Maturity */
  matureContent: string

  /* Links */
  websiteUrl: string

  /* System requirements */
  systemRequirements: SystemRequirements

  /* Media references (keys point into idb-keyval asset store) */
  mediaOrder: MediaItem[]

  /* Graphical asset keys (all live in IDB) */
  assetKeys: {
    headerCapsule?: string     // 920×430 source — displays at 460×215
    smallCapsule?: string      // 462×174
    mainCapsule?: string       // 1232×706 source — displays at 616×353
    verticalCapsule?: string   // 748×896
    libraryCapsule?: string    // 600×900
    libraryHero?: string       // 3840×1240 (860×380 safe area)
    libraryHeader?: string     // 920×430
    libraryLogo?: string       // 1280×720 max, transparent PNG
    pageBackground?: string    // 1438×810, optional
    appIcon?: string           // 184×184 JPG
    bundleHeader?: string      // 707×232, only if game ships in a bundle
  }
}

export interface AssetSpec {
  key: keyof ProjectState['assetKeys']
  label: string
  width: number
  height: number
  displayWidth?: number
  displayHeight?: number
  format: string
  required: boolean
  description: string
  appearsIn: string
  rules?: string
  group: 'capsules' | 'library' | 'page' | 'icon' | 'bundle'
}

/** Ordered roughly by how often designers are uploading these. */
export const ASSET_SPECS: AssetSpec[] = [
  {
    key: 'headerCapsule',
    label: 'Header Capsule',
    width: 920,
    height: 430,
    displayWidth: 460,
    displayHeight: 215,
    format: 'JPG/PNG',
    required: true,
    group: 'capsules',
    appearsIn: 'Top of store page, "Recommended For You", Big Picture, Daily Deal, wishlist emails.',
    description: 'The most-seen capsule. Dream auto-generates a 460×215 version for web display; upload at 2× for retina.',
    rules: 'Logo + a tight marketing image. No review scores, award logos, discount copy, or cross-promotion text.',
  },
  {
    key: 'smallCapsule',
    label: 'Small Capsule',
    width: 462,
    height: 174,
    format: 'JPG/PNG',
    required: true,
    group: 'capsules',
    appearsIn: 'Search results, search suggestions, top sellers, new releases. Dream auto-generates 120×45 and 184×69 variants.',
    description: 'Landscape capsule — the title must remain legible at the tiny auto-generated sizes.',
  },
  {
    key: 'mainCapsule',
    label: 'Main Capsule',
    width: 1232,
    height: 706,
    displayWidth: 616,
    displayHeight: 353,
    format: 'JPG/PNG',
    required: true,
    group: 'capsules',
    appearsIn: 'Front-page featured carousel. Most real estate of any capsule.',
    description: 'Only uploaded if Dream features you. Displays at 616×353, upload at 2×.',
  },
  {
    key: 'verticalCapsule',
    label: 'Vertical Capsule',
    width: 748,
    height: 896,
    format: 'JPG/PNG',
    required: true,
    group: 'capsules',
    appearsIn: 'Front-page features during seasonal sales, sale landing pages.',
    description: 'Portrait-oriented variant used heavily during sales.',
  },
  {
    key: 'libraryCapsule',
    label: 'Library Capsule',
    width: 600,
    height: 900,
    format: 'PNG/JPG',
    required: true,
    group: 'library',
    appearsIn: 'Library overview grid, collections view.',
    description: 'The vertical art players see in their personal library. Half-size 300×450 auto-generated.',
    rules: 'Should include the game title as part of the artwork — no separate logo overlay here.',
  },
  {
    key: 'libraryHero',
    label: 'Library Hero',
    width: 3840,
    height: 1240,
    format: 'JPG/PNG',
    required: true,
    group: 'library',
    appearsIn: 'Top of the per-game library detail page. Library Logo overlays this.',
    description: 'Ultra-wide banner. Critical info must fit in the 860×380 centered safe area — edges are cropped on narrow windows.',
    rules: 'Zero text. Logo overlays via the separate Library Logo asset.',
  },
  {
    key: 'libraryHeader',
    label: 'Library Header',
    width: 920,
    height: 430,
    format: 'JPG/PNG',
    required: true,
    group: 'library',
    appearsIn: 'Recent Games list and several in-client library surfaces. Falls back to Header Capsule if omitted.',
    description: 'Separate from the store Header Capsule — designed for in-client library surfaces.',
  },
  {
    key: 'libraryLogo',
    label: 'Library Logo',
    width: 1280,
    height: 720,
    format: 'Transparent PNG',
    required: true,
    group: 'library',
    appearsIn: 'Overlaid on Library Hero on the per-game library page. Position selectable (bottom-left / top-center / middle-center / bottom-center).',
    description: 'Logo-only, transparent background. The maximum box is 1280×720; use whatever aspect fits inside.',
    rules: 'Zero background — the logo must read against any hero art.',
  },
  {
    key: 'pageBackground',
    label: 'Page Background',
    width: 1438,
    height: 810,
    format: 'JPG/PNG',
    required: false,
    group: 'page',
    appearsIn: 'Full-page ambient background behind the store page. Falls back to the last screenshot if not provided.',
    description: 'Atmospheric, softly-lit artwork. No text, no critical detail near edges.',
  },
  {
    key: 'appIcon',
    label: 'App Icon',
    width: 184,
    height: 184,
    format: 'JPG',
    required: true,
    group: 'icon',
    appearsIn: 'Library list view, chat favorites, desktop/mobile/Deck notifications.',
    description: 'Small square mark. Keep it readable at 32×32 — this is effectively a favicon.',
  },
  {
    key: 'bundleHeader',
    label: 'Bundle Header',
    width: 707,
    height: 232,
    format: 'JPG/PNG',
    required: false,
    group: 'bundle',
    appearsIn: 'Bundle pages (only if the game ships in a bundle).',
    description: 'Only needed if you offer a bundle (e.g., base game + DLC).',
  },
]

export const ASSET_GROUPS: Record<AssetSpec['group'], string> = {
  capsules: 'Store Capsules',
  library: 'Library Assets',
  page: 'Page Dressing',
  icon: 'Icons',
  bundle: 'Bundle',
}

/** Common genre subset — the real platform exposes hundreds. */
export const COMMON_GENRES = [
  'Action', 'Adventure', 'Casual', 'Indie', 'Massively Multiplayer',
  'Racing', 'RPG', 'Simulation', 'Sports', 'Strategy',
  'Free To Play', 'Early Access',
]

export const COMMON_FEATURES = [
  'Single-player', 'Multi-player', 'Co-op', 'Online Co-op', 'Local Co-op',
  'PvP', 'Online PvP', 'Dream Achievements', 'Full controller support',
  'Partial controller support', 'Dream Cloud', 'Dream Workshop',
  'Dream Trading Cards', 'VR Supported', 'Remote Play Together',
  'Cross-Platform Multiplayer', 'Dream Leaderboards', 'Stats',
  'Captions available', 'Includes level editor',
]

export const REVIEW_SUMMARIES: ReviewSummary[] = [
  'Overwhelmingly Positive',
  'Very Positive',
  'Mostly Positive',
  'Positive',
  'Mixed',
  'Mostly Negative',
  'Negative',
  'Very Negative',
  'Overwhelmingly Negative',
  'No Reviews',
]

/** Text-field constraints modeled after the real platform's published guidance. */
export const FIELD_LIMITS = {
  /** Short description: the platform caps this near 300 chars. */
  shortDescriptionMax: 300,
  /** Tags visible to users; ≥5 required before launch, up to 20 recommended. */
  tagsMin: 5,
  tagsMax: 20,
  /** Screenshots: ≥5 required, ≥4 "suitable for all ages" to retain front-page hover previews. */
  screenshotsMin: 5,
  screenshotsAllAgesMin: 4,
}

export const VIDEO_SPEC = {
  maxResolution: '1920×1080',
  aspect: '16:9 preferred, 4:3 accepted',
  fps: '30/29.97 or 60/59.94',
  bitrate: '5,000+ Kbps',
  containers: '.mp4 / .mov / .wmv (H.264 + AAC preferred)',
  audio: '44kHz or 48kHz, stereo on transcode',
  categories: ['General/Cinematic', 'Teaser', 'Gameplay', 'Interview/Dev Diary'] as const,
}

export function defaultProject(): ProjectState {
  return {
    title: 'Untitled Game',
    shortDescription: 'Your short description goes here. This is the blurb that appears under the title and in search results. Keep it punchy — around 300 characters.',
    aboutThisGame: 'Write the full "About This Game" section here. This is where you sell the experience: the hook, the verbs, the feeling. Break it into paragraphs.',
    developer: 'Your Studio',
    publisher: 'Your Studio',
    franchise: '',
    releaseDate: 'Coming Soon',
    earlyAccess: false,
    comingSoon: true,
    genres: ['Indie'],
    tags: [],
    features: ['Single-player'],
    priceCents: 1999,
    discountPct: 0,
    hasPrice: false,
    reviews: {
      summary: 'No Reviews',
      totalCount: 0,
      positivePct: 0,
    },
    languages: [
      { name: 'English', interface: true, fullAudio: true, subtitles: true },
    ],
    matureContent: '',
    websiteUrl: '',
    systemRequirements: {
      windowsMin: {
        os: 'Windows 10 64-bit',
        processor: '',
        memory: '',
        graphics: '',
        storage: '',
      },
    },
    mediaOrder: [],
    assetKeys: {},
  }
}
