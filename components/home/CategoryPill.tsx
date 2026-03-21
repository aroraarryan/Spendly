import React from 'react';
import NeoTag from '../ui/NeoTag';
import { CategoryRow } from '@/store/categoryStore';

interface CategoryPillProps {
    category: CategoryRow;
    amountSpent: number;
    currencySymbol: string;
    onPress: () => void;
}

export default function CategoryPill({ category, amountSpent, currencySymbol, onPress }: CategoryPillProps) {
    return (
        <NeoTag
            emoji={category.icon}
            label={`${category.name} • ${currencySymbol}${amountSpent.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
            color={category.color}
            onPress={onPress}
        />
    );
}
