'use strict';

/**
 * Serialize a Date object to ISO string
 * @param {Date|null|undefined} date - Date to serialize
 * @returns {string|null} - ISO string or null
 */
const serializeDate = (date) => {
  if (!date) return null;
  if (date instanceof Date) {
    return date.toISOString();
  }
  // If it's already a string, return as is
  if (typeof date === 'string') {
    return date;
  }
  return null;
};

/**
 * Serialize multiple date fields in an object
 * @param {Object} obj - Object with date fields
 * @param {Array<string>} dateFields - Array of field names that contain dates
 * @returns {Object} - Object with serialized dates
 */
const serializeDates = (obj, dateFields) => {
  const result = { ...obj };
  dateFields.forEach(field => {
    if (result[field]) {
      result[field] = serializeDate(result[field]);
    }
  });
  return result;
};

module.exports = {
  serializeDate,
  serializeDates
};

