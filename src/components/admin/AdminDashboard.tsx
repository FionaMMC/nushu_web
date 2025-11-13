import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Images,
  BarChart3,
  Plus,
  Edit,
  Trash2,
  LogOut,
  AlertCircle,
  CheckCircle,
  FileText,
  Book,
  Clock
} from 'lucide-react';
import { adminApi, eventsApi, galleryApi, blogApi, authStorage, Event, GalleryImage, BlogPost } from '../../services/api';
import { useAsyncAction } from '../../hooks/useApi';
import EventForm from './EventForm';
import GalleryUpload from './GalleryUpload';
import BlogUpload from './BlogUpload';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'events' | 'gallery' | 'blog'>('dashboard');
  const [showEventForm, setShowEventForm] = useState(false);
  const [showGalleryUpload, setShowGalleryUpload] = useState(false);
  const [showBlogUpload, setShowBlogUpload] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);

  const token = authStorage.getToken();

  // Async actions
  const { execute: loadDashboard, loading: dashboardLoading } = useAsyncAction(
    () => adminApi.getDashboard(token!)
  );
  
  const { execute: loadEvents, loading: eventsLoading } = useAsyncAction(
    () => eventsApi.getAll({ status: 'all', limit: 50 })
  );
  
  const { execute: loadGallery, loading: galleryLoading } = useAsyncAction(
    () => galleryApi.getAll({ limit: 50 })
  );

  const { execute: loadBlogs, loading: blogsLoading } = useAsyncAction(
    () => blogApi.getAll({ published: 'all', limit: 50 })
  );

  const { execute: saveEvent, loading: saveEventLoading } = useAsyncAction(
    async (eventData: any) => {
      console.log('=== SAVE EVENT ASYNC ACTION DEBUG START ===');
      console.log('saveEvent asyncAction - Received data:', eventData);
      console.log('saveEvent asyncAction - Data type:', typeof eventData);
      console.log('saveEvent asyncAction - Is editing:', !!editingEvent);
      console.log('saveEvent asyncAction - Editing event ID:', editingEvent?._id);
      console.log('saveEvent asyncAction - Token available:', !!token);
      
      try {
        let result;
        if (editingEvent) {
          console.log('saveEvent asyncAction - Calling eventsApi.update...');
          result = await eventsApi.update(editingEvent._id, eventData, token!);
          console.log('saveEvent asyncAction - Update result:', result);
        } else {
          console.log('saveEvent asyncAction - Calling eventsApi.create...');
          result = await eventsApi.create(eventData, token!);
          console.log('saveEvent asyncAction - Create result:', result);
        }
        console.log('=== SAVE EVENT ASYNC ACTION SUCCESS ===');
        return result;
      } catch (error) {
        console.error('=== SAVE EVENT ASYNC ACTION ERROR ===');
        console.error('saveEvent asyncAction - Error:', error);
        console.error('saveEvent asyncAction - Error type:', typeof error);
        console.error('saveEvent asyncAction - Error details:', {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        });
        console.error('=== SAVE EVENT ASYNC ACTION ERROR END ===');
        throw error;
      }
    }
  );

  const { execute: deleteEvent, loading: deleteEventLoading } = useAsyncAction(
    (eventId: string) => eventsApi.delete(eventId, token!)
  );


  const { execute: deleteImage, loading: deleteImageLoading } = useAsyncAction(
    (imageId: string) => galleryApi.delete(imageId, false, token!)
  );

  const { execute: deleteBlog, loading: deleteBlogLoading } = useAsyncAction(
    (blogId: string) => blogApi.delete(blogId, token!)
  );

  // Load data on mount and tab change
  useEffect(() => {
    if (activeTab === 'dashboard' && !dashboardData) {
      loadDashboard().then(setDashboardData).catch(console.error);
    } else if (activeTab === 'events' && events.length === 0) {
      loadEvents().then(data => setEvents(data.events)).catch(console.error);
    } else if (activeTab === 'gallery' && galleryImages.length === 0) {
      loadGallery().then(data => setGalleryImages(data.images)).catch(console.error);
    } else if (activeTab === 'blog' && blogPosts.length === 0) {
      loadBlogs().then(data => setBlogPosts(data.posts)).catch(console.error);
    }
  }, [activeTab]);

  const handleLogout = () => {
    authStorage.removeToken();
    window.location.reload();
  };

  const handleSaveEvent = async (eventData: any) => {
    console.log('=== ADMIN DASHBOARD SAVE DEBUG START ===');
    console.log('AdminDashboard - handleSaveEvent called at:', new Date().toISOString());
    console.log('AdminDashboard - Received event data:', eventData);
    console.log('AdminDashboard - Event data type:', typeof eventData);
    console.log('AdminDashboard - Event data keys:', eventData ? Object.keys(eventData) : 'null/undefined');
    console.log('AdminDashboard - Current editing event:', editingEvent);
    console.log('AdminDashboard - Is editing mode:', !!editingEvent);
    console.log('AdminDashboard - Token available:', !!token);
    console.log('AdminDashboard - Token preview:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');
    
    try {
      console.log('AdminDashboard - About to call saveEvent function...');
      const result = await saveEvent(eventData);
      console.log('AdminDashboard - saveEvent completed successfully');
      console.log('AdminDashboard - saveEvent result:', result);
      
      console.log('AdminDashboard - Cleaning up form state...');
      setShowEventForm(false);
      setEditingEvent(null);
      
      console.log('AdminDashboard - Reloading events...');
      const data = await loadEvents();
      setEvents(data.events);
      console.log('AdminDashboard - Events reloaded successfully, count:', data.events?.length || 0);
      
    } catch (error) {
      console.error('=== ADMIN DASHBOARD ERROR ===');
      console.error('AdminDashboard - Error saving event:', error);
      console.error('AdminDashboard - Error type:', typeof error);
      console.error('AdminDashboard - Error constructor:', error instanceof Error ? error.constructor.name : 'Not Error');
      console.error('AdminDashboard - Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined,
        originalEventData: eventData
      });
      console.error('=== ADMIN DASHBOARD ERROR END ===');
      // Don't close the form on error so user can try again
    }
    
    console.log('=== ADMIN DASHBOARD SAVE DEBUG END ===');
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    try {
      await deleteEvent(eventId);
      setEvents(prev => prev.filter(e => e._id !== eventId));
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleGalleryUploadSuccess = async () => {
    try {
      setShowGalleryUpload(false);
      // Reload gallery
      const data = await loadGallery();
      setGalleryImages(data.images);
    } catch (error) {
      console.error('Error reloading gallery:', error);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    
    try {
      await deleteImage(imageId);
      setGalleryImages(prev => prev.filter(i => i._id !== imageId));
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const handleBlogUploadSuccess = async () => {
    try {
      setShowBlogUpload(false);
      // Reload blog posts
      const data = await loadBlogs();
      setBlogPosts(data.posts);
    } catch (error) {
      console.error('Error reloading blog posts:', error);
    }
  };

  const handleDeleteBlog = async (blogId: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;

    try {
      await deleteBlog(blogId);
      setBlogPosts(prev => prev.filter(b => b._id !== blogId));
    } catch (error) {
      console.error('Error deleting blog post:', error);
    }
  };

  if (showEventForm) {
    return (
      <EventForm
        event={editingEvent || undefined}
        onSave={handleSaveEvent}
        onCancel={() => {
          setShowEventForm(false);
          setEditingEvent(null);
        }}
        loading={saveEventLoading}
      />
    );
  }

  if (showGalleryUpload) {
    return (
      <GalleryUpload
        onSuccess={handleGalleryUploadSuccess}
        onCancel={() => setShowGalleryUpload(false)}
      />
    );
  }

  if (showBlogUpload) {
    return (
      <BlogUpload
        onSuccess={handleBlogUploadSuccess}
        onCancel={() => setShowBlogUpload(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-nushu-warm-white">
      <div className="bg-white shadow-sm border-b border-nushu-sage/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-serif text-nushu-sage">Admin Dashboard</h1>
              <nav className="flex gap-6">
                {[
                  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                  { id: 'events', label: 'Events', icon: Calendar },
                  { id: 'gallery', label: 'Gallery', icon: Images },
                  { id: 'blog', label: 'Blog', icon: Book }
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id as any)}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                      activeTab === id 
                        ? 'text-nushu-terracotta border-b-2 border-nushu-terracotta' 
                        : 'text-nushu-sage hover:text-nushu-terracotta'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </nav>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm text-nushu-sage hover:text-nushu-terracotta transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Events', value: dashboardData?.stats?.totalEvents || 0, icon: Calendar, color: 'nushu-terracotta' },
                { label: 'Upcoming Events', value: dashboardData?.stats?.upcomingEvents || 0, icon: Clock, color: 'nushu-sage' },
                { label: 'Gallery Images', value: dashboardData?.stats?.totalImages || 0, icon: Images, color: 'nushu-terracotta' },
                { label: 'Total Registrations', value: dashboardData?.stats?.totalRegistrations || 0, icon: Users, color: 'nushu-sage' }
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-nushu-sage/60 text-sm">{label}</p>
                      <p className={`text-3xl font-bold text-${color} mt-1`}>{value}</p>
                    </div>
                    <Icon className={`w-8 h-8 text-${color}`} />
                  </div>
                </div>
              ))}
            </div>
            
            {dashboardData?.recentActivity && (
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-serif text-nushu-sage mb-4">Recent Events</h3>
                  <div className="space-y-3">
                    {dashboardData.recentActivity.events.map((event: any) => (
                      <div key={event._id} className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          event.status === 'current' ? 'bg-nushu-terracotta' : 'bg-nushu-sage'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-nushu-sage font-medium truncate">{event.title}</p>
                          <p className="text-nushu-sage/60 text-sm">{event.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-serif text-nushu-sage mb-4">Recent Images</h3>
                  <div className="space-y-3">
                    {dashboardData.recentActivity.images.map((image: any) => (
                      <div key={image._id} className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-nushu-cream rounded flex items-center justify-center">
                          <Images className="w-4 h-4 text-nushu-terracotta" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-nushu-sage font-medium truncate">{image.title}</p>
                          <p className="text-nushu-sage/60 text-sm capitalize">{image.category}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-serif text-nushu-sage">Events Management</h2>
              <button
                onClick={() => setShowEventForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-nushu-terracotta text-white rounded-lg hover:bg-nushu-terracotta/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Event
              </button>
            </div>

            <div className="grid gap-4">
              {events.map((event) => (
                <div key={event._id} className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-nushu-sage">{event.title}</h3>
                        <span className={`px-2 py-1 text-xs rounded ${
                          event.status === 'current' ? 'bg-nushu-terracotta/10 text-nushu-terracotta' : 'bg-nushu-sage/10 text-nushu-sage'
                        }`}>
                          {event.status}
                        </span>
                        {!event.isActive && (
                          <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-700">
                            Inactive
                          </span>
                        )}
                      </div>
                      <div className="text-nushu-sage/80 text-sm space-y-1">
                        <p className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {event.date} • {event.time}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingEvent(event);
                          setShowEventForm(true);
                        }}
                        className="p-2 text-nushu-sage hover:text-nushu-terracotta transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event._id)}
                        disabled={deleteEventLoading}
                        className="p-2 text-nushu-sage hover:text-red-600 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-serif text-nushu-sage">Gallery Management</h2>
              <button
                onClick={() => setShowGalleryUpload(true)}
                className="flex items-center gap-2 px-4 py-2 bg-nushu-terracotta text-white rounded-lg hover:bg-nushu-terracotta/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Upload Image
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryImages.map((image) => (
                <div key={image._id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <img
                    src={image.thumbnailUrl}
                    alt={image.alt}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-nushu-sage truncate">{image.title}</h4>
                        <p className="text-nushu-sage/60 text-sm capitalize">{image.category}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteImage(image._id)}
                        disabled={deleteImageLoading}
                        className="p-1 text-nushu-sage hover:text-red-600 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {image.description && (
                      <p className="text-nushu-sage/80 text-sm line-clamp-2">
                        {image.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'blog' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-serif text-nushu-sage">Blog Management</h2>
              <button
                onClick={() => setShowBlogUpload(true)}
                className="flex items-center gap-2 px-4 py-2 bg-nushu-terracotta text-white rounded-lg hover:bg-nushu-terracotta/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Blog Post
              </button>
            </div>

            {blogsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nushu-terracotta"></div>
              </div>
            ) : (
              <div className="grid gap-6">
                {blogPosts.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                    <Book className="w-16 h-16 text-nushu-sage/30 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-nushu-sage mb-2">No Blog Posts Yet</h3>
                    <p className="text-nushu-sage/60">
                      Click "New Blog Post" to create your first article.
                    </p>
                  </div>
                ) : (
                  blogPosts.map((post) => (
                    <div key={post._id} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex gap-6">
                        {post.imageUrl && (
                          <div className="flex-shrink-0 w-48 h-32 rounded-lg overflow-hidden bg-nushu-cream">
                            <img
                              src={post.imageUrl}
                              alt={post.imageAlt || post.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="text-xl font-medium text-nushu-sage mb-2">{post.title}</h3>
                              <div className="flex items-center gap-4 text-sm text-nushu-sage/60">
                                <span>By {post.author}</span>
                                <span>•</span>
                                <span>{new Date(post.date).toLocaleDateString()}</span>
                                {post.category && (
                                  <>
                                    <span>•</span>
                                    <span className="px-2 py-1 bg-nushu-terracotta/10 text-nushu-terracotta rounded text-xs">
                                      {post.category}
                                    </span>
                                  </>
                                )}
                                {!post.isPublished && (
                                  <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">
                                    Draft
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleDeleteBlog(post._id)}
                                disabled={deleteBlogLoading}
                                className="p-2 text-nushu-sage hover:text-red-600 transition-colors disabled:opacity-50"
                                title="Delete blog post"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {post.excerpt && (
                            <p className="text-nushu-sage/70 text-sm mb-3 line-clamp-2">
                              {post.excerpt}
                            </p>
                          )}

                          {post.tags && post.tags.length > 0 && (
                            <div className="flex items-center gap-2 flex-wrap">
                              {post.tags.map((tag, idx) => (
                                <span key={idx} className="text-xs px-2 py-1 bg-nushu-cream text-nushu-sage rounded">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
