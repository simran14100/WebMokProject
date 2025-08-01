import React, { useState, useEffect } from 'react';
import { Player } from 'video-react';
import ScreenshotProtection from '../../common/ScreenshotProtection';
import { apiConnector } from '../../../services/apiConnector';
import { videoProtection } from '../../../services/apis';
import { useSelector } from 'react-redux';
import 'video-react/dist/video-react.css';

const CourseVideoPlayer = ({ 
  courseId,
  subsectionId,
  title, 
  description, 
  onComplete, 
  onProgress,
  enableProtection = true 
}) => {
  const { token } = useSelector((state) => state.auth);
  const [player, setPlayer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [protectedVideoUrl, setProtectedVideoUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get protected video stream
  useEffect(() => {
    const getProtectedVideo = async () => {
      try {
        setLoading(true);
        const response = await apiConnector(
          'GET',
          `${videoProtection.GET_PROTECTED_VIDEO_STREAM}/${courseId}/${subsectionId}`,
          null,
          { Authorization: `Bearer ${token}` }
        );

        if (response.data?.success) {
          setProtectedVideoUrl(response.data.data.videoUrl);
        } else {
          setError('Failed to get protected video stream');
        }
      } catch (err) {
        console.error('Error getting protected video:', err);
        setError('Failed to load video');
      } finally {
        setLoading(false);
      }
    };

    if (courseId && subsectionId) {
      getProtectedVideo();
    }
  }, [courseId, subsectionId, token]);

  useEffect(() => {
    if (player) {
      // Add event listeners to the player
      player.subscribeToStateChange((state) => {
        setIsPlaying(state.playing);
        setCurrentTime(state.currentTime);
        setDuration(state.duration);
        
        // Track progress with backend
        if (onProgress) {
          onProgress(state.currentTime, state.duration);
          trackProgress(state.currentTime, state.duration, state.playing ? 'play' : 'pause');
        }
        
        // Check if video is completed (watched 90% or more)
        if (state.duration > 0 && state.currentTime / state.duration >= 0.9) {
          if (onComplete) {
            onComplete();
            trackProgress(state.currentTime, state.duration, 'complete');
          }
        }
      });
    }
  }, [player, onComplete, onProgress]);

  const handlePlayerRef = (playerRef) => {
    setPlayer(playerRef);
  };

  // Track progress with backend protection
  const trackProgress = async (currentTime, duration, action) => {
    try {
      await apiConnector(
        'POST',
        videoProtection.TRACK_VIDEO_PROGRESS,
        {
          courseId,
          subsectionId,
          currentTime,
          duration,
          action
        },
        { Authorization: `Bearer ${token}` }
      );
    } catch (err) {
      console.error('Error tracking progress:', err);
    }
  };

  if (loading) {
    return (
      <div className="course-video-container bg-black rounded-lg overflow-hidden shadow-lg">
        <div className="flex items-center justify-center h-64">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="course-video-container bg-black rounded-lg overflow-hidden shadow-lg">
        <div className="flex items-center justify-center h-64">
          <div className="text-center text-white">
            <p className="text-red-400 mb-2">Error loading video</p>
            <p className="text-sm text-gray-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ScreenshotProtection enabled={enableProtection}>
      <div className="course-video-container bg-black rounded-lg overflow-hidden shadow-lg">
        {/* Video Player */}
        <div className="relative">
          {protectedVideoUrl && (
            <Player
              ref={handlePlayerRef}
              aspectRatio="16:9"
              playsInline
              src={protectedVideoUrl}
              className="video-protected"
              controls
              fluid
            />
          )}
          
          {/* Protection overlay for video */}
          {enableProtection && (
            <div 
              className="absolute inset-0 pointer-events-none z-10"
              style={{
                background: 'transparent',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none'
              }}
            />
          )}
        </div>

        {/* Video Information */}
        <div className="p-4 bg-white">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {title}
          </h2>
          {description && (
            <p className="text-gray-600 text-sm mb-3">
              {description}
            </p>
          )}
          
          {/* Progress indicator */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' 
              }}
            />
          </div>
          
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Protection Notice */}
        {enableProtection && (
          <div className="px-4 py-2 bg-yellow-50 border-t border-yellow-200">
            <p className="text-xs text-yellow-800 text-center">
              🔒 Protected video stream - Backend protection enabled with DRM and watermarking
            </p>
          </div>
        )}
      </div>
    </ScreenshotProtection>
  );
};

// Helper function to format time
const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default CourseVideoPlayer;