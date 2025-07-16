import React, { useState } from 'react';
import { Download, Eye, Calendar, HardDrive } from 'lucide-react';
import { ImageFile } from '../types';

interface ImageThumbnailProps {
  image: ImageFile;
  onPreview: (image: ImageFile) => void;
  onDownload: (image: ImageFile) => void;
}

const ImageThumbnail: React.FC<ImageThumbnailProps> = ({ image, onPreview, onDownload }) => {
  const [isLoading, setIsLoading] = useState(true);

  const formatFileSize = (sizeInMB: number) => {
    return `${sizeInMB.toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="relative aspect-square">
        {isLoading && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-green-600" />
          </div>
        )}
        <img
          src={image.url}
          alt={image.filename}
          className="w-full h-full object-cover"
          onLoad={() => setIsLoading(false)}
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center space-x-2 opacity-0 hover:opacity-100">
          <button
            onClick={() => onPreview(image)}
            className="bg-white text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDownload(image)}
            className="bg-white text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="p-3">
        <h3 className="font-medium text-sm text-gray-900 truncate mb-2">{image.filename}</h3>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(image.uploadDate)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <HardDrive className="h-3 w-3" />
            <span>{formatFileSize(image.size)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageThumbnail;