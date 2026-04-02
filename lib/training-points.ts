export type PointOption = {
  label: string;
  value: number;
  backgroundClassName: string;
  textClassName: string;
};

export const POINT_OPTIONS: PointOption[] = [
  { label: '10', value: 10, backgroundClassName: 'bg-[#FFD700]', textClassName: 'text-black' },
  { label: '9', value: 9, backgroundClassName: 'bg-[#FFD700]', textClassName: 'text-black' },
  { label: '8', value: 8, backgroundClassName: 'bg-[#FF0000]', textClassName: 'text-white' },
  { label: '7', value: 7, backgroundClassName: 'bg-[#FF0000]', textClassName: 'text-white' },
  { label: '6', value: 6, backgroundClassName: 'bg-[#0000FF]', textClassName: 'text-white' },
  { label: '5', value: 5, backgroundClassName: 'bg-[#0000FF]', textClassName: 'text-white' },
  { label: '4', value: 4, backgroundClassName: 'bg-[#000000]', textClassName: 'text-white' },
  { label: '3', value: 3, backgroundClassName: 'bg-[#000000]', textClassName: 'text-white' },
  { label: '2', value: 2, backgroundClassName: 'bg-[#FFFFFF] border border-border', textClassName: 'text-black' },
  { label: '1', value: 1, backgroundClassName: 'bg-[#FFFFFF] border border-border', textClassName: 'text-black' },
  { label: 'M', value: 0, backgroundClassName: 'bg-[#4A4A4A]', textClassName: 'text-white' },
];
