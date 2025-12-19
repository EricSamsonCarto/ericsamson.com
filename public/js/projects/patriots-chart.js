am4core.useTheme(am4themes_animated);

const chart = am4core.create("chartdiv", am4charts.XYChart3D);

chart.data = [
  { country: "Bears", visits: 100 },
  { country: "Cowboys", visits: 100 },
  { country: "Falcons", visits: 100 },
  { country: "Vikings", visits: 100 },
  { country: "Bills", visits: 89 },
  { country: "Jaguars", visits: 89 },
  { country: "Browns", visits: 88 },
  { country: "Raiders", visits: 86 },
  { country: "Rams", visits: 86 },
  { country: "Texans", visits: 83 },
  { country: "Lions", visits: 80 },
  { country: "Redskins", visits: 80 },
  { country: "Saints", visits: 80 },
  { country: "Buccaneers", visits: 78 },
  { country: "Titans", visits: 78 },
  { country: "Jets", visits: 78 },
  { country: "Bengals", visits: 78 },
  { country: "Cardinals", visits: 75 },
  { country: "Chargers", visits: 75 },
  { country: "Colts", visits: 75 },
  { country: "Forty-Niners", visits: 75 },
  { country: "Steelers", visits: 75 },
  { country: "Eagles", visits: 71 },
  { country: "Dolphins", visits: 68 },
  { country: "Ravens", visits: 67 },
  { country: "Chiefs", visits: 64 },
  { country: "Packers", visits: 60 },
  { country: "Seahawks", visits: 60 },
  { country: "Giants", visits: 57 },
  { country: "Broncos", visits: 50 },
  { country: "Panthers", visits: 50 }
];

const categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
categoryAxis.dataFields.category = "country";
categoryAxis.renderer.labels.template.rotation = 270;
categoryAxis.renderer.labels.template.hideOversized = false;
categoryAxis.renderer.minGridDistance = 20;
categoryAxis.renderer.labels.template.horizontalCenter = "right";
categoryAxis.renderer.labels.template.verticalCenter = "middle";
categoryAxis.tooltip.label.rotation = 270;
categoryAxis.tooltip.label.horizontalCenter = "right";
categoryAxis.tooltip.label.verticalCenter = "middle";

const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
valueAxis.title.text = "Winning Percentage";
valueAxis.title.fontWeight = "bold";

const series = chart.series.push(new am4charts.ColumnSeries3D());
series.dataFields.valueY = "visits";
series.dataFields.categoryX = "country";
series.name = "Visits";
series.tooltipText = "{categoryX}: [bold]{valueY}[/]";
series.columns.template.fillOpacity = 0.8;

const columnTemplate = series.columns.template;
columnTemplate.strokeWidth = 2;
columnTemplate.strokeOpacity = 1;
columnTemplate.stroke = am4core.color("#FFFFFF");

series.columns.template.adapter.add("fill", function(fill, target) {
  if (!target.dataItem) return fill;

  const value = target.dataItem.valueY;

  if (value > 95) return am4core.color("#1e3188");
  if (value > 90) return am4core.color("#1d5aa5");
  if (value > 84) return am4core.color("#3b9dc3");
  if (value > 79) return am4core.color("#6ac1cc");
  if (value > 76) return am4core.color("#82d2d0");
  if (value > 74) return am4core.color("#86d0ae");
  if (value > 68) return am4core.color("#b6e4a9");
  if (value > 66) return am4core.color("#b6e4a9");
  if (value > 59) return am4core.color("#daf0cf");
  if (value > 56) return am4core.color("#daf0cf");
  return am4core.color("#f6f9ea");
});

columnTemplate.adapter.add("stroke", function(stroke, target) {
  return chart.colors.getIndex(target.dataItem.index);
});

chart.cursor = new am4charts.XYCursor();
chart.cursor.lineX.strokeOpacity = 0;
chart.cursor.lineY.strokeOpacity = 0;
