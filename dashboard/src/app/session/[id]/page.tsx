'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { analyticsApi, Event, Session } from '@/services/api';
import { formatDistanceToNow } from 'date-fns';

export default function SessionDetail() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [session, setSession] = useState<Session | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'events' | 'journey'>('events');

  useEffect(() => {
    if (sessionId) {
      fetchSessionData();
    }
  }, [sessionId]);

  const fetchSessionData = async () => {
    try {
      setLoading(true);
      const response = await analyticsApi.getSessionEvents(sessionId);
      setSession(response.session);
      setEvents(response.data);
    } catch (error) {
      console.error('Failed to fetch session data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'page_view':
        return '👁️';
      case 'click':
        return '👆';
      default:
        return '📌';
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'page_view':
        return 'text-blue-600 bg-blue-50';
      case 'click':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Session not found</h2>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to Sessions
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Session Details</h1>
          <p className="text-gray-600 mt-2">Session ID: {session.sessionId}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Events</h3>
            <p className="text-3xl font-bold text-gray-900">{session.eventCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Page Views</h3>
            <p className="text-3xl font-bold text-blue-600">{session.pageViews}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Clicks</h3>
            <p className="text-3xl font-bold text-green-600">{session.clicks}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Session Duration</h3>
            <p className="text-3xl font-bold text-gray-900">
              {formatDistanceToNow(new Date(session.startTime), { addSuffix: false })}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('events')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'events'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Event Timeline
              </button>
              <button
                onClick={() => setActiveTab('journey')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'journey'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                User Journey
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'events' && (
              <div className="space-y-4">
                {events.map((event, index) => (
                  <div key={event._id} className="flex items-start space-x-4">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getEventColor(event.type)}`}>
                      <span className="text-lg">{getEventIcon(event.type)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {event.type === 'page_view' ? 'Page View' : 'Click'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(event.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {event.url}
                      </p>
                      {event.type === 'click' && event.data && (
                        <p className="text-xs text-gray-500 mt-1">
                          Clicked at ({event.data.x}, {event.data.y}) on {event.data.element}
                          {event.data.elementId && ` #${event.data.elementId}`}
                        </p>
                      )}
                      {event.type === 'page_view' && event.data?.title && (
                        <p className="text-xs text-gray-500 mt-1">
                          Page title: {event.data.title}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'journey' && (
              <div className="space-y-6">
                {events
                  .filter(e => e.type === 'page_view')
                  .map((event, index) => (
                    <div key={event._id} className="relative">
                      {index > 0 && (
                        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-300 -ml-px"></div>
                      )}
                      <div className="flex items-start space-x-4">
                        <div className="relative flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">{index + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-gray-900">
                            {event.data?.title || 'Untitled Page'}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">{event.url}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(event.timestamp).toLocaleString()}
                          </p>
                          <div className="mt-2">
                            <p className="text-sm font-medium text-gray-700 mb-1">Interactions:</p>
                            <div className="space-y-1">
                              {events
                                .filter(
                                  (e, idx) =>
                                    e.type === 'click' &&
                                    idx > events.findIndex(ev => ev._id === event._id) &&
                                    (idx < events.findIndex(ev => ev._id === event._id) + 10 || true)
                                )
                                .slice(0, 5)
                                .map((clickEvent) => (
                                  <div key={clickEvent._id} className="flex items-center space-x-2 text-sm text-gray-600">
                                    <span>👆</span>
                                    <span>Clicked on {clickEvent.data?.element}</span>
                                    {clickEvent.data?.elementId && (
                                      <span className="text-gray-400">#{clickEvent.data.elementId}</span>
                                    )}
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}