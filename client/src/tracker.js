class AnalyticsTracker {
  constructor(config = {}) {
    this.apiUrl = config.apiUrl || '/api/v1';
    this.sessionId = this.getSessionId();
    this.queue = [];
    this.isOnline = navigator.onLine;
    this.batchSize = config.batchSize || 10;
    this.flushInterval = config.flushInterval || 5000;

    // Initialize tracking
    this.init();
  }

  init() {
    // Auto-track page views
    this.trackPageView();

    // Setup event listeners
    this.setupClickTracking();
    this.setupVisibilityTracking();
    this.setupOnlineOfflineTracking();

    // Start periodic flush
    this.startPeriodicFlush();

    // Flush queue on page unload
    this.setupUnloadTracking();
  }

  getSessionId() {
    // Check if session ID exists in localStorage
    let sessionId = localStorage.getItem('analytics_session_id');

    if (!sessionId) {
      // Generate new session ID
      sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('analytics_session_id', sessionId);
    }

    return sessionId;
  }

  track(type, data = {}) {
    const event = {
      sessionId: this.sessionId,
      type,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      data: {
        ...data,
        userAgent: navigator.userAgent,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight
      }
    };

    this.queue.push(event);

    // Flush immediately for critical events or if batch is full
    if (type === 'page_view' || this.queue.length >= this.batchSize) {
      this.flush();
    }
  }

  trackPageView() {
    this.track('page_view', {
      title: document.title,
      referrer: document.referrer
    });
  }

  trackClick(event) {
    // Don't track clicks on sensitive elements
    const element = event.target;
    if (element.tagName === 'INPUT' && element.type === 'password') {
      return;
    }

    this.track('click', {
      x: event.clientX,
      y: event.clientY,
      element: element.tagName.toLowerCase(),
      elementId: element.id,
      elementClass: element.className,
      elementText: element.textContent?.substring(0, 100) // Truncate long text
    });
  }

  setupClickTracking() {
    document.addEventListener('click', this.trackClick.bind(this), true);
  }

  setupVisibilityTracking() {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.trackPageView();
      }
    });
  }

  setupOnlineOfflineTracking() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flush();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  setupUnloadTracking() {
    // Use sendBeacon for reliable delivery on page unload
    const flushOnUnload = () => {
      if (this.queue.length > 0) {
        const data = JSON.stringify(this.queue);
        navigator.sendBeacon(`${this.apiUrl}/events`, data);
        this.queue = [];
      }
    };

    window.addEventListener('beforeunload', flushOnUnload);
    window.addEventListener('pagehide', flushOnUnload);
  }

  startPeriodicFlush() {
    setInterval(() => {
      if (this.queue.length > 0) {
        this.flush();
      }
    }, this.flushInterval);
  }

  async flush() {
    if (!this.isOnline || this.queue.length === 0) {
      return;
    }

    const events = this.queue.splice(0);

    try {
      // Send events in batches
      for (let i = 0; i < events.length; i += this.batchSize) {
        const batch = events.slice(i, i + this.batchSize);

        // Use fetch with keepalive for better reliability
        await fetch(`${this.apiUrl}/events`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(batch.length === 1 ? batch[0] : batch),
          keepalive: true
        });
      }
    } catch (error) {
      // Re-queue failed events
      this.queue.unshift(...events);
      console.warn('Failed to send analytics events:', error);
    }
  }

  // Public methods
  identify(userId, traits = {}) {
    this.userId = userId;
    this.traits = traits;
    localStorage.setItem('analytics_user_id', userId);
    localStorage.setItem('analytics_traits', JSON.stringify(traits));
  }

  reset() {
    // Clear session and user data
    localStorage.removeItem('analytics_session_id');
    localStorage.removeItem('analytics_user_id');
    localStorage.removeItem('analytics_traits');
    this.sessionId = this.generateSessionId();
    this.userId = null;
    this.traits = {};
  }

  generateSessionId() {
    return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}

// Auto-initialize if script is loaded
(function() {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.AnalyticsTracker = new AnalyticsTracker({
        apiUrl: window.ANALYTICS_API_URL || '/api/v1'
      });
    });
  } else {
    window.AnalyticsTracker = new AnalyticsTracker({
      apiUrl: window.ANALYTICS_API_URL || '/api/v1'
    });
  }
})();