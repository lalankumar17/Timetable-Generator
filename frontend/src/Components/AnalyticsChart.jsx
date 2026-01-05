import { memo, useRef, useEffect, useState } from 'react';

const AnalyticsChart = ({ data = [], title = "Semester Distribution" }) => {
    const containerRef = useRef(null);
    const [containerWidth, setContainerWidth] = useState(0);

    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.clientWidth);
            }
        };
        updateWidth();
        const observer = new ResizeObserver(updateWidth);
        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    const maxVal = Math.max(...data.map(d => d.value), 1);
    const chartHeight = 160;
    const padding = { top: 20, bottom: 35, left: 10, right: 10 };
    const drawableHeight = chartHeight - padding.top - padding.bottom;
    const svgWidth = Math.max(containerWidth, 100);

    const barCount = data.length || 1;
    const totalGapRatio = 0.4;
    const availableWidth = svgWidth - padding.left - padding.right;
    const gap = (availableWidth * totalGapRatio) / (barCount + 1);
    const barWidth = Math.min((availableWidth - gap * (barCount + 1)) / barCount, 50);
    const totalBarsWidth = barCount * barWidth + (barCount + 1) * gap;
    const offsetX = padding.left + (availableWidth - totalBarsWidth) / 2;

    // Grid lines
    const gridLines = 4;
    const gridValues = Array.from({ length: gridLines + 1 }, (_, i) => Math.round((maxVal / gridLines) * i));

    return (
        <div className="analytics-chart-container" ref={containerRef}>
            {title && <h3 className="chart-title">{title}</h3>}
            <svg width="100%" height={chartHeight} viewBox={`0 0 ${svgWidth} ${chartHeight}`} preserveAspectRatio="xMidYMid meet">
                {/* Grid lines */}
                {gridValues.map((val, i) => {
                    const y = padding.top + drawableHeight - (val / maxVal) * drawableHeight;
                    return (
                        <line
                            key={`grid-${i}`}
                            x1={padding.left}
                            x2={svgWidth - padding.right}
                            y1={y}
                            y2={y}
                            stroke="var(--borderColor, #e5e7eb)"
                            strokeWidth="0.5"
                            strokeDasharray={i === 0 ? "0" : "4 3"}
                        />
                    );
                })}

                {/* Bars */}
                {data.map((d, i) => {
                    const h = (d.value / maxVal) * drawableHeight;
                    const x = offsetX + gap + i * (barWidth + gap);
                    const y = padding.top + drawableHeight - h;
                    const label = d.label ? `Sem ${d.label}` : 'N/A';

                    return (
                        <g key={i} className="bar-group">
                            <rect
                                x={x}
                                y={y}
                                width={barWidth}
                                height={h}
                                rx="5"
                                className="chart-bar"
                                style={{ fill: 'var(--accentColor, #3b82f6)' }}
                            />
                            {/* Value label on top */}
                            <text
                                x={x + barWidth / 2}
                                y={y - 6}
                                textAnchor="middle"
                                className="bar-value"
                            >
                                {d.value}
                            </text>
                            {/* Semester label at bottom */}
                            <text
                                x={x + barWidth / 2}
                                y={chartHeight - 8}
                                textAnchor="middle"
                                className="bar-label"
                            >
                                {label}
                            </text>
                        </g>
                    );
                })}
            </svg>
            <style>{`
                .analytics-chart-container {
                    width: 100%;
                    box-sizing: border-box;
                }
                .chart-title {
                    font-size: 1.1rem;
                    margin-bottom: 1rem;
                    color: var(--textColor);
                }
                .chart-bar {
                    transition: height 0.3s ease, y 0.3s ease;
                }
                .bar-group:hover .chart-bar {
                    filter: brightness(1.15);
                }
                .bar-label {
                    font-size: 11px;
                    fill: var(--textColor2, #6b7280);
                    font-weight: 500;
                }
                .bar-value {
                    font-size: 11px;
                    fill: var(--textColor, #1f2937);
                    font-weight: 700;
                    opacity: 0;
                    transition: opacity 0.2s;
                }
                .bar-group:hover .bar-value {
                    opacity: 1;
                }
            `}</style>
        </div>
    );
};

export default memo(AnalyticsChart);
