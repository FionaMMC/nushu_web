import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Tag, FileText, Users, Link, Save, X } from 'lucide-react';
import { Event } from '../../services/api';

interface EventFormProps {
  event?: Event;
  onSave: (eventData: Omit<Event, '_id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const EventForm: React.FC<EventFormProps> = ({ event, onSave, onCancel, loading = false }) => {
  const [formData, setFormData] = useState({
    title: event?.title || '',
    date: event?.date || '',
    time: event?.time || '',
    venue: event?.venue || '',
    tags: event?.tags?.join(', ') || '',
    blurb: event?.blurb || '',
    status: event?.status || 'upcoming' as const,
    registrationLink: event?.registrationLink || '',
    capacity: event?.capacity?.toString() || '',
    currentRegistrations: event?.currentRegistrations?.toString() || '',
    priority: event?.priority || 0,
    isActive: event?.isActive ?? true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.time.trim()) newErrors.time = 'Time is required';
    if (!formData.venue.trim()) newErrors.venue = 'Venue is required';
    if (!formData.blurb.trim()) newErrors.blurb = 'Description is required';

    // Validate date format
    if (formData.date && !/^\d{4}-\d{2}-\d{2}$/.test(formData.date)) {
      newErrors.date = 'Date must be in YYYY-MM-DD format';
    }

    // Validate capacity if provided
    if (formData.capacity && (isNaN(Number(formData.capacity)) || Number(formData.capacity) < 1)) {
      newErrors.capacity = 'Capacity must be a positive number';
    }

    // Validate current registrations
    if (formData.currentRegistrations && (isNaN(Number(formData.currentRegistrations)) || Number(formData.currentRegistrations) < 0)) {
      newErrors.currentRegistrations = 'Current registrations must be a non-negative number';
    }

    // Check if current registrations exceed capacity
    if (formData.capacity && formData.currentRegistrations && 
        Number(formData.currentRegistrations) > Number(formData.capacity)) {
      newErrors.currentRegistrations = 'Current registrations cannot exceed capacity';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const eventData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        capacity: formData.capacity && formData.capacity.toString().trim() !== '' ? Number(formData.capacity) : undefined,
        currentRegistrations: formData.currentRegistrations && formData.currentRegistrations.toString().trim() !== '' ? Number(formData.currentRegistrations) : undefined,
        priority: Number(formData.priority) || 0
      };
      
      // Debug log before sending
      console.log('EventForm - Preparing to send event data:', eventData);

      await onSave(eventData as any);
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-serif text-nushu-sage">
          {event ? 'Edit Event' : 'Create New Event'}
        </h2>
        <button
          onClick={onCancel}
          className="text-nushu-sage hover:text-nushu-terracotta transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Title */}
          <div className="md:col-span-2">
            <label className="flex items-center gap-2 text-sm font-medium text-nushu-sage mb-2">
              <FileText className="w-4 h-4" />
              Event Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-nushu-terracotta focus:border-nushu-terracotta ${
                errors.title ? 'border-red-500' : 'border-nushu-sage/20'
              }`}
              placeholder="Enter event title"
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          {/* Date */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-nushu-sage mb-2">
              <Calendar className="w-4 h-4" />
              Date *
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-nushu-terracotta focus:border-nushu-terracotta ${
                errors.date ? 'border-red-500' : 'border-nushu-sage/20'
              }`}
            />
            {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
          </div>

          {/* Time */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-nushu-sage mb-2">
              <Clock className="w-4 h-4" />
              Time *
            </label>
            <input
              type="text"
              name="time"
              value={formData.time}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-nushu-terracotta focus:border-nushu-terracotta ${
                errors.time ? 'border-red-500' : 'border-nushu-sage/20'
              }`}
              placeholder="e.g., 18:00 – 20:00"
            />
            {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time}</p>}
          </div>

          {/* Venue */}
          <div className="md:col-span-2">
            <label className="flex items-center gap-2 text-sm font-medium text-nushu-sage mb-2">
              <MapPin className="w-4 h-4" />
              Venue *
            </label>
            <input
              type="text"
              name="venue"
              value={formData.venue}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-nushu-terracotta focus:border-nushu-terracotta ${
                errors.venue ? 'border-red-500' : 'border-nushu-sage/20'
              }`}
              placeholder="Enter venue location"
            />
            {errors.venue && <p className="text-red-500 text-sm mt-1">{errors.venue}</p>}
          </div>

          {/* Tags */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-nushu-sage mb-2">
              <Tag className="w-4 h-4" />
              Tags
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-nushu-sage/20 rounded-lg focus:ring-2 focus:ring-nushu-terracotta focus:border-nushu-terracotta"
              placeholder="Separate tags with commas"
            />
            <p className="text-nushu-sage/60 text-xs mt-1">e.g., Workshop, Academic, Social</p>
          </div>

          {/* Status */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-nushu-sage mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-nushu-sage/20 rounded-lg focus:ring-2 focus:ring-nushu-terracotta focus:border-nushu-terracotta"
            >
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Capacity */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-nushu-sage mb-2">
              <Users className="w-4 h-4" />
              Capacity
            </label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-nushu-terracotta focus:border-nushu-terracotta ${
                errors.capacity ? 'border-red-500' : 'border-nushu-sage/20'
              }`}
              placeholder="Maximum attendees"
              min="1"
            />
            {errors.capacity && <p className="text-red-500 text-sm mt-1">{errors.capacity}</p>}
          </div>

          {/* Current Registrations */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-nushu-sage mb-2">
              Current Registrations
            </label>
            <input
              type="number"
              name="currentRegistrations"
              value={formData.currentRegistrations}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-nushu-terracotta focus:border-nushu-terracotta ${
                errors.currentRegistrations ? 'border-red-500' : 'border-nushu-sage/20'
              }`}
              placeholder="Current registrations"
              min="0"
            />
            {errors.currentRegistrations && <p className="text-red-500 text-sm mt-1">{errors.currentRegistrations}</p>}
          </div>

          {/* Registration Link */}
          <div className="md:col-span-2">
            <label className="flex items-center gap-2 text-sm font-medium text-nushu-sage mb-2">
              <Link className="w-4 h-4" />
              Registration Link
            </label>
            <input
              type="url"
              name="registrationLink"
              value={formData.registrationLink}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-nushu-sage/20 rounded-lg focus:ring-2 focus:ring-nushu-terracotta focus:border-nushu-terracotta"
              placeholder="https://example.com/register"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-nushu-sage mb-2">
              Priority
            </label>
            <input
              type="number"
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-nushu-sage/20 rounded-lg focus:ring-2 focus:ring-nushu-terracotta focus:border-nushu-terracotta"
              placeholder="0 (normal priority)"
              min="-100"
              max="100"
            />
            <p className="text-nushu-sage/60 text-xs mt-1">Higher numbers appear first</p>
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <label className="flex items-center gap-2 text-sm font-medium text-nushu-sage">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="w-4 h-4 text-nushu-terracotta focus:ring-nushu-terracotta border-nushu-sage/20 rounded"
              />
              Active
            </label>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-nushu-sage mb-2">
            <FileText className="w-4 h-4" />
            Description *
          </label>
          <textarea
            name="blurb"
            value={formData.blurb}
            onChange={handleInputChange}
            rows={4}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-nushu-terracotta focus:border-nushu-terracotta resize-none ${
              errors.blurb ? 'border-red-500' : 'border-nushu-sage/20'
            }`}
            placeholder="Enter event description"
          />
          {errors.blurb && <p className="text-red-500 text-sm mt-1">{errors.blurb}</p>}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-6 border-t border-nushu-sage/10">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-3 border border-nushu-sage/20 text-nushu-sage rounded-lg hover:bg-nushu-cream transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-nushu-terracotta text-white rounded-lg hover:bg-nushu-terracotta/90 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : 'Save Event'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventForm;