'use client';

interface StatCardProps {
    icon: string;
    label: string;
    value: number | string;
    gradient: 'primary' | 'success' | 'warning' | 'info';
    trend?: {
        value: number;
        isPositive: boolean;
    };
}

export default function StatCard({ icon, label, value, gradient, trend }: StatCardProps) {
    return (
        <div className={`stat-card gradient-${gradient}`}>
            <div className="flex items-start justify-between">
                <div className="stat-card-icon">
                    {icon}
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-sm ${trend.isPositive ? 'text-green-200' : 'text-red-200'}`}>
                        <span>{trend.isPositive ? '↑' : '↓'}</span>
                        <span>{trend.value}%</span>
                    </div>
                )}
            </div>
            <div className="stat-card-value">{value}</div>
            <div className="stat-card-label">{label}</div>
        </div>
    );
}
