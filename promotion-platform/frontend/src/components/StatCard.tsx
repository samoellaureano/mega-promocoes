'use client';

import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
    isPercentage?: boolean;
  };
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
  className?: string;
}

const colorClasses = {
  blue: {
    icon: 'text-blue-600 bg-blue-100',
    trend: 'text-blue-600',
    accent: 'border-blue-200'
  },
  green: {
    icon: 'text-green-600 bg-green-100',
    trend: 'text-green-600',
    accent: 'border-green-200'
  },
  yellow: {
    icon: 'text-yellow-600 bg-yellow-100',
    trend: 'text-yellow-600',
    accent: 'border-yellow-200'
  },
  red: {
    icon: 'text-red-600 bg-red-100',
    trend: 'text-red-600',
    accent: 'border-red-200'
  },
  purple: {
    icon: 'text-purple-600 bg-purple-100',
    trend: 'text-purple-600',
    accent: 'border-purple-200'
  },
  gray: {
    icon: 'text-gray-600 bg-gray-100',
    trend: 'text-gray-600',
    accent: 'border-gray-200'
  }
};

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  color = 'blue',
  className = ''
}: StatCardProps) {
  const colors = colorClasses[color];
  const isPositiveTrend = trend && trend.value > 0;
  
  return (
    <div className={`card p-6 border-l-4 ${colors.accent} hover:shadow-lg transition-all duration-200 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 truncate">
            {title}
          </p>
          
          <div className="flex items-baseline mt-2">
            <p className="text-2xl font-bold text-gray-900">
              {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
            </p>
            
            {trend && (
              <div className={`ml-2 flex items-center text-sm ${colors.trend}`}>
                {isPositiveTrend ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1" />
                )}
                
                <span className="font-medium">
                  {trend.isPercentage ? `${trend.value}%` : trend.value}
                </span>
                
                <span className="ml-1 text-gray-500">
                  {trend.label}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className={`flex-shrink-0 p-3 rounded-lg ${colors.icon}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      
      {/* Progress bar (opcional) */}
      {trend && trend.isPercentage && (
        <div className="mt-4">
          <div className="bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                color === 'green' ? 'bg-green-500' :
                color === 'blue' ? 'bg-blue-500' :
                color === 'yellow' ? 'bg-yellow-500' :
                color === 'red' ? 'bg-red-500' :
                color === 'purple' ? 'bg-purple-500' : 'bg-gray-500'
              }`}
              style={{ width: `${Math.min(trend.value, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}