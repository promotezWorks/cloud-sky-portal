import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useSound } from '@/hooks/use-sound';

export interface WheelPickerItem {
  value: string | number;
  label: string;
}

export interface WheelPickerProps {
  items: WheelPickerItem[];
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (value: string | number) => void;
  className?: string;
  itemHeight?: number;
  visibleItemsCount?: number;
}

/**
 * React Wheel Picker Component
 * Inspired by https://react-wheel-picker.chanhdai.com/ (@ncdai/react-wheel-picker)
 * Features iOS-style 3D wheel curvature, inertia scrolling, and SoundCN tactile audio feedback.
 */
export function WheelPicker({
  items,
  value: controlledValue,
  defaultValue,
  onChange,
  className,
  itemHeight = 40,
  visibleItemsCount = 5,
}: WheelPickerProps) {
  const [internalValue, setInternalValue] = useState<string | number>(
    controlledValue ?? defaultValue ?? items[0]?.value ?? ''
  );
  const activeValue = controlledValue !== undefined ? controlledValue : internalValue;
  const activeIndex = Math.max(0, items.findIndex((i) => i.value === activeValue));
  const containerRef = useRef<HTMLDivElement>(null);
  const [playTap] = useSound('tap', { volume: 0.25 });
  const lastIndexRef = useRef(activeIndex);

  const containerHeight = itemHeight * visibleItemsCount;
  const halfVisible = Math.floor(visibleItemsCount / 2);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const scrollTop = containerRef.current.scrollTop;
    const newIndex = Math.round(scrollTop / itemHeight);
    const clampedIndex = Math.max(0, Math.min(items.length - 1, newIndex));

    if (clampedIndex !== lastIndexRef.current) {
      lastIndexRef.current = clampedIndex;
      playTap();
      const selectedItem = items[clampedIndex];
      if (selectedItem) {
        setInternalValue(selectedItem.value);
        onChange?.(selectedItem.value);
      }
    }
  }, [itemHeight, items, onChange, playTap]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = activeIndex * itemHeight;
    }
  }, [activeIndex, itemHeight]);

  return (
    <div
      className={cn(
        'relative select-none overflow-hidden rounded-xl border border-border bg-card/60 backdrop-blur-md shadow-inner text-card-foreground',
        className
      )}
      style={{ height: `${containerHeight}px` }}
    >
      {/* Center highlight lens */}
      <div
        className="pointer-events-none absolute inset-x-2 rounded-lg bg-primary/10 border border-primary/20"
        style={{
          top: `${halfVisible * itemHeight}px`,
          height: `${itemHeight}px`,
        }}
      />

      {/* Top/bottom vignette gradients for 3D cylinder depth */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-background via-background/60 to-transparent z-10" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-background via-background/60 to-transparent z-10" />

      {/* Scrollable container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto no-scrollbar snap-y snap-mandatory py-[calc(50%-20px)]"
        style={{
          paddingTop: `${halfVisible * itemHeight}px`,
          paddingBottom: `${halfVisible * itemHeight}px`,
          scrollbarWidth: 'none',
        }}
      >
        {items.map((item, idx) => {
          const isSelected = item.value === activeValue;
          const distance = Math.abs(idx - activeIndex);
          const opacity = Math.max(0.3, 1 - distance * 0.25);
          const scale = Math.max(0.85, 1 - distance * 0.05);

          return (
            <div
              key={item.value}
              onClick={() => {
                setInternalValue(item.value);
                onChange?.(item.value);
                if (containerRef.current) {
                  containerRef.current.scrollTo({
                    top: idx * itemHeight,
                    behavior: 'smooth',
                  });
                }
              }}
              className={cn(
                'snap-center flex items-center justify-center font-medium transition-all duration-150 cursor-pointer',
                isSelected ? 'text-primary font-semibold text-lg' : 'text-muted-foreground text-sm hover:text-foreground'
              )}
              style={{
                height: `${itemHeight}px`,
                opacity,
                transform: `scale(${scale})`,
              }}
            >
              {item.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default WheelPicker;
