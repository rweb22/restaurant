'use strict';

const { Picture, Item, Category, Offer, User } = require('../models');
const { Op } = require('sequelize');

/**
 * Picture Service
 * Handles business logic for picture management
 */
class PictureService {
  /**
   * Get all pictures for an entity
   * @param {string} entityType - Type of entity (item, category, offer, user)
   * @param {number} entityId - ID of the entity
   * @returns {Promise<Array>} Array of pictures
   */
  async getPicturesByEntity(entityType, entityId) {
    const pictures = await Picture.findAll({
      where: {
        entityType,
        entityId
      },
      order: [
        ['display_order', 'ASC'],
        ['created_at', 'ASC']
      ]
    });

    return pictures.map(picture => picture.toSafeObject());
  }

  /**
   * Get a single picture by ID
   * @param {number} pictureId - Picture ID
   * @returns {Promise<Object>} Picture object
   */
  async getPictureById(pictureId) {
    const picture = await Picture.findByPk(pictureId);
    
    if (!picture) {
      throw new Error('Picture not found');
    }

    return picture.toSafeObject();
  }

  /**
   * Create a new picture
   * @param {Object} pictureData - Picture data
   * @returns {Promise<Object>} Created picture
   */
  async createPicture(pictureData) {
    // Validate that the entity exists
    await this._validateEntity(pictureData.entityType, pictureData.entityId);

    // If this is set as primary, unset other primary pictures for this entity
    if (pictureData.isPrimary) {
      await this._unsetPrimaryPictures(pictureData.entityType, pictureData.entityId);
    }

    const picture = await Picture.create(pictureData);
    return picture.toSafeObject();
  }

  /**
   * Update a picture
   * @param {number} pictureId - Picture ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated picture
   */
  async updatePicture(pictureId, updateData) {
    const picture = await Picture.findByPk(pictureId);
    
    if (!picture) {
      throw new Error('Picture not found');
    }

    // If setting as primary, unset other primary pictures for this entity
    if (updateData.isPrimary === true) {
      await this._unsetPrimaryPictures(picture.entityType, picture.entityId, pictureId);
    }

    await picture.update(updateData);
    return picture.toSafeObject();
  }

  /**
   * Delete a picture
   * @param {number} pictureId - Picture ID
   * @returns {Promise<void>}
   */
  async deletePicture(pictureId) {
    const picture = await Picture.findByPk(pictureId);
    
    if (!picture) {
      throw new Error('Picture not found');
    }

    await picture.destroy();
  }

  /**
   * Set a picture as primary
   * @param {number} pictureId - Picture ID
   * @returns {Promise<Object>} Updated picture
   */
  async setPrimaryPicture(pictureId) {
    const picture = await Picture.findByPk(pictureId);
    
    if (!picture) {
      throw new Error('Picture not found');
    }

    // Unset other primary pictures for this entity
    await this._unsetPrimaryPictures(picture.entityType, picture.entityId, pictureId);

    // Set this picture as primary
    await picture.update({ isPrimary: true });
    return picture.toSafeObject();
  }

  /**
   * Reorder pictures
   * @param {Array} picturesData - Array of {id, displayOrder}
   * @returns {Promise<void>}
   */
  async reorderPictures(picturesData) {
    // Update each picture's display order
    const updatePromises = picturesData.map(({ id, displayOrder }) =>
      Picture.update(
        { displayOrder },
        { where: { id } }
      )
    );

    await Promise.all(updatePromises);
  }

  /**
   * Validate that an entity exists
   * @private
   * @param {string} entityType - Type of entity
   * @param {number} entityId - ID of the entity
   * @throws {Error} If entity doesn't exist
   */
  async _validateEntity(entityType, entityId) {
    let model;
    
    switch (entityType) {
      case 'item':
        model = Item;
        break;
      case 'category':
        model = Category;
        break;
      case 'offer':
        model = Offer;
        break;
      case 'user':
        model = User;
        break;
      default:
        throw new Error(`Invalid entity type: ${entityType}`);
    }

    const entity = await model.findByPk(entityId);
    
    if (!entity) {
      throw new Error(`${entityType.charAt(0).toUpperCase() + entityType.slice(1)} not found`);
    }
  }

  /**
   * Unset primary flag for all pictures of an entity (except the specified one)
   * @private
   * @param {string} entityType - Type of entity
   * @param {number} entityId - ID of the entity
   * @param {number} [excludePictureId] - Picture ID to exclude from update
   */
  async _unsetPrimaryPictures(entityType, entityId, excludePictureId = null) {
    const where = {
      entityType,
      entityId,
      isPrimary: true
    };

    if (excludePictureId) {
      where.id = { [Op.ne]: excludePictureId };
    }

    await Picture.update(
      { isPrimary: false },
      { where }
    );
  }
}

module.exports = new PictureService();

