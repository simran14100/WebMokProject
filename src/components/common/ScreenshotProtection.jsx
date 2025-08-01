import React, { useEffect, useRef } from 'react';

const ScreenshotProtection = ({ children, enabled = true }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    const container = containerRef.current;
    if (!container) return;

    // Prevent right-click context menu
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    // Prevent keyboard shortcuts for screenshots
    const handleKeyDown = (e) => {
      // Prevent Print Screen
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        e.preventDefault();
        return false;
      }
      
      // Prevent Ctrl+P (Print)
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        return false;
      }
      
      // Prevent Ctrl+S (Save)
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        return false;
      }
      
      // Prevent Ctrl+Shift+I (Developer Tools)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        return false;
      }
      
      // Prevent F12 (Developer Tools)
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
    };

    // Prevent drag and drop
    const handleDragStart = (e) => {
      e.preventDefault();
      return false;
    };

    // Prevent selection
    const handleSelectStart = (e) => {
      e.preventDefault();
      return false;
    };

    // Prevent copy
    const handleCopy = (e) => {
      e.preventDefault();
      return false;
    };

    // Prevent cut
    const handleCut = (e) => {
      e.preventDefault();
      return false;
    };

    // Add event listeners
    container.addEventListener('contextmenu', handleContextMenu);
    container.addEventListener('keydown', handleKeyDown);
    container.addEventListener('dragstart', handleDragStart);
    container.addEventListener('selectstart', handleSelectStart);
    container.addEventListener('copy', handleCopy);
    container.addEventListener('cut', handleCut);

    // Add CSS class for additional protection
    container.classList.add('screenshot-protected');

    // Cleanup function
    return () => {
      container.removeEventListener('contextmenu', handleContextMenu);
      container.removeEventListener('keydown', handleKeyDown);
      container.removeEventListener('dragstart', handleDragStart);
      container.removeEventListener('selectstart', handleSelectStart);
      container.removeEventListener('copy', handleCopy);
      container.removeEventListener('cut', handleCut);
      container.classList.remove('screenshot-protected');
    };
  }, [enabled]);

  // Additional protection for video elements
  useEffect(() => {
    if (!enabled) return;

    const videoElements = containerRef.current?.querySelectorAll('video, .video-react');
    if (videoElements) {
      videoElements.forEach(video => {
        video.classList.add('video-protected');
        
        // Disable video controls context menu
        video.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          return false;
        });
      });
    }
  }, [enabled]);

  return (
    <div 
      ref={containerRef}
      className={`screenshot-protected ${enabled ? 'protected' : ''}`}
      style={{
        position: 'relative',
        ...(enabled && {
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          userSelect: 'none',
        })
      }}
    >
      {children}
    </div>
  );
};

export default ScreenshotProtection;