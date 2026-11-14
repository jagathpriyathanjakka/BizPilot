import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { CategoryIcon } from './CategoryIcon';

export const MetricCard = ({
  label,
  value,
  subValue,
  trend,
  trendValue,
  iconName = 'TrendingUp',
  highlightColor = 'violet',
}) => {
  const colorMap = {
    violet: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  };

  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-1 tracking-tight">{value}</h3>
        </div>
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center border ${colorMap[highlightColor] || colorMap.violet}`}>
          <CategoryIcon name={iconName} className="h-5 w-5" />
        </div>
      </div>

      {(subValue || trendValue) && (
        <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-800/60">
          {subValue && <span className="text-slate-400 truncate">{subValue}</span>}
          {trendValue && (
            <div
              className={`flex items-center gap-1 font-semibold ${
                trend === 'up'
                  ? 'text-emerald-400'
                  : trend === 'down'
                  ? 'text-rose-400'
                  : 'text-slate-400'
              }`}
            >
              {trend === 'up' && <ArrowUpRight className="h-3.5 w-3.5" />}
              {trend === 'down' && <ArrowDownRight className="h-3.5 w-3.5" />}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MetricCard;
