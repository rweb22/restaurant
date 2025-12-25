'use strict';

const pictureService = require('../services/pictureService');
const { Picture } = require('../models');

/**
 * Picture Controller
 * Handles HTTP requests for picture management
 */
class PictureController {
  /**
   * Get all pictures across all entities (Admin only)
   * GET /api/pictures/all
   */
  async getAllPictures(req, res) {
    try {
      const { page = 1, limit = 50, entityType } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (entityType) where.entityType = entityType;

      const { count, rows: pictures } = await Picture.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['entityType', 'ASC'], ['entityId', 'ASC'], ['displayOrder', 'ASC']]
      });

      res.json({
        success: true,
        data: {
          pictures,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / limit)
          }
        }
      });
    } catch (error) {
      console.error('Error getting all pictures:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get all pictures'
      });
    }
  }

  /**
   * Get all pictures for an entity
   * GET /api/pictures?entityType=item&entityId=1
   */
  async getPictures(req, res) {
    try {
      const { entityType, entityId } = req.query;

      if (!entityType || !entityId) {
        return res.status(400).json({
          success: false,
          message: 'Entity type and entity ID are required'
        });
      }

      const pictures = await pictureService.getPicturesByEntity(entityType, parseInt(entityId));

      res.json({
        success: true,
        data: pictures
      });
    } catch (error) {
      console.error('Error getting pictures:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get pictures'
      });
    }
  }

  /**
   * Get a single picture by ID
   * GET /api/pictures/:id
   */
  async getPictureById(req, res) {
    try {
      const { id } = req.params;
      const picture = await pictureService.getPictureById(parseInt(id));

      res.json({
        success: true,
        data: picture
      });
    } catch (error) {
      console.error('Error getting picture:', error);
      const statusCode = error.message === 'Picture not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to get picture'
      });
    }
  }

  /**
   * Create a new picture
   * POST /api/pictures
   */
  async createPicture(req, res) {
    try {
      const picture = await pictureService.createPicture(req.body);

      res.status(201).json({
        success: true,
        message: 'Picture created successfully',
        data: picture
      });
    } catch (error) {
      console.error('Error creating picture:', error);
      const statusCode = error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to create picture'
      });
    }
  }

  /**
   * Update a picture
   * PUT /api/pictures/:id
   */
  async updatePicture(req, res) {
    try {
      const { id } = req.params;
      const picture = await pictureService.updatePicture(parseInt(id), req.body);

      res.json({
        success: true,
        message: 'Picture updated successfully',
        data: picture
      });
    } catch (error) {
      console.error('Error updating picture:', error);
      const statusCode = error.message === 'Picture not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to update picture'
      });
    }
  }

  /**
   * Delete a picture
   * DELETE /api/pictures/:id
   */
  async deletePicture(req, res) {
    try {
      const { id } = req.params;
      await pictureService.deletePicture(parseInt(id));

      res.json({
        success: true,
        message: 'Picture deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting picture:', error);
      const statusCode = error.message === 'Picture not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to delete picture'
      });
    }
  }

  /**
   * Set a picture as primary
   * PATCH /api/pictures/:id/primary
   */
  async setPrimaryPicture(req, res) {
    try {
      const { id } = req.params;
      const picture = await pictureService.setPrimaryPicture(parseInt(id));

      res.json({
        success: true,
        message: 'Picture set as primary successfully',
        data: picture
      });
    } catch (error) {
      console.error('Error setting primary picture:', error);
      const statusCode = error.message === 'Picture not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to set primary picture'
      });
    }
  }

  /**
   * Reorder pictures
   * PATCH /api/pictures/reorder
   */
  async reorderPictures(req, res) {
    try {
      const { pictures } = req.body;
      await pictureService.reorderPictures(pictures);

      res.json({
        success: true,
        message: 'Pictures reordered successfully'
      });
    } catch (error) {
      console.error('Error reordering pictures:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to reorder pictures'
      });
    }
  }
}

module.exports = new PictureController();

