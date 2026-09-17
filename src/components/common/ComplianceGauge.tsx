import React from 'react';

interface ComplianceGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  recommendation?: 'approve' | 'approve_with_conditions' | 'correction_required' | 'reject';
}

export const ComplianceGauge: React.FC<ComplianceGaugeProps> = ({
  score,
  size = 'md',
  recommendation
}) => {
  const normalizedScore = Math.min(100, Math.max(0, score));

  // Determine color scheme
  let strokeColor = '#10b981'; // Emerald
  let badgeColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  let label = 'Fully Compliant';

  if (normalizedScore < 70) {
    strokeColor = '#ef4444'; // Red
    badgeColor = 'text-rose-700 bg-rose-50 border-rose-200';
    label = 'Non-Compliant';
  } else if (normalizedScore < 85) {
    strokeColor = '#f59e0b'; // Amber
    badgeColor = 'text-amber-700 bg-amber-50 border-amber-200';
    label = 'Minor Deviations';
  } else if (normalizedScore < 100) {
    strokeColor = '#3b82f6'; // Blue
    badgeColor = 'text-blue-700 bg-blue-50 border-blue-200';
    label = 'Substantially Compliant';
  }

  const dimensions = {
    sm: { radius: 24, strokeWidth: 4, width: 64, height: 64, fontSize: 'text-xs' },
    md: { radius: 38, strokeWidth: 6, width: 96, height: 96, fontSize: 'text-xl' },
    lg: { radius: 52, strokeWidth: 8, width: 130, height: 130, fontSize: 'text-3xl' },
  }[size];

  const circumference = 2 * Math.PI * dimensions.radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="relative flex items-center justify-center" style={{ width: dimensions.width, height: dimensions.height }}>
        <svg className="transform -rotate-90" width={dimensions.width} height={dimensions.height}>
          {/* Background circle */}
          <circle
            cx={dimensions.width / 2}
            cy={dimensions.height / 2}
            r={dimensions.radius}
            stroke="#e2e8f0"
            strokeWidth={dimensions.strokeWidth}
            fill="transparent"
          />
          {/* Animated score circle */}
          <circle
            cx={dimensions.width / 2}
            cy={dimensions.height / 2}
            r={dimensions.radius}
            stroke={strokeColor}
            strokeWidth={dimensions.strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-bold font-mono tracking-tight text-slate-900 ${dimensions.fontSize}`}>
            {normalizedScore}%
          </span>
          {size === 'lg' && (
            <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
              TNCDBR
            </span>
          )}
        </div>
      </div>
      {size !== 'sm' && (
        <span className={`mt-2 inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badgeColor}`}>
          {label}
        </span>
      )}
    </div>
  );
};
