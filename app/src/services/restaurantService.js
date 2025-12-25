'use strict';

const { RestaurantSettings, OperatingHours, Holiday, User } = require('../models');
const { Op } = require('sequelize');

class RestaurantService {
  /**
   * Get restaurant settings (single row)
   */
  async getSettings() {
    let settings = await RestaurantSettings.findByPk(1, {
      include: [
        {
          model: User,
          as: 'closedByUser',
          attributes: ['id', 'name', 'phone']
        }
      ]
    });

    // Create default settings if not exists
    if (!settings) {
      settings = await RestaurantSettings.create({
        id: 1,
        restaurantName: 'My Restaurant',
        taxPercentage: 5.0,
        estimatedPrepTimeMinutes: 30
      });
    }

    return settings;
  }

  /**
   * Update restaurant settings
   */
  async updateSettings(data) {
    const settings = await this.getSettings();
    await settings.update(data);
    return settings;
  }

  /**
   * Get current date/time in IST
   */
  getISTDate(date = new Date()) {
    // Convert to IST (UTC+5:30)
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    const istDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    return istDate;
  }

  /**
   * Check if restaurant is currently open
   * Returns: { isOpen: boolean, reason: string, nextOpenTime: Date|null }
   */
  async isRestaurantOpen() {
    const settings = await this.getSettings();
    const now = this.getISTDate();

    // Check 1: Manual closure override
    if (settings.isManuallyClosed) {
      return {
        isOpen: false,
        reason: settings.manualClosureReason || 'Restaurant is temporarily closed',
        nextOpenTime: null
      };
    }

    // Check 2: Holiday check
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD in IST
    const holiday = await Holiday.findOne({ where: { date: today } });
    if (holiday) {
      return {
        isOpen: false,
        reason: `Closed for ${holiday.name}`,
        nextOpenTime: await this.getNextOpenTime(now)
      };
    }

    // Check 3: Operating hours check
    const dayOfWeek = now.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
    const currentTime = now.toTimeString().split(' ')[0]; // HH:MM:SS in IST

    const operatingHours = await OperatingHours.findAll({
      where: {
        dayOfWeek,
        isClosed: false
      },
      order: [['openTime', 'ASC']]
    });

    if (operatingHours.length === 0) {
      return {
        isOpen: false,
        reason: 'Closed today',
        nextOpenTime: await this.getNextOpenTime(now)
      };
    }

    // Check if current time falls within any operating slot
    for (const slot of operatingHours) {
      if (currentTime >= slot.openTime && currentTime <= slot.closeTime) {
        return {
          isOpen: true,
          reason: 'Open',
          nextOpenTime: null,
          closingTime: slot.closeTime
        };
      }
    }

    // Not within any slot
    return {
      isOpen: false,
      reason: 'Closed now',
      nextOpenTime: await this.getNextOpenTime(now)
    };
  }

  /**
   * Get next opening time
   */
  async getNextOpenTime(fromDate) {
    const istDate = fromDate ? this.getISTDate(fromDate) : this.getISTDate();
    const currentDay = istDate.getDay();
    const currentTime = istDate.toTimeString().split(' ')[0];

    // Check remaining slots today
    const todaySlots = await OperatingHours.findAll({
      where: {
        dayOfWeek: currentDay,
        isClosed: false,
        openTime: { [Op.gt]: currentTime }
      },
      order: [['openTime', 'ASC']],
      limit: 1
    });

    if (todaySlots.length > 0) {
      const nextSlot = todaySlots[0];
      const nextOpen = new Date(istDate);
      const [hours, minutes] = nextSlot.openTime.split(':');
      nextOpen.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      return nextOpen;
    }

    // Check next 7 days
    for (let i = 1; i <= 7; i++) {
      const checkDay = (currentDay + i) % 7;
      const slots = await OperatingHours.findAll({
        where: {
          dayOfWeek: checkDay,
          isClosed: false
        },
        order: [['openTime', 'ASC']],
        limit: 1
      });

      if (slots.length > 0) {
        const nextSlot = slots[0];
        const nextOpen = new Date(istDate);
        nextOpen.setDate(nextOpen.getDate() + i);
        const [hours, minutes] = nextSlot.openTime.split(':');
        nextOpen.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        return nextOpen;
      }
    }

    return null; // No opening time found in next 7 days
  }

  /**
   * Manually close restaurant
   */
  async manuallyClose(userId, reason = null) {
    const settings = await this.getSettings();
    await settings.update({
      isManuallyClosed: true,
      manualClosureReason: reason,
      manuallyClosedAt: this.getISTDate(),
      manuallyClosedBy: userId
    });
    return settings;
  }

  /**
   * Manually open restaurant
   */
  async manuallyOpen() {
    const settings = await this.getSettings();
    await settings.update({
      isManuallyClosed: false,
      manualClosureReason: null,
      manuallyClosedAt: null,
      manuallyClosedBy: null
    });
    return settings;
  }

  /**
   * Get all operating hours
   */
  async getAllOperatingHours() {
    return await OperatingHours.findAll({
      order: [['dayOfWeek', 'ASC'], ['openTime', 'ASC']]
    });
  }

  /**
   * Update operating hours for a specific day
   */
  async updateOperatingHours(dayOfWeek, slots) {
    // Delete existing slots for this day
    await OperatingHours.destroy({ where: { dayOfWeek } });

    // Create new slots
    const created = [];
    for (const slot of slots) {
      const newSlot = await OperatingHours.create({
        dayOfWeek,
        openTime: slot.openTime,
        closeTime: slot.closeTime,
        isClosed: slot.isClosed || false
      });
      created.push(newSlot);
    }

    return created;
  }

  /**
   * Get all holidays
   */
  async getAllHolidays() {
    return await Holiday.findAll({
      order: [['date', 'ASC']]
    });
  }

  /**
   * Create holiday
   */
  async createHoliday(data) {
    return await Holiday.create(data);
  }

  /**
   * Update holiday
   */
  async updateHoliday(id, data) {
    const holiday = await Holiday.findByPk(id);
    if (!holiday) {
      throw new Error('Holiday not found');
    }
    await holiday.update(data);
    return holiday;
  }

  /**
   * Delete holiday
   */
  async deleteHoliday(id) {
    const holiday = await Holiday.findByPk(id);
    if (!holiday) {
      throw new Error('Holiday not found');
    }
    await holiday.destroy();
    return { success: true };
  }
}

module.exports = new RestaurantService();

