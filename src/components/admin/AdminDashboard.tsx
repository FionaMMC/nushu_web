import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Images, 
  Users, 
  BarChart3, 
  Plus, 
  Edit, 
  Trash2, 
  LogOut,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  Mail,
  MessageSquare,
  Eye,
  Archive
} from 'lucide-react';
import { adminApi, eventsApi, galleryApi, contactsApi, authStorage, Event, GalleryImage, Contact } from '../../services/api';
import { useAsyncAction } from '../../hooks/useApi';
import EventForm from './EventForm';
import GalleryUpload from './GalleryUpload';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'events' | 'gallery' | 'contacts' | 'settings'>('dashboard');
  const [showEventForm, setShowEventForm] = useState(false);
  const [showGalleryUpload, setShowGalleryUpload] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const token = authStorage.getToken();

  // Async actions
  const { execute: loadDashboard, loading: dashboardLoading } = useAsyncAction(
    () => adminApi.getDashboard(token!)
  );
  
  const { execute: loadEvents, loading: eventsLoading } = useAsyncAction(
    () => eventsApi.getAll({ limit: 50 })
  );
  
  const { execute: loadGallery, loading: galleryLoading } = useAsyncAction(
    () => galleryApi.getAll({ limit: 50 })
  );

  const { execute: loadContacts, loading: contactsLoading } = useAsyncAction(
    () => contactsApi.getAll({ limit: 100 }, token!)
  );

  const { execute: saveEvent, loading: saveEventLoading } = useAsyncAction(
    async (eventData: any) => {
      if (editingEvent) {
        return await eventsApi.update(editingEvent._id, eventData, token!);
      } else {
        return await eventsApi.create(eventData, token!);
      }
    }
  );

  const { execute: deleteEvent, loading: deleteEventLoading } = useAsyncAction(
    (eventId: string) => eventsApi.delete(eventId, token!)
  );

  const { execute: uploadImage, loading: uploadImageLoading } = useAsyncAction(
    async (file: File, metadata: any) => {
      const formData = new FormData();
      formData.append('image', file);
      Object.entries(metadata).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, String(value));
        }
      });
      return await galleryApi.upload(formData, token!);
    }
  );

  const { execute: deleteImage, loading: deleteImageLoading } = useAsyncAction(
    (imageId: string) => galleryApi.delete(imageId, false, token!)
  );

  const { execute: updateContactStatus, loading: updateContactLoading } = useAsyncAction(
    (contactId: string, status: string, response?: string) => 
      contactsApi.updateStatus(contactId, status, response, token!)
  );

  const { execute: deleteContact, loading: deleteContactLoading } = useAsyncAction(
    (contactId: string) => contactsApi.delete(contactId, token!)
  );

  // Load data on mount and tab change
  useEffect(() => {
    if (activeTab === 'dashboard' && !dashboardData) {
      loadDashboard().then(setDashboardData).catch(console.error);
    } else if (activeTab === 'events' && events.length === 0) {
      loadEvents().then(data => setEvents(data.events)).catch(console.error);
    } else if (activeTab === 'gallery' && galleryImages.length === 0) {
      loadGallery().then(data => setGalleryImages(data.images)).catch(console.error);
    } else if (activeTab === 'contacts' && contacts.length === 0) {
      loadContacts().then(data => setContacts(data.data.contacts)).catch(console.error);
    }
  }, [activeTab]);

  const handleLogout = () => {
    authStorage.removeToken();
    window.location.reload();
  };

  const handleSaveEvent = async (eventData: any) => {
    try {
      await saveEvent(eventData);
      setShowEventForm(false);
      setEditingEvent(null);
      // Reload events
      const data = await loadEvents();
      setEvents(data.events);
    } catch (error) {
      console.error('Error saving event:', error);
    }
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

  const handleUploadImage = async (file: File, metadata: any) => {
    try {
      await uploadImage(file, metadata);
      setShowGalleryUpload(false);
      // Reload gallery
      const data = await loadGallery();
      setGalleryImages(data.images);
    } catch (error) {
      console.error('Error uploading image:', error);
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

  const handleContactStatusUpdate = async (contactId: string, status: string, response?: string) => {
    try {
      await updateContactStatus(contactId, status, response);
      // Reload contacts to get updated data
      const data = await loadContacts();
      setContacts(data.data.contacts);
      setSelectedContact(null);
    } catch (error) {
      console.error('Error updating contact status:', error);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;
    
    try {
      await deleteContact(contactId);
      setContacts(prev => prev.filter(c => c._id !== contactId));
      if (selectedContact?._id === contactId) {
        setSelectedContact(null);
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
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
        onUpload={handleUploadImage}
        onCancel={() => setShowGalleryUpload(false)}
        loading={uploadImageLoading}
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
                  { id: 'contacts', label: 'Contacts', icon: MessageSquare },
                  { id: 'settings', label: 'Settings', icon: Settings }
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
                          event.status === 'upcoming' ? 'bg-nushu-terracotta' : 
                          event.status === 'ongoing' ? 'bg-green-500' : 'bg-nushu-sage'
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
                          event.status === 'upcoming' ? 'bg-nushu-terracotta/10 text-nushu-terracotta' :
                          event.status === 'ongoing' ? 'bg-green-100 text-green-700' : 'bg-nushu-sage/10 text-nushu-sage'
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
                        <p className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          {event.currentRegistrations || 0} / {event.capacity || '∞'} registered
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

        {activeTab === 'contacts' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-serif text-nushu-sage">Contact Management</h2>
              <div className="flex items-center gap-2 text-sm text-nushu-sage/60">
                <MessageSquare className="w-4 h-4" />
                <span>{contacts.length} total contacts</span>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Contacts List */}
              <div className="lg:col-span-1 bg-white rounded-lg shadow-sm">
                <div className="p-4 border-b border-nushu-sage/10">
                  <h3 className="font-medium text-nushu-sage">Contact List</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {contacts.length === 0 ? (
                    <div className="text-center py-8">
                      <Mail className="w-12 h-12 text-nushu-sage/30 mx-auto mb-2" />
                      <p className="text-nushu-sage/60 text-sm">No contacts yet</p>
                    </div>
                  ) : (
                    contacts.map((contact) => (
                      <button
                        key={contact._id}
                        onClick={() => setSelectedContact(contact)}
                        className={`w-full p-4 text-left hover:bg-nushu-cream transition-colors border-b border-nushu-sage/5 last:border-b-0 ${
                          selectedContact?._id === contact._id ? 'bg-nushu-cream' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-nushu-sage truncate">{contact.name}</p>
                            <p className="text-nushu-sage/60 text-sm truncate">{contact.email}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full flex-shrink-0 ml-2 ${
                            contact.status === 'new' ? 'bg-nushu-terracotta/10 text-nushu-terracotta' :
                            contact.status === 'read' ? 'bg-blue-100 text-blue-700' :
                            contact.status === 'responded' ? 'bg-green-100 text-green-700' : 'bg-nushu-sage/10 text-nushu-sage'
                          }`}>
                            {contact.status}
                          </span>
                        </div>
                        <p className="text-nushu-sage/60 text-xs">{contact.timeAgo || new Date(contact.createdAt).toLocaleDateString()}</p>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Contact Details */}
              <div className="lg:col-span-2 bg-white rounded-lg shadow-sm">
                {selectedContact ? (
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-medium text-nushu-sage mb-2">{selectedContact.name}</h3>
                        <div className="space-y-1 text-sm text-nushu-sage/70">
                          <p className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            {selectedContact.email}
                          </p>
                          <p className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {new Date(selectedContact.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 text-sm rounded-full ${
                          selectedContact.status === 'new' ? 'bg-nushu-terracotta/10 text-nushu-terracotta' :
                          selectedContact.status === 'read' ? 'bg-blue-100 text-blue-700' :
                          selectedContact.status === 'responded' ? 'bg-green-100 text-green-700' : 'bg-nushu-sage/10 text-nushu-sage'
                        }`}>
                          {selectedContact.status}
                        </span>
                        <button
                          onClick={() => handleDeleteContact(selectedContact._id)}
                          disabled={deleteContactLoading}
                          className="p-2 text-nushu-sage hover:text-red-600 transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium text-nushu-sage mb-2">Message</h4>
                        <div className="bg-nushu-cream p-4 rounded-lg">
                          <p className="text-nushu-sage whitespace-pre-wrap">{selectedContact.message}</p>
                        </div>
                      </div>

                      {selectedContact.response && (
                        <div>
                          <h4 className="font-medium text-nushu-sage mb-2">Your Response</h4>
                          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <p className="text-green-800 whitespace-pre-wrap">{selectedContact.response}</p>
                            {selectedContact.respondedAt && (
                              <p className="text-green-600 text-sm mt-2">
                                Responded on {new Date(selectedContact.respondedAt).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Contact Actions */}
                      <div className="flex items-center gap-3">
                        {selectedContact.status === 'archived' ? (
                          <button
                            onClick={() => handleContactStatusUpdate(selectedContact._id, 'new')}
                            disabled={updateContactLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                          >
                            <Eye className="w-4 h-4" />
                            Mark as Unread
                          </button>
                        ) : (
                          <>
                            {selectedContact.status !== 'new' && (
                              <button
                                onClick={() => handleContactStatusUpdate(selectedContact._id, 'new')}
                                disabled={updateContactLoading}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                              >
                                <Eye className="w-4 h-4" />
                                Mark as Unread
                              </button>
                            )}
                            
                            <button
                              onClick={() => handleContactStatusUpdate(selectedContact._id, 'archived')}
                              disabled={updateContactLoading}
                              className="flex items-center gap-2 px-4 py-2 bg-nushu-sage text-white rounded-lg hover:bg-nushu-sage/90 transition-colors disabled:opacity-50"
                            >
                              <Archive className="w-4 h-4" />
                              Mark as Archive
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MessageSquare className="w-16 h-16 text-nushu-sage/30 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-nushu-sage mb-2">Select a Contact</h3>
                    <p className="text-nushu-sage/60">
                      Choose a contact from the list to view details and respond.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-serif text-nushu-sage">Settings</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-center py-12">
                <Settings className="w-16 h-16 text-nushu-sage/30 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-nushu-sage mb-2">Settings Coming Soon</h3>
                <p className="text-nushu-sage/60">
                  Advanced configuration options will be available here.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;