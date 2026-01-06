import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function PriceRangeFilter({ minPrice, maxPrice, value, onChange }) {
  const [min, max] = value;

  const handleSliderChange = (newValue) => {
    onChange(newValue);
  };

  const handleMinChange = (e) => {
    const newMin = parseInt(e.target.value) || 0;
    onChange([Math.min(newMin, max), max]);
  };

  const handleMaxChange = (e) => {
    const newMax = parseInt(e.target.value) || maxPrice;
    onChange([min, Math.max(newMax, min)]);
  };

  return (
    <div className="space-y-4">
      <Label className="font-medium">Price Range</Label>
      <Slider
        min={minPrice}
        max={maxPrice}
        step={10}
        value={value}
        onValueChange={handleSliderChange}
        className="mt-2"
      />
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <Label className="text-xs text-gray-500">Min</Label>
          <Input
            type="number"
            value={min}
            onChange={handleMinChange}
            className="mt-1 h-9"
            placeholder="Min"
          />
        </div>
        <span className="text-gray-400 mt-5">-</span>
        <div className="flex-1">
          <Label className="text-xs text-gray-500">Max</Label>
          <Input
            type="number"
            value={max}
            onChange={handleMaxChange}
            className="mt-1 h-9"
            placeholder="Max"
          />
        </div>
      </div>
      <p className="text-sm text-gray-500 text-center">
        Rs. {min.toLocaleString()} - Rs. {max.toLocaleString()}
      </p>
    </div>
  );
}