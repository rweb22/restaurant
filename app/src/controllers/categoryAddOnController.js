const categoryAddOnService = require('../services/categoryAddOnService');
const { formatCategoryAddOnResponse, formatCategoryAddOnsResponse } = require('../dtos/categoryAddOn.dto');
const { sendSuccess, sendError, sendNotFound } = require('../utils/responseFormatter');

/**
 * Get all category add-on associations
 */
const getAllCategoryAddOns = async (req, res) => {
  try {
    const filters = {};

    // Parse category ID filter
    if (req.query.categoryId !== undefined) {
      filters.categoryId = parseInt(req.query.categoryId, 10);
    }

    // Parse add-on ID filter
    if (req.query.addOnId !== undefined) {
      filters.addOnId = parseInt(req.query.addOnId, 10);
    }

    const categoryAddOns = await categoryAddOnService.getAllCategoryAddOns(filters);
    const formattedCategoryAddOns = formatCategoryAddOnsResponse(categoryAddOns);

    return sendSuccess(
      res,
      200,
      { categoryAddOns: formattedCategoryAddOns },
      'Category add-ons retrieved successfully'
    );
  } catch (error) {
    return sendError(res, 500, 'Failed to retrieve category add-ons');
  }
};

/**
 * Get category add-on by ID
 */
const getCategoryAddOnById = async (req, res) => {
  try {
    const categoryAddOn = await categoryAddOnService.getCategoryAddOnById(req.params.id);
    const formattedCategoryAddOn = formatCategoryAddOnResponse(categoryAddOn);

    return sendSuccess(
      res,
      200,
      { categoryAddOn: formattedCategoryAddOn },
      'Category add-on retrieved successfully'
    );
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return sendNotFound(res, error.message);
    }
    return sendError(res, 500, 'Failed to retrieve category add-on');
  }
};

/**
 * Create a new category add-on association
 */
const createCategoryAddOn = async (req, res) => {
  try {
    const categoryAddOnData = {
      categoryId: req.body.categoryId,
      addOnId: req.body.addOnId
    };

    const categoryAddOn = await categoryAddOnService.createCategoryAddOn(categoryAddOnData);
    const formattedCategoryAddOn = formatCategoryAddOnResponse(categoryAddOn);

    return sendSuccess(
      res,
      201,
      { categoryAddOn: formattedCategoryAddOn },
      'Category add-on created successfully'
    );
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return sendError(res, 404, error.message);
    }
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => err.message);
      return sendError(res, 400, validationErrors.join(', '));
    }
    if (error.name === 'SequelizeUniqueConstraintError') {
      return sendError(res, 400, 'This add-on is already associated with this category');
    }
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return sendError(res, 400, 'Invalid category ID or add-on ID');
    }
    return sendError(res, 500, 'Failed to create category add-on');
  }
};

/**
 * Delete a category add-on association
 */
const deleteCategoryAddOn = async (req, res) => {
  try {
    await categoryAddOnService.deleteCategoryAddOn(req.params.id);
    return sendSuccess(res, 200, null, 'Category add-on deleted successfully');
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return sendNotFound(res, error.message);
    }
    return sendError(res, 500, 'Failed to delete category add-on');
  }
};

module.exports = {
  getAllCategoryAddOns,
  getCategoryAddOnById,
  createCategoryAddOn,
  deleteCategoryAddOn
};

