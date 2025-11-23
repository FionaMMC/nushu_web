import React, { useState, useCallback, useEffect } from 'react';
import { Upload, Image, X, FileText, Tag, Camera, Save, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { upload } from '@vercel/blob/client';
import { galleryApi, authStorage, Event } from '../../services/api';

interface GalleryUploadProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface FileWithPreview {
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

const GalleryUpload: React.FC<GalleryUploadProps> = ({ onSuccess, onCancel }) => {
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    alt: '',
    category: 'general',
    priority: 0,
    eventId: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'calligraphy', label: 'Calligraphy' },
    { value: 'events', label: 'Events' },
    { value: 'community', label: 'Community' },
    { value: 'historical', label: 'Historical' },
    { value: 'artwork', label: 'Artwork' }
  ];

  // Fetch events on component mount
  useEffect(() => {
    const fetchEvents = async () => {
      setLoadingEvents(true);
      try {
        const response = await fetch('/api/web-events?limit=100');
        const data = await response.json();
        setEvents(data.data?.events || []);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchEvents();
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles: FileWithPreview[] = [];
    let hasError = false;

    Array.from(files).forEach(file => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, file: 'Please select only image files' }));
        hasError = true;
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, file: 'File size must be less than 10MB' }));
        hasError = true;
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = e.target?.result as string;
        setSelectedFiles(prev => {
          const index = prev.findIndex(f => f.file === file);
          if (index >= 0) {
            const updated = [...prev];
            updated[index] = { file, preview, status: 'pending' };
            return updated;
          }
          return prev;
        });
      };
      reader.readAsDataURL(file);

      newFiles.push({ file, preview: '', status: 'pending' });
    });

    if (!hasError) {
      setSelectedFiles(prev => [...prev, ...newFiles]);
      setErrors(prev => ({ ...prev, file: '' }));

      // Auto-populate title from first filename if empty
      if (!formData.title && files.length > 0) {
        const nameWithoutExt = files[0].name.replace(/\.[^/.]+$/, '');
        setFormData(prev => ({ ...prev, title: nameWithoutExt }));
      }
    }
  }, [formData.title]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length > 0) {
      const event = {
        target: { files: imageFiles }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileSelect(event);
    }
  }, [handleFileSelect]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (selectedFiles.length === 0) newErrors.file = 'Please select at least one image file';
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.alt.trim()) newErrors.alt = 'Alt text is required for accessibility';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || selectedFiles.length === 0) return;

    setUploading(true);
    setUploadProgress({ current: 0, total: selectedFiles.length });

    const token = authStorage.getToken();
    if (!token) {
      setErrors(prev => ({ ...prev, submit: 'Not authenticated' }));
      setUploading(false);
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    // Upload each file
    for (let i = 0; i < selectedFiles.length; i++) {
      const fileItem = selectedFiles[i];

      // Update status to uploading
      setSelectedFiles(prev => {
        const updated = [...prev];
        updated[i] = { ...updated[i], status: 'uploading' };
        return updated;
      });

      setUploadProgress({ current: i + 1, total: selectedFiles.length });

      try {
        // Upload to Vercel Blob
        const blob = await upload(fileItem.file.name, fileItem.file, {
          access: 'public',
          handleUploadUrl: `/api/gallery/upload?token=${encodeURIComponent(token)}`,
        });

        // Save metadata to database
        await galleryApi.create({
          title: formData.title.trim(),
          alt: formData.alt.trim(),
          description: formData.description.trim() || undefined,
          category: formData.category,
          priority: Number(formData.priority),
          imageUrl: blob.url,
          pathname: blob.pathname,
          fileSize: fileItem.file.size,
          mimeType: fileItem.file.type,
          eventId: formData.eventId || undefined
        }, token);

        // Update status to success
        setSelectedFiles(prev => {
          const updated = [...prev];
          updated[i] = { ...updated[i], status: 'success' };
          return updated;
        });

        successCount++;
      } catch (error) {
        console.error(`Error uploading file ${i + 1}:`, error);

        // Update status to error
        setSelectedFiles(prev => {
          const updated = [...prev];
          updated[i] = {
            ...updated[i],
            status: 'error',
            error: error instanceof Error ? error.message : 'Upload failed'
          };
          return updated;
        });

        errorCount++;
      }
    }

    setUploading(false);

    // Show result
    if (errorCount === 0) {
      // All succeeded
      console.log(`All ${successCount} images uploaded successfully!`);
      onSuccess();
    } else if (successCount > 0) {
      // Some succeeded
      setErrors(prev => ({
        ...prev,
        submit: `${successCount} images uploaded successfully, ${errorCount} failed. You can retry failed uploads.`
      }));
    } else {
      // All failed
      setErrors(prev => ({
        ...prev,
        submit: 'Failed to upload images. Please try again.'
      }));
    }
  };

  const clearAllFiles = () => {
    setSelectedFiles([]);
    setErrors(prev => ({ ...prev, file: '' }));
  };

  const retryFailedUploads = () => {
    setSelectedFiles(prev =>
      prev.map(f => f.status === 'error' ? { ...f, status: 'pending' as const, error: undefined } : f)
    );
    setErrors(prev => ({ ...prev, submit: '' }));
  };

  const hasFailedUploads = selectedFiles.some(f => f.status === 'error');
  const allUploadsComplete = selectedFiles.length > 0 && selectedFiles.every(f => f.status === 'success');

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-serif text-nushu-sage">Upload Gallery Images</h2>
        <button
          onClick={onCancel}
          className="text-nushu-sage hover:text-nushu-terracotta transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload Area */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-nushu-sage mb-3">
            <Image className="w-4 h-4" />
            Image Files * {selectedFiles.length > 0 && `(${selectedFiles.length} selected)`}
          </label>

          {selectedFiles.length === 0 ? (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                errors.file ? 'border-red-300 bg-red-50' : 'border-nushu-sage/30 hover:border-nushu-terracotta hover:bg-nushu-cream/20'
              }`}
            >
              <Upload className="w-12 h-12 text-nushu-sage/40 mx-auto mb-4" />
              <p className="text-nushu-sage mb-2">
                Drag and drop images here, or{' '}
                <label className="text-nushu-terracotta hover:text-nushu-terracotta/80 cursor-pointer underline">
                  browse files
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </p>
              <p className="text-nushu-sage/60 text-sm">
                Supports JPEG, PNG, WebP, GIF • Max 10MB per file • Multiple files allowed
              </p>
            </div>
          ) : (
            <div>
              {/* Preview Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                {selectedFiles.map((fileItem, index) => (
                  <div key={index} className="relative border border-nushu-sage/20 rounded-lg overflow-hidden group">
                    {fileItem.preview && (
                      <img
                        src={fileItem.preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover"
                      />
                    )}

                    {/* Status Overlay */}
                    {fileItem.status !== 'pending' && (
                      <div className={`absolute inset-0 flex items-center justify-center ${
                        fileItem.status === 'uploading' ? 'bg-black/50' :
                        fileItem.status === 'success' ? 'bg-green-500/20' :
                        'bg-red-500/20'
                      }`}>
                        {fileItem.status === 'uploading' && (
                          <div className="text-white text-sm font-medium">Uploading...</div>
                        )}
                        {fileItem.status === 'success' && (
                          <CheckCircle className="w-8 h-8 text-green-600" />
                        )}
                        {fileItem.status === 'error' && (
                          <XCircle className="w-8 h-8 text-red-600" />
                        )}
                      </div>
                    )}

                    {/* Remove Button */}
                    {fileItem.status === 'pending' && (
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute top-1 right-1 bg-white/90 hover:bg-white text-nushu-sage p-1 rounded-full shadow-sm transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}

                    {/* File Name */}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 truncate">
                      {fileItem.file.name}
                    </div>

                    {/* Error Message */}
                    {fileItem.error && (
                      <div className="absolute inset-0 flex items-end">
                        <div className="bg-red-600 text-white text-xs p-2 w-full">
                          {fileItem.error}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add More / Clear All Buttons */}
              <div className="flex gap-3">
                <label className="flex-1 cursor-pointer">
                  <div className="border-2 border-dashed border-nushu-sage/30 hover:border-nushu-terracotta rounded-lg p-3 text-center transition-colors">
                    <span className="text-nushu-terracotta text-sm font-medium">+ Add More Images</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
                <button
                  type="button"
                  onClick={clearAllFiles}
                  disabled={uploading}
                  className="px-4 py-3 border border-nushu-sage/30 text-nushu-sage text-sm font-medium rounded-lg hover:bg-nushu-cream/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}

          {errors.file && (
            <p className="text-red-600 text-sm mt-2">{errors.file}</p>
          )}
        </div>

        {/* Shared Metadata Fields */}
        {selectedFiles.length > 0 && (
          <>
            <div className="bg-nushu-cream/30 p-4 rounded-lg">
              <p className="text-sm text-nushu-sage/80 mb-2">
                <strong>Note:</strong> The following settings will be applied to all uploaded images.
              </p>
            </div>

            {/* Title */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-nushu-sage mb-2">
                <FileText className="w-4 h-4" />
                Shared Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Workshop Spring 2024"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-nushu-terracotta ${
                  errors.title ? 'border-red-300' : 'border-nushu-sage/20'
                }`}
              />
              {errors.title && (
                <p className="text-red-600 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-nushu-sage mb-2">
                <FileText className="w-4 h-4" />
                Shared Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                placeholder="Optional description for all images..."
                className="w-full px-4 py-3 border border-nushu-sage/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-nushu-terracotta resize-none"
              />
            </div>

            {/* Alt Text */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-nushu-sage mb-2">
                <Tag className="w-4 h-4" />
                Shared Alt Text *
              </label>
              <input
                type="text"
                name="alt"
                value={formData.alt}
                onChange={handleInputChange}
                placeholder="Describe the images for accessibility"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-nushu-terracotta ${
                  errors.alt ? 'border-red-300' : 'border-nushu-sage/20'
                }`}
              />
              {errors.alt && (
                <p className="text-red-600 text-sm mt-1">{errors.alt}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-nushu-sage mb-2">
                <Camera className="w-4 h-4" />
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-nushu-sage/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-nushu-terracotta"
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
                disabled={loadingEvents}
                className="w-full px-4 py-3 border border-nushu-sage/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-nushu-terracotta disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">No event association</option>
                {events.map(event => (
                  <option key={event._id} value={event._id}>
                    {event.title} - {event.date}
                  </option>
                ))}
              </select>
              {loadingEvents && (
                <p className="text-nushu-sage/60 text-sm mt-1">Loading events...</p>
              )}
            </div>

            {/* Priority */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-nushu-sage mb-2">
                <Tag className="w-4 h-4" />
                Priority (-100 to 100)
              </label>
              <input
                type="number"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                min="-100"
                max="100"
                className="w-full px-4 py-3 border border-nushu-sage/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-nushu-terracotta"
              />
              <p className="text-nushu-sage/60 text-sm mt-1">
                Higher priority images appear first in galleries
              </p>
            </div>
          </>
        )}

        {/* Upload Progress */}
        {uploading && (
          <div className="bg-nushu-cream/50 p-4 rounded-lg">
            <p className="text-nushu-sage font-medium mb-2">
              Uploading {uploadProgress.current} of {uploadProgress.total} images...
            </p>
            <div className="w-full bg-nushu-sage/20 rounded-full h-2">
              <div
                className="bg-nushu-terracotta h-2 rounded-full transition-all duration-300"
                style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Error Message */}
        {errors.submit && (
          <div className={`p-4 rounded-lg ${hasFailedUploads ? 'bg-yellow-50 border border-yellow-200' : 'bg-red-50 border border-red-200'}`}>
            <p className={`${hasFailedUploads ? 'text-yellow-800' : 'text-red-600'} text-sm`}>
              {errors.submit}
            </p>
          </div>
        )}

        {/* Success Message */}
        {allUploadsComplete && !uploading && (
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-green-800 text-sm font-medium">
                All {selectedFiles.length} images uploaded successfully!
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4 border-t border-nushu-sage/10">
          {hasFailedUploads && !uploading && (
            <button
              type="button"
              onClick={retryFailedUploads}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Retry Failed Uploads
            </button>
          )}

          <button
            type="submit"
            disabled={uploading || selectedFiles.length === 0 || allUploadsComplete}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-nushu-terracotta text-white font-medium rounded-lg hover:bg-nushu-terracotta/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            {uploading ? 'Uploading...' : allUploadsComplete ? 'Upload Complete' : `Upload ${selectedFiles.length} Image${selectedFiles.length > 1 ? 's' : ''}`}
          </button>

          <button
            type="button"
            onClick={onCancel}
            disabled={uploading}
            className="px-6 py-3 border border-nushu-sage/30 text-nushu-sage font-medium rounded-lg hover:bg-nushu-cream/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {allUploadsComplete ? 'Done' : 'Cancel'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GalleryUpload;
