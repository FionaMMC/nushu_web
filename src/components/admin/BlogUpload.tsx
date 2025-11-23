import React, { useState, useCallback, useEffect } from 'react';
import { Upload, Image, X, FileText, Tag, User, Calendar, Save } from 'lucide-react';
import { upload } from '@vercel/blob/client';
import { blogApi, authStorage, Event } from '../../services/api';

interface BlogUploadProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const BlogUpload: React.FC<BlogUploadProps> = ({ onSuccess, onCancel }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    date: new Date().toISOString().split('T')[0],
    content: '',
    excerpt: '',
    imageAlt: '',
    category: 'general',
    tags: '',
    priority: 0,
    isPublished: true,
    eventId: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'culture', label: 'Culture' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'history', label: 'History' },
    { value: 'news', label: 'News' },
    { value: 'community', label: 'Community' }
  ];

  // Fetch events on component mount
  useEffect(() => {
    const fetchEvents = async () => {
      setLoadingEvents(true);
      try {
        const response = await fetch('/api/web-events?limit=100');
        const data = await response.json();
        setEvents(data.events || []);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchEvents();
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, file: 'Please select an image file' }));
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, file: 'File size must be less than 10MB' }));
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Clear file error
    setErrors(prev => ({ ...prev, file: '' }));
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));

    if (imageFile) {
      const event = {
        target: { files: [imageFile] }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileSelect(event);
    }
  }, [handleFileSelect]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setFormData(prev => ({ ...prev, [name]: finalValue }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.author.trim()) newErrors.author = 'Author is required';
    if (!formData.content.trim()) newErrors.content = 'Content is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      let imageUrl = '';
      let imagePathname = '';

      // Step 1: Upload image to Vercel Blob if file is selected
      if (selectedFile) {
        console.log('Uploading image to Vercel Blob...');
        setUploadProgress(20);

        const token = authStorage.getToken();
        if (!token) {
          throw new Error('Not authenticated');
        }

        const blob = await upload(selectedFile.name, selectedFile, {
          access: 'public',
          handleUploadUrl: `/api/blog/upload?token=${encodeURIComponent(token)}`,
        });

        imageUrl = blob.url;
        imagePathname = blob.pathname;
        console.log('Image uploaded to Blob:', imageUrl);
      }

      setUploadProgress(50);

      // Step 2: Create blog post with metadata
      console.log('Creating blog post...');
      const token = authStorage.getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      await blogApi.create({
        title: formData.title.trim(),
        author: formData.author.trim(),
        date: formData.date,
        content: formData.content.trim(),
        excerpt: formData.excerpt.trim() || undefined,
        imageUrl: imageUrl || undefined,
        imagePathname: imagePathname || undefined,
        imageAlt: formData.imageAlt.trim() || undefined,
        category: formData.category,
        tags: tags.length > 0 ? tags : undefined,
        isPublished: formData.isPublished,
        priority: Number(formData.priority),
        eventId: formData.eventId || undefined
      }, token);

      console.log('Blog post created successfully!');
      setUploadProgress(100);

      // Success!
      onSuccess();
    } catch (error) {
      console.error('Error creating blog post:', error);
      setErrors(prev => ({
        ...prev,
        submit: error instanceof Error ? error.message : 'Failed to create blog post'
      }));
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreview(null);
    setErrors(prev => ({ ...prev, file: '' }));
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-serif text-nushu-sage">Create Blog Post</h2>
        <button
          onClick={onCancel}
          className="text-nushu-sage hover:text-nushu-terracotta transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Featured Image Upload Area */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-nushu-sage mb-3">
            <Image className="w-4 h-4" />
            Featured Image (Optional)
          </label>

          {!selectedFile ? (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                errors.file ? 'border-red-300 bg-red-50' : 'border-nushu-sage/30 hover:border-nushu-terracotta hover:bg-nushu-cream/20'
              }`}
            >
              <Upload className="w-12 h-12 text-nushu-sage/40 mx-auto mb-4" />
              <p className="text-nushu-sage mb-2">
                Drag and drop an image here, or{' '}
                <label className="text-nushu-terracotta hover:text-nushu-terracotta/80 cursor-pointer underline">
                  browse files
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </p>
              <p className="text-nushu-sage/60 text-sm">
                Supports JPEG, PNG, WebP, GIF • Max 10MB
              </p>
            </div>
          ) : (
            <div className="relative border border-nushu-sage/20 rounded-lg overflow-hidden">
              <img
                src={preview!}
                alt="Preview"
                className="w-full h-64 object-cover"
              />
              <button
                type="button"
                onClick={clearFile}
                className="absolute top-2 right-2 bg-white/90 hover:bg-white text-nushu-sage p-2 rounded-full shadow-sm transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-2 left-2 bg-black/60 text-white px-3 py-1 rounded text-sm">
                {selectedFile.name}
              </div>
            </div>
          )}

          {errors.file && <p className="text-red-500 text-sm mt-1">{errors.file}</p>}
        </div>

        {errors.submit && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{errors.submit}</p>
          </div>
        )}

        {uploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-nushu-sage">
              <span>Creating blog post...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-nushu-cream rounded-full h-2 overflow-hidden">
              <div
                className="bg-nushu-terracotta h-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Title */}
          <div className="md:col-span-2">
            <label className="flex items-center gap-2 text-sm font-medium text-nushu-sage mb-2">
              <FileText className="w-4 h-4" />
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-nushu-terracotta focus:border-nushu-terracotta ${
                errors.title ? 'border-red-500' : 'border-nushu-sage/20'
              }`}
              placeholder="Enter blog post title"
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          {/* Author */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-nushu-sage mb-2">
              <User className="w-4 h-4" />
              Author *
            </label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-nushu-terracotta focus:border-nushu-terracotta ${
                errors.author ? 'border-red-500' : 'border-nushu-sage/20'
              }`}
              placeholder="Enter author name"
            />
            {errors.author && <p className="text-red-500 text-sm mt-1">{errors.author}</p>}
          </div>

          {/* Date */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-nushu-sage mb-2">
              <Calendar className="w-4 h-4" />
              Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-nushu-sage/20 rounded-lg focus:ring-2 focus:ring-nushu-terracotta focus:border-nushu-terracotta"
            />
          </div>

          {/* Category */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-nushu-sage mb-2">
              <Tag className="w-4 h-4" />
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-nushu-sage/20 rounded-lg focus:ring-2 focus:ring-nushu-terracotta focus:border-nushu-terracotta"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Associated Event */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-nushu-sage mb-2">
              <Calendar className="w-4 h-4" />
              Associated Event (Optional)
            </label>
            <select
              name="eventId"
              value={formData.eventId}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-nushu-sage/20 rounded-lg focus:ring-2 focus:ring-nushu-terracotta focus:border-nushu-terracotta"
              disabled={loadingEvents}
            >
              <option value="">No event association</option>
              {events.map(event => (
                <option key={event._id} value={event._id}>
                  {event.title} - {event.date}
                </option>
              ))}
            </select>
            {loadingEvents && <p className="text-nushu-sage/60 text-xs mt-1">Loading events...</p>}
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
        </div>

        {/* Image Alt Text */}
        {selectedFile && (
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-nushu-sage mb-2">
              <Image className="w-4 h-4" />
              Image Alt Text
            </label>
            <input
              type="text"
              name="imageAlt"
              value={formData.imageAlt}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-nushu-sage/20 rounded-lg focus:ring-2 focus:ring-nushu-terracotta focus:border-nushu-terracotta"
              placeholder="Describe the image for accessibility"
            />
            <p className="text-nushu-sage/60 text-xs mt-1">
              Brief description for screen readers and SEO
            </p>
          </div>
        )}

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
            placeholder="tag1, tag2, tag3"
          />
          <p className="text-nushu-sage/60 text-xs mt-1">Separate tags with commas</p>
        </div>

        {/* Excerpt */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-nushu-sage mb-2">
            <FileText className="w-4 h-4" />
            Excerpt
          </label>
          <textarea
            name="excerpt"
            value={formData.excerpt}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-4 py-3 border border-nushu-sage/20 rounded-lg focus:ring-2 focus:ring-nushu-terracotta focus:border-nushu-terracotta resize-none"
            placeholder="Brief summary for blog listing (optional)"
          />
        </div>

        {/* Content */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-nushu-sage mb-2">
            <FileText className="w-4 h-4" />
            Content *
          </label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            rows={12}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-nushu-terracotta focus:border-nushu-terracotta resize-none ${
              errors.content ? 'border-red-500' : 'border-nushu-sage/20'
            }`}
            placeholder="Write your blog post content here..."
          />
          {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
        </div>

        {/* Published */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            name="isPublished"
            checked={formData.isPublished}
            onChange={handleInputChange}
            className="w-4 h-4 text-nushu-terracotta focus:ring-nushu-terracotta border-nushu-sage/20 rounded"
          />
          <label className="text-sm font-medium text-nushu-sage">
            Publish immediately
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-6 border-t border-nushu-sage/10">
          <button
            type="button"
            onClick={onCancel}
            disabled={uploading}
            className="px-6 py-3 border border-nushu-sage/20 text-nushu-sage rounded-lg hover:bg-nushu-cream transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={uploading}
            className="flex items-center gap-2 px-6 py-3 bg-nushu-terracotta text-white rounded-lg hover:bg-nushu-terracotta/90 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {uploading ? 'Creating...' : 'Create Blog Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BlogUpload;
