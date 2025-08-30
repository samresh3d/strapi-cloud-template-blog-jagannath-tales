/**
 * Utility function to extract YouTube video ID from various YouTube URL formats
 * @param {string} url - The YouTube URL
 * @returns {string|null} - The extracted video ID or null if invalid
 */
const extractYouTubeVideoId = (url) => {
  if (!url) return null;
  
  // Handle different YouTube URL formats
  const patterns = [
    // youtube.com/watch?v=VIDEO_ID
    /youtube\.com\/watch\?v=([^&]+)/,
    // youtu.be/VIDEO_ID
    /youtu\.be\/([^?]+)/,
    // youtube.com/embed/VIDEO_ID
    /youtube\.com\/embed\/([^?]+)/,
    // youtube.com/v/VIDEO_ID
    /youtube\.com\/v\/([^?]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
};

/**
 * Generate YouTube embed URL with optional parameters
 * @param {string} videoId - The YouTube video ID
 * @param {object} options - Options for the embed
 * @returns {string} - The complete embed URL
 */
const generateYouTubeEmbedUrl = (videoId, options = {}) => {
  if (!videoId) return '';
  
  const baseUrl = `https://www.youtube.com/embed/${videoId}`;
  const params = [];
  
  if (options.startTime) {
    params.push(`start=${options.startTime}`);
  }
  
  if (options.autoplay) {
    params.push('autoplay=1');
  }
  
  if (options.muted) {
    params.push('mute=1');
  }
  
  // Add more common parameters
  if (options.showRelated === false) {
    params.push('rel=0');
  }
  
  if (options.showControls === false) {
    params.push('controls=0');
  }
  
  return params.length > 0 ? `${baseUrl}?${params.join('&')}` : baseUrl;
};

module.exports = {
  extractYouTubeVideoId,
  generateYouTubeEmbedUrl
};
