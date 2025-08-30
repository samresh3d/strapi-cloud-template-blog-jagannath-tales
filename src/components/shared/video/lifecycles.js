const { extractYouTubeVideoId } = require('../../../utils/youtube');

module.exports = {
  beforeCreate(event) {
    const { data } = event.params;
    
    // Only process if there's a YouTube URL but no ID
    if (data.youtube_url && !data.youtube_id) {
      // Extract YouTube ID from URL
      const videoId = extractYouTubeVideoId(data.youtube_url);
      if (videoId) {
        data.youtube_id = videoId;
      }
    }
  },
  
  beforeUpdate(event) {
    const { data } = event.params;
    
    // Only process if there's a YouTube URL
    if (data.youtube_url) {
      // Extract YouTube ID from URL
      const videoId = extractYouTubeVideoId(data.youtube_url);
      if (videoId) {
        data.youtube_id = videoId;
      }
    }
  }
};
