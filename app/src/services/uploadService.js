'use strict';

const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const sizeOf = require('image-size');
const imageSize = sizeOf.default || sizeOf;

/**
 * Upload Service
 * Handles file upload operations and metadata extraction
 */
class UploadService {
  /**
   * Process uploaded file and extract metadata
   * @param {Object} file - Multer file object
   * @returns {Promise<Object>} File metadata
   */
  async processUploadedFile(file) {
    try {
      // Get image dimensions
      const buffer = fsSync.readFileSync(file.path);
      const dimensions = imageSize(buffer);
      
      // Generate URL path (relative to server root)
      const url = `/uploads/pictures/${file.filename}`;
      
      return {
        url,
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
        width: dimensions.width,
        height: dimensions.height,
        path: file.path
      };
    } catch (error) {
      // If image processing fails, delete the file
      await this.deleteFile(file.path);
      throw new Error(`Failed to process image: ${error.message}`);
    }
  }

  /**
   * Process multiple uploaded files
   * @param {Array} files - Array of multer file objects
   * @returns {Promise<Array>} Array of file metadata
   */
  async processUploadedFiles(files) {
    const results = [];
    
    for (const file of files) {
      try {
        const metadata = await this.processUploadedFile(file);
        results.push(metadata);
      } catch (error) {
        // Continue processing other files even if one fails
        console.error(`Error processing file ${file.originalname}:`, error);
      }
    }
    
    return results;
  }

  /**
   * Delete a file from the filesystem
   * @param {string} filePath - Path to the file
   * @returns {Promise<void>}
   */
  async deleteFile(filePath) {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error(`Error deleting file ${filePath}:`, error);
    }
  }

  /**
   * Delete a file by URL
   * @param {string} url - URL of the file (e.g., /uploads/pictures/image.jpg)
   * @returns {Promise<void>}
   */
  async deleteFileByUrl(url) {
    try {
      // Extract filename from URL
      const filename = path.basename(url);
      const filePath = path.join(__dirname, '../../uploads/pictures', filename);
      
      // Check if file exists
      try {
        await fs.access(filePath);
        await fs.unlink(filePath);
      } catch (error) {
        // File doesn't exist, ignore
        console.warn(`File not found: ${filePath}`);
      }
    } catch (error) {
      console.error(`Error deleting file by URL ${url}:`, error);
    }
  }

  /**
   * Validate image file
   * @param {Object} file - Multer file object
   * @returns {Object} Validation result
   */
  validateImage(file) {
    const errors = [];
    
    // Check file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      errors.push('File size exceeds 10MB limit');
    }
    
    // Check mime type
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      errors.push('Invalid file type. Only JPEG, PNG, GIF, and WEBP are allowed');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get file info by URL
   * @param {string} url - URL of the file
   * @returns {Promise<Object>} File info
   */
  async getFileInfo(url) {
    try {
      const filename = path.basename(url);
      const filePath = path.join(__dirname, '../../uploads/pictures', filename);
      
      // Check if file exists
      const stats = await fs.stat(filePath);
      const buffer = fsSync.readFileSync(filePath);
      const dimensions = imageSize(buffer);
      
      return {
        exists: true,
        size: stats.size,
        width: dimensions.width,
        height: dimensions.height,
        mimeType: `image/${dimensions.type}`,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime
      };
    } catch (error) {
      return {
        exists: false,
        error: error.message
      };
    }
  }
}

module.exports = new UploadService();

