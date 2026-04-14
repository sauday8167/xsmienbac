
'use client';

import { useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Loader2 } from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function TrendChart() {
    const [chartData, setChartData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/results/trends');
                const data = await response.json();
                if (data.success) {
                    setChartData(data.data);
                }
            } catch (error) {
                console.error('Error fetching trend data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[300px] bg-white rounded-2xl border border-slate-100">
                <Loader2 className="w-8 h-8 text-lottery-red-600 animate-spin mb-2" />
                <p className="text-slate-500 text-sm">Đang tải biểu đồ xu hướng...</p>
            </div>
        );
    }

    if (!chartData) return null;

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: {
                        size: 12,
                        weight: 'bold' as any,
                        family: 'Inter'
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                padding: 12,
                titleFont: { size: 13, weight: 'bold' as any },
                bodyFont: { size: 12 },
                cornerRadius: 8,
                displayColors: true
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                    font: { size: 11 }
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                }
            },
            x: {
                ticks: {
                    font: { size: 11 },
                    maxRotation: 45,
                    minRotation: 45
                },
                grid: {
                    display: false
                }
            }
        },
        interaction: {
            intersect: false,
            mode: 'index' as const
        }
    };

    return (
        <div className="card bg-white border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-black text-slate-800">Biểu đồ Xu hướng Tần suất</h3>
                    <p className="text-xs text-slate-500">Tần suất xuất hiện của Top 5 con số nổi bật trong 30 ngày qua</p>
                </div>
            </div>
            
            <div className="h-[400px] w-full mt-4">
                <Line data={chartData} options={options} />
            </div>
            
            <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-600 flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-lottery-red-600 mt-1 flex-shrink-0 animate-pulse"></div>
                <p>
                    <strong>Mẹo soi cầu:</strong> Những con số có "gia tốc" đang đi lên trên biểu đồ thường có xác suất nổ cao hơn trong những ngày tới. Hãy chú ý đến sự giao thoa của các đường biểu đồ!
                </p>
            </div>
        </div>
    );
}
