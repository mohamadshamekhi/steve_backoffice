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
import discountKeys from "./discount.keys";
import mediaKeys from "./media.keys";
import orderKeys from "./order.keys";
import productKeys from "./product.keys";
import repairKeys from "./repairs.keys";
import sellsKeys from "./sells.keys";
import shippingKeys from "./shipping.keys";
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
  ...repairKeys,
  ...sellsKeys,
  ...shippingKeys,
};

export default ApiKeys;
