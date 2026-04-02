export type PointOption = {
  label: string;
  value: number;
  backgroundColor: string;
  textColor: string;
  /** Visible ring so fills read clearly on any background */
  borderColor: string;
};

/** Touch target size (px). Kept explicit so flex layouts cannot shrink the control. */
export const SCORE_BUTTON_SIZE = 64;

export const SCORE_BUTTON_DIMENSIONS = {
  size: SCORE_BUTTON_SIZE,
  radius: SCORE_BUTTON_SIZE / 2,
} as const;

export const SCORE_BUTTON_BORDER_WIDTH = 2;

export const POINT_OPTIONS: PointOption[] = [
  { label: '10', value: 10, backgroundColor: '#FFD700', textColor: '#000000', borderColor: '#B8860B' },
  { label: '9', value: 9, backgroundColor: '#FFD700', textColor: '#000000', borderColor: '#B8860B' },
  { label: '8', value: 8, backgroundColor: '#FF0000', textColor: '#FFFFFF', borderColor: '#8B0000' },
  { label: '7', value: 7, backgroundColor: '#FF0000', textColor: '#FFFFFF', borderColor: '#8B0000' },
  { label: '6', value: 6, backgroundColor: '#0000FF', textColor: '#FFFFFF', borderColor: '#000080' },
  { label: '5', value: 5, backgroundColor: '#0000FF', textColor: '#FFFFFF', borderColor: '#000080' },
  { label: '4', value: 4, backgroundColor: '#000000', textColor: '#FFFFFF', borderColor: '#6B7280' },
  { label: '3', value: 3, backgroundColor: '#000000', textColor: '#FFFFFF', borderColor: '#6B7280' },
  { label: '2', value: 2, backgroundColor: '#FFFFFF', textColor: '#000000', borderColor: '#737373' },
  { label: '1', value: 1, backgroundColor: '#FFFFFF', textColor: '#000000', borderColor: '#737373' },
  { label: 'M', value: 0, backgroundColor: '#4A4A4A', textColor: '#FFFFFF', borderColor: '#1F1F1F' },
];
