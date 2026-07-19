const discountUnitMap: Record<'fixed_amount' | 'percentage', string> = {
    fixed_amount: 'تومان',
    percentage: '%درصد'
};

export const formatDiscount = (value: number, type: 'fixed_amount' | 'percentage'): string => {
    const unit = discountUnitMap[type];
    return `${value} ${unit}`;
};
