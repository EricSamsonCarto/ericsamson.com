/**
 * Chart - A lightweight, reusable charting library
 * Supports bar charts, column charts, and line charts
 * Built with vanilla JavaScript and Canvas API
 */

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface ChartDataset {
  label: string;
  data: ChartDataPoint[];
  color?: string;
}

export interface ChartConfig {
  type: 'bar' | 'column' | 'line';
  title?: string;
  subtitle?: string;
  datasets: ChartDataset[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  height?: number;
  width?: number;
  colors?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
  animate?: boolean;
  tooltip?: boolean;
  yAxisSuffix?: string;
  theme?: 'light' | 'dark';
}

const DEFAULT_COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
];

interface BarRect {
  x: number;
  y: number;
  width: number;
  height: number;
  datasetIndex: number;
  pointIndex: number;
  value: number;
  label: string;
  color: string;
}

export class Chart {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private config: ChartConfig;
  private animationProgress: number = 0;
  private hoveredBar: BarRect | null = null;
  private barRects: BarRect[] = [];
  private padding = { top: 70, right: 20, bottom: 30, left: 60 }; // Minimized bottom padding

  constructor(canvasId: string, config: ChartConfig) {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) {
      throw new Error(`Canvas with id "${canvasId}" not found`);
    }

    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get 2D context from canvas');
    }

    this.ctx = ctx;
    this.config = {
      ...config,
      colors: config.colors || DEFAULT_COLORS,
      showLegend: config.showLegend ?? (config.datasets.length > 1),
      showGrid: config.showGrid ?? true,
      animate: config.animate ?? true,
      tooltip: config.tooltip ?? true,
      theme: config.theme || 'light',
    };

    // Adjust padding for legend
    if (this.config.showLegend && this.config.datasets.length > 1) {
      this.padding.bottom = 70; // Minimal space for legend
    }

    this.setupCanvas();
    this.setupEventListeners();
    this.render();
  }

  private setupCanvas(): void {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();

    this.canvas.width = rect.width * dpr;
    this.canvas.height = (this.config.height || 400) * dpr;
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${this.config.height || 400}px`;

    this.ctx.scale(dpr, dpr);
  }

  private setupEventListeners(): void {
    if (this.config.tooltip) {
      this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
      this.canvas.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
    }

    window.addEventListener('resize', () => {
      this.setupCanvas();
      this.render();
    });
  }

  private handleMouseMove(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const hoveredBar = this.barRects.find(bar => {
      return x >= bar.x && x <= bar.x + bar.width && y >= bar.y && y <= bar.y + bar.height;
    });

    if (hoveredBar !== this.hoveredBar) {
      this.hoveredBar = hoveredBar || null;
      this.canvas.style.cursor = hoveredBar ? 'pointer' : 'default';
      this.render();
    }
  }

  private handleMouseLeave(): void {
    if (this.hoveredBar) {
      this.hoveredBar = null;
      this.canvas.style.cursor = 'default';
      this.render();
    }
  }

  private render(): void {
    if (this.config.animate && this.animationProgress < 1) {
      this.animationProgress += 0.05;
      requestAnimationFrame(() => this.render());
    }

    this.clear();
    this.drawTitle();

    switch (this.config.type) {
      case 'bar':
        this.drawBarChart();
        break;
      case 'column':
        this.drawColumnChart();
        break;
      case 'line':
        this.drawLineChart();
        break;
    }

    if (this.config.showLegend && this.config.datasets.length > 1) {
      this.drawLegend();
    }

    if (this.hoveredBar && this.config.tooltip) {
      this.drawTooltip();
    }
  }

  private clear(): void {
    const bgColor = this.config.theme === 'dark' ? '#1f2937' : '#ffffff';
    this.ctx.fillStyle = bgColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private drawTitle(): void {
    if (!this.config.title) return;

    const width = this.canvas.width / (window.devicePixelRatio || 1);
    const textColor = this.config.theme === 'dark' ? '#f9fafb' : '#111827';

    // Responsive font sizes
    const isMobile = width < 640;
    const titleSize = isMobile ? 16 : 20;
    const subtitleSize = isMobile ? 12 : 14;

    this.ctx.fillStyle = textColor;
    this.ctx.font = `bold ${titleSize}px system-ui, -apple-system, sans-serif`;
    this.ctx.textAlign = 'center';

    // Word wrap title on mobile if needed
    const maxWidth = width - 40;
    this.wrapText(this.config.title, width / 2, 25, maxWidth, titleSize + 4);

    if (this.config.subtitle) {
      this.ctx.font = `${subtitleSize}px system-ui, -apple-system, sans-serif`;
      this.ctx.fillStyle = this.config.theme === 'dark' ? '#9ca3af' : '#6b7280';
      this.ctx.fillText(this.config.subtitle, width / 2, isMobile ? 45 : 50);
    }
  }

  private wrapText(text: string, x: number, y: number, maxWidth: number, lineHeight: number): void {
    const words = text.split(' ');
    let line = '';
    let testLine = '';
    let lineCount = 0;

    for (let n = 0; n < words.length; n++) {
      testLine = line + words[n] + ' ';
      const metrics = this.ctx.measureText(testLine);

      if (metrics.width > maxWidth && n > 0) {
        this.ctx.fillText(line, x, y + lineCount * lineHeight);
        line = words[n] + ' ';
        lineCount++;
      } else {
        line = testLine;
      }
    }
    this.ctx.fillText(line, x, y + lineCount * lineHeight);
  }

  private drawBarChart(): void {
    const width = this.canvas.width / (window.devicePixelRatio || 1);
    const height = this.canvas.height / (window.devicePixelRatio || 1);
    const chartHeight = height - this.padding.top - this.padding.bottom;
    const chartWidth = width - this.padding.left - this.padding.right;

    this.barRects = [];

    const maxValue = Math.max(...this.config.datasets.flatMap(ds => ds.data.map(d => d.value)));

    if (this.config.showGrid) {
      this.drawGrid(this.padding.left, chartWidth, chartHeight, maxValue, false);
    }

    const dataPoints = this.config.datasets[0].data;
    const barHeight = chartHeight / dataPoints.length / this.config.datasets.length;
    const groupHeight = chartHeight / dataPoints.length;

    this.config.datasets.forEach((dataset, datasetIndex) => {
      dataset.data.forEach((point, index) => {
        const barWidth = (point.value / maxValue) * chartWidth * this.animationProgress;
        const y = this.padding.top + index * groupHeight + datasetIndex * barHeight;
        const color = point.color || dataset.color || this.config.colors![datasetIndex % this.config.colors!.length];

        this.ctx.fillStyle = color;
        this.ctx.fillRect(this.padding.left, y, barWidth, barHeight * 0.8);

        this.barRects.push({
          x: this.padding.left,
          y,
          width: barWidth,
          height: barHeight * 0.8,
          datasetIndex,
          pointIndex: index,
          value: point.value,
          label: point.label,
          color,
        });

        this.ctx.fillStyle = this.config.theme === 'dark' ? '#f9fafb' : '#111827';
        this.ctx.font = '12px system-ui, -apple-system, sans-serif';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(point.label, this.padding.left - 10, y + barHeight * 0.5);
      });
    });

    this.drawAxes(this.padding.left, chartWidth, chartHeight);
  }

  private drawColumnChart(): void {
    const width = this.canvas.width / (window.devicePixelRatio || 1);
    const height = this.canvas.height / (window.devicePixelRatio || 1);
    const chartHeight = height - this.padding.top - this.padding.bottom;
    const chartWidth = width - this.padding.left - this.padding.right;

    this.barRects = [];

    const maxValue = Math.max(...this.config.datasets.flatMap(ds => ds.data.map(d => d.value)));

    if (this.config.showGrid) {
      this.drawGrid(this.padding.left, chartWidth, chartHeight, maxValue, true);
    }

    const dataPoints = this.config.datasets[0].data;
    const groupWidth = chartWidth / dataPoints.length;
    const barWidth = groupWidth / this.config.datasets.length * 0.8; // 80% of available space
    const groupPadding = groupWidth * 0.1; // 10% padding on each side

    this.config.datasets.forEach((dataset, datasetIndex) => {
      dataset.data.forEach((point, index) => {
        const columnHeight = (point.value / maxValue) * chartHeight * this.animationProgress;
        const x = this.padding.left + index * groupWidth + groupPadding + datasetIndex * barWidth;
        const y = this.padding.top + chartHeight - columnHeight;
        const color = point.color || dataset.color || this.config.colors![datasetIndex % this.config.colors!.length];

        // Highlight on hover
        const isHovered = this.hoveredBar?.datasetIndex === datasetIndex && this.hoveredBar?.pointIndex === index;
        this.ctx.fillStyle = isHovered ? this.adjustColorBrightness(color, 20) : color;

        this.ctx.fillRect(x, y, barWidth, columnHeight);

        this.barRects.push({
          x,
          y,
          width: barWidth,
          height: columnHeight,
          datasetIndex,
          pointIndex: index,
          value: point.value,
          label: point.label,
          color,
        });

        // Draw label (only once per group)
        if (datasetIndex === 0) {
          this.ctx.fillStyle = this.config.theme === 'dark' ? '#f9fafb' : '#111827';
          this.ctx.font = '12px system-ui, -apple-system, sans-serif';
          this.ctx.textAlign = 'center';
          const labelX = this.padding.left + index * groupWidth + groupWidth / 2;
          this.ctx.fillText(point.label, labelX, this.padding.top + chartHeight + 20);
        }
      });
    });

    this.drawAxes(this.padding.left, chartWidth, chartHeight);
  }

  private drawLineChart(): void {
    const width = this.canvas.width / (window.devicePixelRatio || 1);
    const height = this.canvas.height / (window.devicePixelRatio || 1);
    const chartHeight = height - this.padding.top - this.padding.bottom;
    const chartWidth = width - this.padding.left - this.padding.right;

    this.barRects = [];

    const maxValue = Math.max(...this.config.datasets.flatMap(ds => ds.data.map(d => d.value)));

    if (this.config.showGrid) {
      this.drawGrid(this.padding.left, chartWidth, chartHeight, maxValue, true);
    }

    this.config.datasets.forEach((dataset, datasetIndex) => {
      const color = dataset.color || this.config.colors![datasetIndex % this.config.colors!.length];

      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();

      dataset.data.forEach((point, index) => {
        const x = this.padding.left + (index / (dataset.data.length - 1)) * chartWidth;
        const y = this.padding.top + chartHeight - (point.value / maxValue) * chartHeight * this.animationProgress;

        if (index === 0) {
          this.ctx.moveTo(x, y);
        } else {
          this.ctx.lineTo(x, y);
        }

        // Draw point
        const isHovered = this.hoveredBar?.datasetIndex === datasetIndex && this.hoveredBar?.pointIndex === index;
        this.ctx.fillStyle = isHovered ? this.adjustColorBrightness(color, 30) : color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, isHovered ? 6 : 4, 0, Math.PI * 2);
        this.ctx.fill();

        // Store point for hit detection
        this.barRects.push({
          x: x - 6,
          y: y - 6,
          width: 12,
          height: 12,
          datasetIndex,
          pointIndex: index,
          value: point.value,
          label: point.label,
          color,
        });
      });

      this.ctx.stroke();

      // Draw labels
      if (datasetIndex === 0) {
        dataset.data.forEach((point, index) => {
          const x = this.padding.left + (index / (dataset.data.length - 1)) * chartWidth;
          this.ctx.fillStyle = this.config.theme === 'dark' ? '#f9fafb' : '#111827';
          this.ctx.font = '12px system-ui, -apple-system, sans-serif';
          this.ctx.textAlign = 'center';
          this.ctx.fillText(point.label, x, this.padding.top + chartHeight + 20);
        });
      }
    });

    this.drawAxes(this.padding.left, chartWidth, chartHeight);
  }

  private drawGrid(padding: number, chartWidth: number, chartHeight: number, maxValue: number, vertical: boolean): void {
    const gridColor = this.config.theme === 'dark' ? '#374151' : '#e5e7eb';
    this.ctx.strokeStyle = gridColor;
    this.ctx.lineWidth = 1;

    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      if (vertical) {
        const y = this.padding.top + (i / gridLines) * chartHeight;
        this.ctx.beginPath();
        this.ctx.moveTo(padding, y);
        this.ctx.lineTo(padding + chartWidth, y);
        this.ctx.stroke();

        // Draw value labels
        const value = maxValue * (1 - i / gridLines);
        this.ctx.fillStyle = this.config.theme === 'dark' ? '#9ca3af' : '#6b7280';
        this.ctx.font = '10px system-ui, -apple-system, sans-serif';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(
          Math.round(value).toLocaleString() + (this.config.yAxisSuffix || ''),
          padding - 10,
          y + 4
        );
      }
    }
  }

  private drawAxes(padding: number, chartWidth: number, chartHeight: number): void {
    const axisColor = this.config.theme === 'dark' ? '#6b7280' : '#374151';
    this.ctx.strokeStyle = axisColor;
    this.ctx.lineWidth = 2;

    // X axis
    this.ctx.beginPath();
    this.ctx.moveTo(padding, this.padding.top + chartHeight);
    this.ctx.lineTo(padding + chartWidth, this.padding.top + chartHeight);
    this.ctx.stroke();

    // Y axis
    this.ctx.beginPath();
    this.ctx.moveTo(padding, this.padding.top);
    this.ctx.lineTo(padding, this.padding.top + chartHeight);
    this.ctx.stroke();
  }

  private drawLegend(): void {
    if (this.config.datasets.length <= 1) return;

    const height = this.canvas.height / (window.devicePixelRatio || 1);

    // Position legend very close to chart bottom
    const legendY = height - 20; // Fixed position near bottom with 20px margin
    let x = this.padding.left;

    this.config.datasets.forEach((dataset, index) => {
      const color = dataset.color || this.config.colors![index % this.config.colors!.length];

      // Draw color box
      this.ctx.fillStyle = color;
      this.ctx.fillRect(x, legendY - 10, 15, 15);

      // Draw label
      this.ctx.fillStyle = this.config.theme === 'dark' ? '#f9fafb' : '#111827';
      this.ctx.font = '12px system-ui, -apple-system, sans-serif';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(dataset.label, x + 20, legendY + 2);

      x += this.ctx.measureText(dataset.label).width + 40;
    });
  }

  private drawTooltip(): void {
    if (!this.hoveredBar) return;

    const width = this.canvas.width / (window.devicePixelRatio || 1);
    const dataset = this.config.datasets[this.hoveredBar.datasetIndex];
    const datasetLabel = dataset.label;
    const value = this.hoveredBar.value.toLocaleString() + (this.config.yAxisSuffix || '');

    // Tooltip content - show dataset label for multi-dataset charts, just value for single dataset
    const tooltipText = this.config.datasets.length > 1
      ? `${datasetLabel}: ${value}`
      : value;

    // Measure text
    this.ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
    const textWidth = this.ctx.measureText(tooltipText).width;
    const tooltipWidth = textWidth + 20;
    const tooltipHeight = 35;

    // Position tooltip
    let tooltipX = this.hoveredBar.x + this.hoveredBar.width / 2 - tooltipWidth / 2;
    let tooltipY = this.hoveredBar.y - tooltipHeight - 10;

    // Keep tooltip in bounds
    if (tooltipX < 10) tooltipX = 10;
    if (tooltipX + tooltipWidth > width - 10) tooltipX = width - tooltipWidth - 10;
    if (tooltipY < 10) tooltipY = this.hoveredBar.y + this.hoveredBar.height + 10;

    // Draw tooltip background
    this.ctx.fillStyle = this.config.theme === 'dark' ? '#1f2937' : '#ffffff';
    this.ctx.strokeStyle = this.config.theme === 'dark' ? '#4b5563' : '#d1d5db';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.roundRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 6);
    this.ctx.fill();
    this.ctx.stroke();

    // Draw tooltip text
    this.ctx.fillStyle = this.config.theme === 'dark' ? '#f9fafb' : '#111827';
    this.ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(tooltipText, tooltipX + tooltipWidth / 2, tooltipY + 22);
  }

  private adjustColorBrightness(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255))
      .toString(16).slice(1);
  }

  public destroy(): void {
    this.canvas.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.removeEventListener('mouseleave', this.handleMouseLeave.bind(this));
  }
}

// Auto-initialize all charts on the page
export function initializeCharts(): void {
  const charts = document.querySelectorAll('[data-chart]');
  charts.forEach((chartElement) => {
    const id = chartElement.getAttribute('id');
    const configStr = chartElement.getAttribute('data-chart-config');

    if (id && configStr) {
      try {
        const config = JSON.parse(configStr);
        new Chart(id, config);
      } catch (error) {
        console.error(`Failed to initialize chart ${id}:`, error);
      }
    }
  });
}
