'use strict';

const uploadService = require('../services/uploadService');
const pictureService = require('../services/pictureService');

/**
 * Upload Controller
 * Handles file upload requests
 */
class UploadController {
  /**
   * Upload a single image
   * POST /api/upload/image
   */
  async uploadImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded. Please provide an image file'
        });
      }

      // Process the uploaded file
      const fileMetadata = await uploadService.processUploadedFile(req.file);

      res.status(201).json({
        success: true,
        message: 'Image uploaded successfully',
        data: {
          url: fileMetadata.url,
          filename: fileMetadata.filename,
          originalName: fileMetadata.originalName,
          mimeType: fileMetadata.mimeType,
          fileSize: fileMetadata.fileSize,
          width: fileMetadata.width,
          height: fileMetadata.height
        }
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to upload image'
      });
    }
  }

  /**
   * Upload multiple images
   * POST /api/upload/images
   */
  async uploadImages(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded. Please provide image files'
        });
      }

      // Process all uploaded files
      const filesMetadata = await uploadService.processUploadedFiles(req.files);

      if (filesMetadata.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Failed to process any of the uploaded images'
        });
      }

      res.status(201).json({
        success: true,
        message: `${filesMetadata.length} image(s) uploaded successfully`,
        data: filesMetadata.map(file => ({
          url: file.url,
          filename: file.filename,
          originalName: file.originalName,
          mimeType: file.mimeType,
          fileSize: file.fileSize,
          width: file.width,
          height: file.height
        }))
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to upload images'
      });
    }
  }

  /**
   * Upload image and create picture record
   * POST /api/upload/picture
   */
  async uploadAndCreatePicture(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded. Please provide an image file'
        });
      }

      const { entityType, entityId, altText, displayOrder, isPrimary } = req.body;

      if (!entityType || !entityId) {
        // Delete uploaded file if validation fails
        await uploadService.deleteFile(req.file.path);
        return res.status(400).json({
          success: false,
          message: 'Entity type and entity ID are required'
        });
      }

      // Process the uploaded file
      const fileMetadata = await uploadService.processUploadedFile(req.file);

      // Create picture record
      const pictureData = {
        entityType,
        entityId: parseInt(entityId),
        url: fileMetadata.url,
        altText: altText || fileMetadata.originalName,
        displayOrder: displayOrder ? parseInt(displayOrder) : 0,
        isPrimary: isPrimary === 'true' || isPrimary === true,
        width: fileMetadata.width,
        height: fileMetadata.height,
        fileSize: fileMetadata.fileSize,
        mimeType: fileMetadata.mimeType
      };

      const picture = await pictureService.createPicture(pictureData);

      res.status(201).json({
        success: true,
        message: 'Image uploaded and picture created successfully',
        data: picture
      });
    } catch (error) {
      console.error('Error uploading and creating picture:', error);
      
      // Delete uploaded file if picture creation fails
      if (req.file) {
        await uploadService.deleteFile(req.file.path);
      }

      const statusCode = error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to upload image and create picture'
      });
    }
  }

  /**
   * Get file info
   * GET /api/upload/info?url=/uploads/pictures/image.jpg
   */
  async getFileInfo(req, res) {
    try {
      const { url } = req.query;

      if (!url) {
        return res.status(400).json({
          success: false,
          message: 'URL parameter is required'
        });
      }

      const fileInfo = await uploadService.getFileInfo(url);

      if (!fileInfo.exists) {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }

      res.json({
        success: true,
        data: fileInfo
      });
    } catch (error) {
      console.error('Error getting file info:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get file info'
      });
    }
  }
}

module.exports = new UploadController();

