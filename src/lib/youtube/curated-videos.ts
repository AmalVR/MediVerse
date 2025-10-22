import { youtubeAPI, type YouTubeVideo } from "./youtube-api";

// Default channel ID for vokaio (VOKA 3D Anatomy & Pathology)
export const VOKAIO_CHANNEL_ID = "UCqGGuOEpr62ScH8Pjk2q5zw";

// Cache for videos
let cachedVideos: YouTubeVideo[] = [];
let cacheTimestamp: number = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function getCuratedVideos(): Promise<YouTubeVideo[]> {
  const now = Date.now();

  // Return cached videos if still valid
  if (cachedVideos.length > 0 && now - cacheTimestamp < CACHE_DURATION) {
    console.log("Returning cached videos:", cachedVideos.length);
    return cachedVideos;
  }

  try {
    console.log("Fetching videos from VOKA channel:", VOKAIO_CHANNEL_ID);
    // Fetch videos from vokaio channel
    const videos = await youtubeAPI.getChannelVideos(VOKAIO_CHANNEL_ID, 50);
    console.log("Fetched videos:", videos.length);

    // Map videos to anatomical systems
    const mappedVideos = youtubeAPI.mapVideosToSystems(videos);
    console.log("Mapped videos to systems:", mappedVideos.length);

    // Cache the results
    cachedVideos = mappedVideos;
    cacheTimestamp = now;

    // Store in localStorage for offline access
    try {
      localStorage.setItem(
        "mediverse_youtube_cache",
        JSON.stringify({
          videos: mappedVideos,
          timestamp: now,
        })
      );
      console.log("Videos cached to localStorage");
    } catch (error) {
      console.warn("Failed to cache videos to localStorage:", error);
    }

    return mappedVideos;
  } catch (error) {
    console.error("Failed to fetch curated videos:", error);

    // Try to load from localStorage cache
    try {
      const cached = localStorage.getItem("mediverse_youtube_cache");
      if (cached) {
        const { videos, timestamp } = JSON.parse(cached);
        if (now - timestamp < CACHE_DURATION) {
          cachedVideos = videos;
          cacheTimestamp = timestamp;
          console.log("Loaded videos from localStorage cache:", videos.length);
          return videos;
        }
      }
    } catch (error) {
      console.warn("Failed to load videos from localStorage:", error);
    }

    // Return fallback videos
    console.log("Using fallback videos");
    return youtubeAPI.mapVideosToSystems(youtubeAPI.getFallbackVideos());
  }
}

export function getVideosBySystem(system: string): YouTubeVideo[] {
  return cachedVideos.filter(
    (video) =>
      video.anatomicalSystem === system || video.anatomicalSystem === "GENERAL"
  );
}

export function getFeaturedVideos(): YouTubeVideo[] {
  // Return most viewed videos or manually curated featured content
  return cachedVideos
    .sort((a, b) => parseInt(b.viewCount) - parseInt(a.viewCount))
    .slice(0, 6);
}

export function searchVideos(query: string): YouTubeVideo[] {
  const queryLower = query.toLowerCase();
  return cachedVideos.filter(
    (video) =>
      video.title.toLowerCase().includes(queryLower) ||
      video.description.toLowerCase().includes(queryLower) ||
      video.channelTitle.toLowerCase().includes(queryLower)
  );
}

// Initialize video cache on app load
export async function initializeVideoCache(): Promise<void> {
  try {
    await getCuratedVideos();
    console.log("YouTube video cache initialized");
  } catch (error) {
    console.error("Failed to initialize video cache:", error);
  }
}
