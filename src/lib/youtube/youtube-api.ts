/* eslint-disable @typescript-eslint/no-explicit-any */
export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  duration: string;
  viewCount: string;
  anatomicalSystem?: string;
}

export interface YouTubeChannel {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  subscriberCount: string;
}

class YouTubeAPI {
  private apiKey: string;
  private baseUrl = "https://www.googleapis.com/youtube/v3";

  constructor() {
    this.apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
    if (!this.apiKey) {
      console.warn(
        "YouTube API key not found. YouTube features will be limited."
      );
    }
  }

  async getChannelVideos(
    channelId: string,
    maxResults = 50
  ): Promise<YouTubeVideo[]> {
    if (!this.apiKey) {
      console.warn("YouTube API key not available, using fallback videos");
      return this.getFallbackVideos();
    }

    try {
      console.log(`Fetching channel info for: ${channelId}`);

      // First, get the uploads playlist ID
      const channelResponse = await fetch(
        `${this.baseUrl}/channels?part=contentDetails&id=${channelId}&key=${this.apiKey}`
      );

      if (!channelResponse.ok) {
        throw new Error(
          `HTTP ${channelResponse.status}: ${channelResponse.statusText}`
        );
      }

      const channelData = await channelResponse.json();
      console.log("Channel API response:", channelData);

      if (!channelData.items || channelData.items.length === 0) {
        console.warn(
          `Channel ${channelId} not found or has no items - using fallback videos`
        );
        return this.getFallbackVideos();
      }

      const uploadsPlaylistId =
        channelData.items[0].contentDetails.relatedPlaylists.uploads;

      if (!uploadsPlaylistId) {
        console.warn(
          "No uploads playlist found for channel - using fallback videos"
        );
        return this.getFallbackVideos();
      }

      console.log(`Found uploads playlist: ${uploadsPlaylistId}`);

      // Get videos from uploads playlist
      const videosResponse = await fetch(
        `${this.baseUrl}/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}&key=${this.apiKey}`
      );

      if (!videosResponse.ok) {
        throw new Error(
          `HTTP ${videosResponse.status}: ${videosResponse.statusText}`
        );
      }

      const videosData = await videosResponse.json();
      console.log(`Found ${videosData.items?.length || 0} videos in playlist`);

      if (!videosData.items || videosData.items.length === 0) {
        console.warn(
          "No videos found in uploads playlist - using fallback videos"
        );
        return this.getFallbackVideos();
      }

      // Get detailed video information
      const videoIds = videosData.items
        .map((item: any) => item.snippet.resourceId.videoId)
        .join(",");

      const detailsResponse = await fetch(
        `${this.baseUrl}/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${this.apiKey}`
      );

      if (!detailsResponse.ok) {
        throw new Error(
          `HTTP ${detailsResponse.status}: ${detailsResponse.statusText}`
        );
      }

      const detailsData = await detailsResponse.json();
      console.log(
        `Retrieved details for ${detailsData.items?.length || 0} videos`
      );

      return detailsData.items.map((video: any) => ({
        id: video.id,
        title: video.snippet.title,
        description: video.snippet.description,
        thumbnail:
          video.snippet.thumbnails.medium?.url ||
          video.snippet.thumbnails.default?.url,
        channelTitle: video.snippet.channelTitle,
        publishedAt: video.snippet.publishedAt,
        duration: video.contentDetails.duration,
        viewCount: video.statistics.viewCount,
      }));
    } catch (error) {
      console.error("Failed to fetch YouTube videos:", error);
      console.log("Falling back to default videos");
      return this.getFallbackVideos();
    }
  }

