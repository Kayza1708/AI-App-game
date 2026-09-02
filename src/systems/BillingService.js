import { STORE_PRODUCTS } from '../data/metaCatalog.js';

/** Native billing boundary. The web build never fabricates a cash purchase. */
export class BillingService {
  constructor(provider = null) { this.provider = provider; }
  products() { return STORE_PRODUCTS.map((product) => ({ ...product, available: Boolean(this.provider) })); }
  async purchase(productId) {
    const product = STORE_PRODUCTS.find(({ id }) => id === productId);
    if (!product || !this.provider?.purchase) return { ok: false, reason: 'NATIVE_BILLING_UNAVAILABLE' };
    const receipt = await this.provider.purchase(productId);
    return receipt?.verified ? { ok: true, productId, receipt } : { ok: false, reason: 'RECEIPT_NOT_VERIFIED' };
  }
}
