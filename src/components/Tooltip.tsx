import { useState, useRef, useEffect } from 'react';
import './Tooltip.css';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  maxWidth?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({ 
  content, 
  children, 
  position = 'top',
  maxWidth = 300 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<{ top?: number; left?: number; transform?: string }>({});
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const trigger = triggerRef.current.getBoundingClientRect();
      const tooltip = tooltipRef.current.getBoundingClientRect();
      const spacing = 8;

      let top = 0;
      let left = 0;
      let transform = '';

      switch (position) {
        case 'top':
          top = trigger.top - tooltip.height - spacing;
          left = trigger.left + trigger.width / 2;
          transform = 'translateX(-50%)';
          break;
        case 'bottom':
          top = trigger.bottom + spacing;
          left = trigger.left + trigger.width / 2;
          transform = 'translateX(-50%)';
          break;
        case 'left':
          top = trigger.top + trigger.height / 2;
          left = trigger.left - tooltip.width - spacing;
          transform = 'translateY(-50%)';
          break;
        case 'right':
          top = trigger.top + trigger.height / 2;
          left = trigger.right + spacing;
          transform = 'translateY(-50%)';
          break;
      }

      // Ensure tooltip stays within viewport
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      if (left + tooltip.width > viewportWidth) {
        left = viewportWidth - tooltip.width - 16;
        transform = '';
      }
      if (left < 16) {
        left = 16;
        transform = '';
      }
      if (top + tooltip.height > viewportHeight) {
        top = trigger.top - tooltip.height - spacing;
      }
      if (top < 16) {
        top = trigger.bottom + spacing;
      }

      setTooltipPosition({ top, left, transform });
    }
  }, [isVisible, position]);

  const handleMouseEnter = () => setIsVisible(true);
  const handleMouseLeave = () => setIsVisible(false);
  const handleFocus = () => setIsVisible(true);
  const handleBlur = () => setIsVisible(false);

  return (
    <div className="tooltip-wrapper" ref={triggerRef}>
      <div
        className="tooltip-trigger"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        tabIndex={0}
        role="button"
        aria-describedby={isVisible ? 'tooltip-content' : undefined}
      >
        {children}
      </div>
      {isVisible && (
        <div
          ref={tooltipRef}
          id="tooltip-content"
          className={`tooltip-content tooltip-${position}`}
          style={{
            ...tooltipPosition,
            maxWidth: `${maxWidth}px`,
          }}
          role="tooltip"
        >
          <div className="tooltip-arrow" />
          <div className="tooltip-text">{content}</div>
        </div>
      )}
    </div>
  );
};
