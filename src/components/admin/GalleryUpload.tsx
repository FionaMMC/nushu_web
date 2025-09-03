import React, { useState, useCallback } from 'react';
import { Upload, Image, X, FileText, Tag, Camera, Save } from 'lucide-react';

interface GalleryUploadProps {
  onUpload: (file: File, metadata: {
    title: string;
    description?: string;
    alt: string;
    category?: string;
    priority?: number;
  }) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const GalleryUpload: React.FC<GalleryUploadProps> = ({ onUpload, onCancel, loading = false }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    alt: '',
    category: 'general',
    priority: 0
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

    // Auto-populate title from filename if empty
    if (!formData.title) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      setFormData(prev => ({ ...prev, title: nameWithoutExt }));
    }

    // Clear file error
    setErrors(prev => ({ ...prev, file: '' }));
  }, [formData.title]);

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
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedFile) newErrors.file = 'Please select an image file';
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.alt.trim()) newErrors.alt = 'Alt text is required for accessibility';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !selectedFile) return;

    try {
      await onUpload(selectedFile, {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        alt: formData.alt.trim(),
        category: formData.category,
        priority: Number(formData.priority)
      });
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreview(null);
    setErrors(prev => ({ ...prev, file: '' }));
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-serif text-nushu-sage">Upload Gallery Image</h2>
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
            Image File *
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

        <div className="grid md:grid-cols-2 gap-6">
          {/* Title */}
          <div>
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
              placeholder="Enter image title"
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
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

          {/* Alt Text */}
          <div className="md:col-span-2">
            <label className="flex items-center gap-2 text-sm font-medium text-nushu-sage mb-2">
              <Camera className="w-4 h-4" />
              Alt Text *
            </label>
            <input
              type="text"
              name="alt"
              value={formData.alt}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-nushu-terracotta focus:border-nushu-terracotta ${
                errors.alt ? 'border-red-500' : 'border-nushu-sage/20'
              }`}
              placeholder="Describe the image for accessibility"
            />
            {errors.alt && <p className="text-red-500 text-sm mt-1">{errors.alt}</p>}
            <p className="text-nushu-sage/60 text-xs mt-1">
              Brief description for screen readers and SEO
            </p>
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

        {/* Description */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-nushu-sage mb-2">
            <FileText className="w-4 h-4" />
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-4 py-3 border border-nushu-sage/20 rounded-lg focus:ring-2 focus:ring-nushu-terracotta focus:border-nushu-terracotta resize-none"
            placeholder="Optional description for this image"
          />
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
            disabled={loading || !selectedFile}
            className="flex items-center gap-2 px-6 py-3 bg-nushu-terracotta text-white rounded-lg hover:bg-nushu-terracotta/90 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Uploading...' : 'Upload Image'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GalleryUpload;