  async getChannelInfo(channelId: string): Promise<YouTubeChannel | null> {
    if (!this.apiKey) {
      return null;
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/channels?part=snippet,statistics&id=${channelId}&key=${this.apiKey}`
      );
      const data = await response.json();

      if (!data.items || data.items.length === 0) {
        return null;
      }

      const channel = data.items[0];
      return {
        id: channel.id,
        title: channel.snippet.title,
        description: channel.snippet.description,
        thumbnail:
          channel.snippet.thumbnails.medium?.url ||
          channel.snippet.thumbnails.default?.url,
        subscriberCount: channel.statistics.subscriberCount,
      };
    } catch (error) {
      console.error("Failed to fetch channel info:", error);
      return null;
    }
  }

  getFallbackVideos(): YouTubeVideo[] {
    // Fallback videos with unique IDs for offline/API limit scenarios
    return [
      {
        id: "fallback-general-001",
        title: "Introduction to Human Anatomy - VOKA 3D",
        description:
          "Learn the basics of human anatomy with interactive 3D models from VOKA 3D Anatomy & Pathology",
        thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
        channelTitle: "VOKA 3D Anatomy & Pathology",
        publishedAt: "2023-01-01T00:00:00Z",
        duration: "PT10M30S",
        viewCount: "1000000",
        anatomicalSystem: "GENERAL",
      },
      {
        id: "fallback-cardiovascular-002",
        title: "Cardiovascular System Explained - Heart Anatomy",
        description:
          "Deep dive into the heart and circulatory system with 3D visualization",
        thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
        channelTitle: "VOKA 3D Anatomy & Pathology",
        publishedAt: "2023-01-02T00:00:00Z",
        duration: "PT15M45S",
        viewCount: "500000",
        anatomicalSystem: "CARDIOVASCULAR",
      },
      {
        id: "fallback-skeletal-003",
        title: "Skeletal System Overview - Bone Structure",
        description:
          "Understanding bones, joints, and the skeletal framework in 3D",
        thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
        channelTitle: "VOKA 3D Anatomy & Pathology",
        publishedAt: "2023-01-03T00:00:00Z",
        duration: "PT12M20S",
        viewCount: "750000",
        anatomicalSystem: "SKELETAL",
      },
      {
        id: "fallback-nervous-004",
        title: "Nervous System - Brain and Spinal Cord",
        description:
          "Explore the central nervous system with detailed 3D models",
        thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
        channelTitle: "VOKA 3D Anatomy & Pathology",
        publishedAt: "2023-01-04T00:00:00Z",
        duration: "PT18M15S",
        viewCount: "400000",
        anatomicalSystem: "NERVOUS",
      },
      {
        id: "fallback-respiratory-005",
        title: "Respiratory System - Lungs and Airways",
        description: "Understanding breathing mechanics and lung anatomy in 3D",
        thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
        channelTitle: "VOKA 3D Anatomy & Pathology",
        publishedAt: "2023-01-05T00:00:00Z",
        duration: "PT14M30S",
        viewCount: "300000",
        anatomicalSystem: "RESPIRATORY",
      },
      {
        id: "fallback-muscular-006",
        title: "Muscular System - Muscle Groups and Movement",
        description:
          "Study muscle anatomy and how muscles work together for movement",
        thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
        channelTitle: "VOKA 3D Anatomy & Pathology",
        publishedAt: "2023-01-06T00:00:00Z",
        duration: "PT16M45S",
        viewCount: "250000",
        anatomicalSystem: "MUSCULAR",
      },
    ];
  }

  // Map videos to anatomical systems based on title/keywords
  mapVideosToSystems(videos: YouTubeVideo[]): YouTubeVideo[] {
    const systemKeywords = {
      CARDIOVASCULAR: [
        "heart",
        "cardiac",
        "circulation",
        "blood",
        "artery",
        "vein",
      ],
      SKELETAL: ["bone", "skeleton", "joint", "cartilage", "skull"],
      NERVOUS: ["brain", "nerve", "neural", "spinal", "cerebral"],
      RESPIRATORY: ["lung", "breathing", "respiratory", "airway", "bronchi"],
      MUSCULAR: ["muscle", "muscular", "tendon", "contraction"],
    };

    return videos.map((video) => {
      const titleLower = video.title.toLowerCase();
      const descriptionLower = video.description.toLowerCase();

      for (const [system, keywords] of Object.entries(systemKeywords)) {
        if (
          keywords.some(
            (keyword) =>
              titleLower.includes(keyword) || descriptionLower.includes(keyword)
          )
        ) {
          return { ...video, anatomicalSystem: system };
        }
      }

      return { ...video, anatomicalSystem: "GENERAL" };
    });
  }
}

export const youtubeAPI = new YouTubeAPI();
