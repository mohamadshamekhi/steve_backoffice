import accountingKeys from "./accounting.keys";
import articleKeys from "./article.keys";
import attributeKeys from "./attribute.keys";
import attributeDefinition from "./attributeDefinition.keys";
import authKeys from "./auth.keys";
import bannerKeys from "./banner.keys";
import brandKeys from "./brand.keys";
import cartKeys from "./cart.keys";
import categoryKeys from "./category.keys";
import commentKeys from "./comment.keys";
import commonKeys from "./common.keys";
import dashboardKeys from "./dashboard.keys";
import discountKeys from "./discount.keys";
import inventoryKeys from "./inventory.keys";
import mediaKeys from "./media.keys";
import orderKeys from "./order.keys";
import partnerKeys from "./partner.keys";
import partnerShopKeys from "./partnerShop.keys";
import priceReviewKeys from "./priceReview.keys";
import productKeys from "./product.keys";
import purchaseKeys from "./purchase.keys";
import referralKeys from "./referral.keys";
import repairKeys from "./repairs.keys";
import sellsKeys from "./sells.keys";
import shippingKeys from "./shipping.keys";
import supplierKeys from "./supplier.keys";
import userKeys from "./user.keys";

const ApiKeys = {
  ...authKeys,
  ...articleKeys,
  ...categoryKeys,
  ...attributeKeys,
  ...attributeDefinition,
  ...bannerKeys,
  ...brandKeys,
  ...mediaKeys,
  ...productKeys,
  ...commentKeys,
  ...commonKeys,
  ...discountKeys,
  ...userKeys,
  ...cartKeys,
  ...orderKeys,
  ...partnerKeys,
  ...partnerShopKeys,
  ...referralKeys,
  ...repairKeys,
  ...sellsKeys,
  ...shippingKeys,
  ...supplierKeys,
  ...purchaseKeys,
  ...inventoryKeys,
  ...accountingKeys,
  ...dashboardKeys,
  ...priceReviewKeys,
};

export default ApiKeys;
