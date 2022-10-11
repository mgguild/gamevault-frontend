/* eslint-disable import/prefer-default-export */

export interface BreakPointsConfig {
  width: number;
  itemsToShow?: number;
  itemsToScroll?: number;
  pagination?: boolean;
}

export const Car1breakpoints: BreakPointsConfig[] = [
  { width: 1, itemsToShow: 1 },
  { width: 550, itemsToShow: 2, itemsToScroll: 2, pagination: false },
  { width: 850, itemsToShow: 3 },
  { width: 1150, itemsToShow: 3, itemsToScroll: 2 },
  { width: 1450, itemsToShow: 3 },
  { width: 1750, itemsToShow: 5 },
]