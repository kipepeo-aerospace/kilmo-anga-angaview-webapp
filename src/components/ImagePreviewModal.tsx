import React from 'react';
import { X, Download, Calendar, HardDrive } from 'lucide-react';
import { ImageFile } from '../types';

interface ImagePreviewModalProps {
  image: ImageFile;
  onClose: () => void;
  onDownload: (image: ImageFile) => void;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ image, onClose, onDownload }) => {
  const formatFileSize = (sizeInMB: number) => {
    return `${sizeInMB.toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{image.filename}</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onDownload(image)}
              className="flex items-center space-x-2 px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
            >
              <Download className="h-4 w-4" />
              <span>Download</span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        <div className="p-4">
          <img
            src={image.url}
            alt={image.filename}
            className="w-full h-auto max-h-[60vh] object-contain"
          />
        </div>
        
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Uploaded: {formatDate(image.uploadDate)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <HardDrive className="h-4 w-4" />
              <span>Size: {formatFileSize(image.size)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>Type: {image.type}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImagePreviewModal;