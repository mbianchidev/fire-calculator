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
  position = 'bottom',
  maxWidth
}) => {
  const style = maxWidth ? { '--tooltip-max-width': `${maxWidth}px` } as React.CSSProperties : undefined;
  
  return (
    <span 
      className={`simple-tooltip tooltip-${position}`} 
      data-tooltip={content}
      style={style}
    >
      {children}
    </span>
  );
};
