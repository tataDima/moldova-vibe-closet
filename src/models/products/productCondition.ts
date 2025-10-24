export const ProductCondition = {
  new: "new",
  like_new: "like_new",
  good: "good",
  fair: "fair",
  worn: "worn",
} as const;

export type ProductCondition =
  (typeof ProductCondition)[keyof typeof ProductCondition];

export const ProductConditionValues = Object.values(ProductCondition);

export const ProductConditionLabels = {
  [ProductCondition.new]: "Nou",
  [ProductCondition.like_new]: "Ca nou",
  [ProductCondition.good]: "Bun",
  [ProductCondition.fair]: "Satisfăcător",
  [ProductCondition.worn]: "Uzat",
} as const;

export type ProductConditionLabel =
  (typeof ProductConditionLabels)[keyof typeof ProductConditionLabels];

export const getProductConditionLabel = (condition: ProductCondition | string): ProductConditionLabel => {
  return ProductConditionLabels[condition] || condition;
};