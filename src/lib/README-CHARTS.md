# Custom Chart Library

A lightweight, reusable charting library built with TypeScript and Canvas API for the ericsamson.com portfolio.

## Features

- **Multiple Chart Types**: Bar, Column, and Line charts
- **Customizable**: Colors, labels, themes, and more
- **Responsive**: Automatically adapts to container size
- **Animated**: Smooth animations on load
- **Accessible**: ARIA labels and keyboard support
- **Framework-Agnostic**: Pure TypeScript implementation
- **No Dependencies**: Built with vanilla JavaScript and Canvas API

## Usage

### Basic Example

```astro
---
import Chart from '../components/Chart.astro';

const data = {
  datasets: [
    {
      label: 'Dataset 1',
      data: [
        { label: 'Jan', value: 100 },
        { label: 'Feb', value: 150 },
        { label: 'Mar', value: 200 },
      ],
    },
  ],
};
---

<Chart
  type="column"
  title="Monthly Data"
  datasets={data.datasets}
  height={400}
/>
```

### Chart Types

#### Column Chart
Vertical bars, ideal for comparing values across categories.

```astro
<Chart
  type="column"
  title="Sales by Month"
  datasets={salesData.datasets}
  yAxisSuffix="K"
/>
```

#### Bar Chart
Horizontal bars, great for rankings or comparing many items.

```astro
<Chart
  type="bar"
  title="Top 10 Products"
  datasets={productsData.datasets}
/>
```

#### Line Chart
Connected points, perfect for showing trends over time.

```astro
<Chart
  type="line"
  title="Temperature Over Time"
  datasets={tempData.datasets}
  yAxisSuffix="°F"
/>
```

### Multiple Datasets

Compare multiple datasets side by side:

```astro
---
const comparisonData = {
  datasets: [
    {
      label: '2023',
      data: [
        { label: 'Q1', value: 100 },
        { label: 'Q2', value: 120 },
        { label: 'Q3', value: 140 },
        { label: 'Q4', value: 160 },
      ],
    },
    {
      label: '2024',
      data: [
        { label: 'Q1', value: 110 },
        { label: 'Q2', value: 130 },
        { label: 'Q3', value: 155 },
        { label: 'Q4', value: 175 },
      ],
    },
  ],
};
---

<Chart
  type="column"
  title="Quarterly Revenue"
  subtitle="Year over year comparison"
  datasets={comparisonData.datasets}
  showLegend={true}
/>
```

### Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `'bar' \| 'column' \| 'line'` | Required | Chart type |
| `title` | `string` | `undefined` | Chart title |
| `subtitle` | `string` | `undefined` | Chart subtitle |
| `datasets` | `ChartDataset[]` | Required | Array of datasets |
| `height` | `number` | `400` | Chart height in pixels |
| `colors` | `string[]` | Default palette | Array of color hex codes |
| `showLegend` | `boolean` | `true` | Show legend for multiple datasets |
| `showGrid` | `boolean` | `true` | Show grid lines |
| `animate` | `boolean` | `true` | Animate chart on load |
| `yAxisSuffix` | `string` | `''` | Suffix for Y axis values (e.g., 'mm', '%') |
| `theme` | `'light' \| 'dark'` | `'light'` | Color theme |
| `id` | `string` | Auto-generated | Unique identifier |

### Dataset Structure

```typescript
interface ChartDataset {
  label: string;           // Dataset name
  data: ChartDataPoint[];  // Array of data points
  color?: string;          // Override dataset color
}

interface ChartDataPoint {
  label: string;  // X-axis label
  value: number;  // Y-axis value
  color?: string; // Override point color
}
```

### Custom Colors

Use custom colors for your datasets:

```astro
<Chart
  type="column"
  title="Custom Colors"
  datasets={data.datasets}
  colors={['#3b82f6', '#10b981', '#f59e0b']}
/>
```

### Dark Theme

Enable dark theme for better contrast:

```astro
<Chart
  type="line"
  title="Night Mode Chart"
  datasets={data.datasets}
  theme="dark"
/>
```

### Y-Axis Suffix

Add units or context to Y-axis values:

```astro
<Chart
  type="column"
  title="Precipitation"
  datasets={precipData.datasets}
  yAxisSuffix=" mm"
/>
```

## Creating Reusable Chart Components

For frequently used charts, create a dedicated component:

```astro
---
// src/components/charts/MyCustomChart.astro
import Chart from '../Chart.astro';

const myData = {
  datasets: [
    {
      label: 'My Data',
      data: [
        { label: 'A', value: 10 },
        { label: 'B', value: 20 },
      ],
    },
  ],
};
---

<Chart
  type="column"
  title="My Custom Chart"
  datasets={myData.datasets}
  height={300}
/>
```

Then use it in your MDX files:

```mdx
import MyCustomChart from '../../components/charts/MyCustomChart.astro';

<MyCustomChart />
```

## Examples in This Project

- **TrinityPrecipChart.astro**: Multi-dataset column chart comparing precipitation
- **TrinitySnowCoverChart.astro**: Simple column chart showing snow cover area

## Browser Support

- Modern browsers with Canvas API support
- Responsive design works on mobile and desktop
- Gracefully degrades for browsers without canvas support

## Performance

- Lightweight: No external dependencies
- Fast rendering: Uses Canvas API
- Efficient: Only re-renders on interaction or resize
- Optimized: Device pixel ratio aware for crisp displays

## Accessibility

- Semantic HTML with ARIA labels
- Screen reader friendly
- Keyboard navigation support
- High contrast theme options

## Future Enhancements

Potential features for future versions:

- Interactive tooltips
- Data point click handlers
- Export to image/PDF
- More chart types (pie, scatter, area)
- Stacked bar/column charts
- Animation customization
- Legend positioning options
- Axis customization
