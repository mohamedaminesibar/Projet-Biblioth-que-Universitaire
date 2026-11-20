import React from 'react';
import { BookOpen } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="text-center py-16 px-4 rounded-3xl bg-white border border-dashed border-[#8AD6D1]/60 shadow-2xs">
      <div className="w-14 h-14 rounded-2xl bg-[#8AD6D1]/20 text-[#227878] flex items-center justify-center mx-auto mb-3">
        {icon || <BookOpen className="w-7 h-7" />}
      </div>
      <h3 className="text-base font-bold text-slate-800 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
