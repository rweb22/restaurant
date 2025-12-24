import api from './api';

const offerService = {
  /**
   * Get all active offers
   */
  async getAllOffers() {
    try {
      const response = await api.get('/offers', {
        params: { isActive: true }
      });
      return response.data;
    } catch (error) {
      console.error('[OfferService] Error fetching offers:', error);
      throw error;
    }
  },

  /**
   * Get offer by code
   */
  async getOfferByCode(code) {
    try {
      const response = await api.get(`/offers/code/${code.toUpperCase()}`);
      return response.data;
    } catch (error) {
      console.error('[OfferService] Error fetching offer by code:', error);
      throw error;
    }
  },

  /**
   * Validate offer code
   */
  async validateOffer(code, subtotal, categoryIds = [], itemIds = []) {
    try {
      console.log('[OfferService] Validating offer:', { code, subtotal, categoryIds, itemIds });
      const response = await api.post('/offers/validate', {
        code: code.toUpperCase(),
        subtotal,
        categoryIds,
        itemIds
      });
      console.log('[OfferService] Offer validation response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[OfferService] Error validating offer:', error);
      throw error;
    }
  },

  /**
   * Get user's offer usage history
   */
  async getUserOfferUsage() {
    try {
      const response = await api.get('/offers/usage/history');
      return response.data;
    } catch (error) {
      console.error('[OfferService] Error fetching offer usage:', error);
      throw error;
    }
  }
};

export default offerService;

