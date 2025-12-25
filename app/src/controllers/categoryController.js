'use strict';

const categoryService = require('../services/categoryService');
const { formatCategoryResponse, formatCategoriesResponse } = require('../dtos/category.dto');
const { sendSuccess, sendError, sendNotFound } = require('../utils/responseFormatter');
const logger = require('../utils/logger');

/**
 * Category Controller
 * Handles HTTP requests for category operations
 */

/**
 * Get all categories
 * GET /api/categories
 * Query params: ?available=true&includeItems=true&includeAddOns=true
 */
const getAllCategories = async (req, res) => {
  try {
    const filters = {
      available: req.query.available === 'true' ? true : req.query.available === 'false' ? false : undefined,
      includeItems: req.query.includeItems === 'true',
      includeAddOns: req.query.includeAddOns === 'true'
    };

    const categories = await categoryService.getAllCategories(filters);
    const formattedCategories = formatCategoriesResponse(categories, {
      includeItems: filters.includeItems,
      includeAddOns: filters.includeAddOns
    });

    return sendSuccess(res, 200, { categories: formattedCategories }, 'Categories retrieved successfully');
  } catch (error) {
    logger.error('Error in getAllCategories controller', error);
    return sendError(res, 500, 'Failed to retrieve categories');
  }
};

/**
 * Get category by ID
 * GET /api/categories/:id
 * Query params: ?includeItems=true&includeAddOns=true
 */
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const options = {
      includeItems: req.query.includeItems === 'true',
      includeAddOns: req.query.includeAddOns === 'true'
    };

    const category = await categoryService.getCategoryById(id, options);

    if (!category) {
      return sendNotFound(res, 'Category not found');
    }

    const formattedCategory = formatCategoryResponse(category, {
      includeItems: options.includeItems,
      includeAddOns: options.includeAddOns
    });
    return sendSuccess(res, 200, { category: formattedCategory }, 'Category retrieved successfully');
  } catch (error) {
    logger.error('Error in getCategoryById controller', error);
    return sendError(res, 500, 'Failed to retrieve category');
  }
};

/**
 * Create new category
 * POST /api/categories
 * Body: { name, description, imageUrl, isAvailable, displayOrder }
 * Admin only
 */
const createCategory = async (req, res) => {
  try {
    const categoryData = {
      name: req.body.name,
      description: req.body.description,
      imageUrl: req.body.imageUrl,
      isAvailable: req.body.isAvailable !== undefined ? req.body.isAvailable : true,
      displayOrder: req.body.displayOrder !== undefined ? req.body.displayOrder : 0,
      gstRate: req.body.gstRate !== undefined ? req.body.gstRate : 5
    };

    const category = await categoryService.createCategory(categoryData);
    const formattedCategory = formatCategoryResponse(category);

    return sendSuccess(res, 201, { category: formattedCategory }, 'Category created successfully');
  } catch (error) {
    logger.error('Error in createCategory controller', error);

    // Handle validation errors
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => err.message);
      return sendError(res, 400, validationErrors.join(', '));
    }

    return sendError(res, 500, 'Failed to create category');
  }
};

/**
 * Update category
 * PUT /api/categories/:id
 * Body: { name, description, imageUrl, isAvailable, displayOrder }
 * Admin only
 */
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {};

    // Only include fields that are provided
    if (req.body.name !== undefined) updateData.name = req.body.name;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.imageUrl !== undefined) updateData.imageUrl = req.body.imageUrl;
    if (req.body.isAvailable !== undefined) updateData.isAvailable = req.body.isAvailable;
    if (req.body.displayOrder !== undefined) updateData.displayOrder = req.body.displayOrder;
    if (req.body.gstRate !== undefined) updateData.gstRate = req.body.gstRate;

    const category = await categoryService.updateCategory(id, updateData);

    if (!category) {
      return sendNotFound(res, 'Category not found');
    }

    const formattedCategory = formatCategoryResponse(category);
    return sendSuccess(res, 200, { category: formattedCategory }, 'Category updated successfully');
  } catch (error) {
    logger.error('Error in updateCategory controller', error);

    // Handle validation errors
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => err.message);
      return sendError(res, 400, validationErrors.join(', '));
    }

    return sendError(res, 500, 'Failed to update category');
  }
};

/**
 * Delete category
 * DELETE /api/categories/:id
 * Admin only
 */
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await categoryService.deleteCategory(id);

    if (!deleted) {
      return sendNotFound(res, 'Category not found');
    }

    return sendSuccess(res, 200, {}, 'Category deleted successfully');
  } catch (error) {
    logger.error('Error in deleteCategory controller', error);
    return sendError(res, 500, 'Failed to delete category');
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};

