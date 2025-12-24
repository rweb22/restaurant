'use strict';

const offerService = require('../services/offerService');
const { formatOfferResponse } = require('../dtos/offer.dto');
const { sendSuccess, sendError, sendNotFound, sendValidationError } = require('../utils/responseFormatter');

/**
 * Get all offers
 */
const getAllOffers = async (req, res) => {
  try {
    const filters = {
      isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
      discountType: req.query.discountType,
      includeCategory: req.query.includeCategory === 'true',
      includeItem: req.query.includeItem === 'true'
    };

    const offers = await offerService.getAllOffers(filters);
    const formattedOffers = offers.map(formatOfferResponse);

    return sendSuccess(res, 200, { offers: formattedOffers }, 'Offers retrieved successfully');
  } catch (error) {
    return sendError(res, 500, 'Failed to retrieve offers', error.message);
  }
};

/**
 * Get offer by ID
 */
const getOfferById = async (req, res) => {
  try {
    const { id } = req.params;
    const includeAssociations = req.query.includeAssociations === 'true';

    const offer = await offerService.getOfferById(id, includeAssociations);

    if (!offer) {
      return sendNotFound(res, 'Offer not found');
    }

    const formattedOffer = formatOfferResponse(offer);
    return sendSuccess(res, 200, { offer: formattedOffer }, 'Offer retrieved successfully');
  } catch (error) {
    return sendError(res, 500, 'Failed to retrieve offer', error.message);
  }
};

/**
 * Get offer by code
 */
const getOfferByCode = async (req, res) => {
  try {
    const { code } = req.params;

    const offer = await offerService.getOfferByCode(code);

    if (!offer) {
      return sendNotFound(res, 'Offer not found');
    }

    const formattedOffer = formatOfferResponse(offer);
    return sendSuccess(res, 200, { offer: formattedOffer }, 'Offer retrieved successfully');
  } catch (error) {
    return sendError(res, 500, 'Failed to retrieve offer', error.message);
  }
};

/**
 * Create a new offer (admin only)
 */
const createOffer = async (req, res) => {
  try {
    const offerData = {
      code: req.body.code,
      title: req.body.title,
      description: req.body.description,
      discountType: req.body.discountType,
      discountValue: req.body.discountValue,
      maxDiscountAmount: req.body.maxDiscountAmount,
      minOrderValue: req.body.minOrderValue,
      applicableCategoryId: req.body.applicableCategoryId,
      applicableItemId: req.body.applicableItemId,
      firstOrderOnly: req.body.firstOrderOnly || false,
      maxUsesPerUser: req.body.maxUsesPerUser,
      validFrom: req.body.validFrom,
      validTo: req.body.validTo,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true
    };

    const offer = await offerService.createOffer(offerData);
    const formattedOffer = formatOfferResponse(offer);

    return sendSuccess(res, 201, { offer: formattedOffer }, 'Offer created successfully');
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return sendValidationError(res, error);
    }
    if (error.name === 'UniqueConstraintError') {
      return sendError(res, 409, error.message);
    }
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return sendError(res, 400, 'Invalid category or item ID');
    }
    return sendError(res, 500, 'Failed to create offer', error.message);
  }
};

/**
 * Update an offer (admin only)
 */
const updateOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      code: req.body.code,
      title: req.body.title,
      description: req.body.description,
      discountType: req.body.discountType,
      discountValue: req.body.discountValue,
      maxDiscountAmount: req.body.maxDiscountAmount,
      minOrderValue: req.body.minOrderValue,
      applicableCategoryId: req.body.applicableCategoryId,
      applicableItemId: req.body.applicableItemId,
      firstOrderOnly: req.body.firstOrderOnly,
      maxUsesPerUser: req.body.maxUsesPerUser,
      validFrom: req.body.validFrom,
      validTo: req.body.validTo,
      isActive: req.body.isActive
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const offer = await offerService.updateOffer(id, updateData);
    const formattedOffer = formatOfferResponse(offer);

    return sendSuccess(res, 200, { offer: formattedOffer }, 'Offer updated successfully');
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return sendNotFound(res, error.message);
    }
    if (error.name === 'SequelizeValidationError') {
      return sendValidationError(res, error);
    }
    if (error.name === 'UniqueConstraintError') {
      return sendError(res, 409, error.message);
    }
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return sendError(res, 400, 'Invalid category or item ID');
    }
    return sendError(res, 500, 'Failed to update offer', error.message);
  }
};

/**
 * Delete an offer (admin only)
 */
const deleteOffer = async (req, res) => {
  try {
    const { id } = req.params;

    await offerService.deleteOffer(id);

    return sendSuccess(res, 200, null, 'Offer deleted successfully');
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return sendNotFound(res, error.message);
    }
    return sendError(res, 500, 'Failed to delete offer', error.message);
  }
};

/**
 * Validate an offer code
 */
const validateOffer = async (req, res) => {
  try {
    const userId = req.user.id;
    const { code, subtotal, categoryIds, itemIds } = req.body;

    const result = await offerService.validateOffer(
      code,
      userId,
      subtotal,
      categoryIds || [],
      itemIds || []
    );

    if (!result.valid) {
      return sendError(res, 400, result.message);
    }

    return sendSuccess(res, 200, {
      offerId: result.offerId,
      discountAmount: result.discountAmount,
      freeDelivery: result.freeDelivery
    }, result.message);
  } catch (error) {
    return sendError(res, 500, 'Failed to validate offer', error.message);
  }
};

/**
 * Get user's offer usage history (orders with offers)
 */
const getUserOfferUsage = async (req, res) => {
  try {
    const userId = req.user.id;
    const offerId = req.query.offerId;

    const orders = await offerService.getUserOfferUsage(userId, offerId);

    return sendSuccess(res, 200, { orders }, 'Offer usage history retrieved successfully');
  } catch (error) {
    return sendError(res, 500, 'Failed to retrieve offer usage history', error.message);
  }
};

module.exports = {
  getAllOffers,
  getOfferById,
  getOfferByCode,
  createOffer,
  updateOffer,
  deleteOffer,
  validateOffer,
  getUserOfferUsage
};

