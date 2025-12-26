'use strict';

const restaurantService = require('../services/restaurantService');

class RestaurantController {
  /**
   * Get restaurant status (public)
   * GET /api/restaurant/status
   */
  async getStatus(req, res) {
    try {
      const status = await restaurantService.isRestaurantOpen();
      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      console.error('Error getting restaurant status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get restaurant status'
      });
    }
  }

  /**
   * Get restaurant info (public)
   * GET /api/restaurant/info
   */
  async getInfo(req, res) {
    try {
      const settings = await restaurantService.getSettings();
      res.json({
        success: true,
        data: {
          name: settings.restaurantName,
          phone: settings.restaurantPhone,
          address: settings.restaurantAddress,
          taxPercentage: settings.taxPercentage,
          minimumOrderValue: settings.minimumOrderValue,
          estimatedPrepTimeMinutes: settings.estimatedPrepTimeMinutes
        }
      });
    } catch (error) {
      console.error('Error getting restaurant info:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get restaurant info'
      });
    }
  }

  /**
   * Get delivery fee (public)
   * GET /api/restaurant/delivery-fee
   */
  async getDeliveryFee(req, res) {
    try {
      const deliveryInfo = await restaurantService.getDeliveryFee();
      res.json({
        success: true,
        data: deliveryInfo
      });
    } catch (error) {
      console.error('Error getting delivery fee:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get delivery fee'
      });
    }
  }

  /**
   * Get operating hours (public)
   * GET /api/restaurant/hours
   */
  async getOperatingHours(req, res) {
    try {
      const hours = await restaurantService.getAllOperatingHours();
      res.json({
        success: true,
        data: hours
      });
    } catch (error) {
      console.error('Error getting operating hours:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get operating hours'
      });
    }
  }

  /**
   * Get all settings (admin)
   * GET /api/restaurant/settings
   */
  async getSettings(req, res) {
    try {
      const settings = await restaurantService.getSettings();
      res.json({
        success: true,
        data: settings
      });
    } catch (error) {
      console.error('Error getting settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get settings'
      });
    }
  }

  /**
   * Update settings (admin)
   * PUT /api/restaurant/settings
   */
  async updateSettings(req, res) {
    try {
      const settings = await restaurantService.updateSettings(req.body);
      res.json({
        success: true,
        message: 'Settings updated successfully',
        data: settings
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update settings'
      });
    }
  }

  /**
   * Manually close restaurant (admin)
   * POST /api/restaurant/manual-close
   */
  async manualClose(req, res) {
    try {
      const { reason } = req.body;
      const userId = req.user.id;
      const settings = await restaurantService.manuallyClose(userId, reason);
      res.json({
        success: true,
        message: 'Restaurant closed manually',
        data: settings
      });
    } catch (error) {
      console.error('Error closing restaurant:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to close restaurant'
      });
    }
  }

  /**
   * Manually open restaurant (admin)
   * POST /api/restaurant/manual-open
   */
  async manualOpen(req, res) {
    try {
      const settings = await restaurantService.manuallyOpen();
      res.json({
        success: true,
        message: 'Restaurant opened manually',
        data: settings
      });
    } catch (error) {
      console.error('Error opening restaurant:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to open restaurant'
      });
    }
  }

  /**
   * Update operating hours for a day (admin)
   * PUT /api/restaurant/operating-hours/:day
   */
  async updateOperatingHoursForDay(req, res) {
    try {
      const dayOfWeek = parseInt(req.params.day);
      const { slots } = req.body;

      if (dayOfWeek < 0 || dayOfWeek > 6) {
        return res.status(400).json({
          success: false,
          message: 'Invalid day of week. Must be 0-6 (0=Sunday, 6=Saturday)'
        });
      }

      const hours = await restaurantService.updateOperatingHours(dayOfWeek, slots);
      res.json({
        success: true,
        message: 'Operating hours updated successfully',
        data: hours
      });
    } catch (error) {
      console.error('Error updating operating hours:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update operating hours'
      });
    }
  }

  /**
   * Get all holidays (admin)
   * GET /api/restaurant/holidays
   */
  async getHolidays(req, res) {
    try {
      const holidays = await restaurantService.getAllHolidays();
      res.json({
        success: true,
        data: holidays
      });
    } catch (error) {
      console.error('Error getting holidays:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get holidays'
      });
    }
  }

  /**
   * Create holiday (admin)
   * POST /api/restaurant/holidays
   */
  async createHoliday(req, res) {
    try {
      const holiday = await restaurantService.createHoliday(req.body);
      res.status(201).json({
        success: true,
        message: 'Holiday created successfully',
        data: holiday
      });
    } catch (error) {
      console.error('Error creating holiday:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create holiday'
      });
    }
  }

  /**
   * Update holiday (admin)
   * PUT /api/restaurant/holidays/:id
   */
  async updateHoliday(req, res) {
    try {
      const holiday = await restaurantService.updateHoliday(req.params.id, req.body);
      res.json({
        success: true,
        message: 'Holiday updated successfully',
        data: holiday
      });
    } catch (error) {
      console.error('Error updating holiday:', error);
      if (error.message === 'Holiday not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      res.status(500).json({
        success: false,
        message: 'Failed to update holiday'
      });
    }
  }

  /**
   * Delete holiday (admin)
   * DELETE /api/restaurant/holidays/:id
   */
  async deleteHoliday(req, res) {
    try {
      await restaurantService.deleteHoliday(req.params.id);
      res.json({
        success: true,
        message: 'Holiday deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting holiday:', error);
      if (error.message === 'Holiday not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      res.status(500).json({
        success: false,
        message: 'Failed to delete holiday'
      });
    }
  }
}

module.exports = new RestaurantController();

