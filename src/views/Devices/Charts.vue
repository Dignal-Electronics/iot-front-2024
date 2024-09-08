<template>
  <v-row>
    <!-- Columna 1 -->
    <v-col cols="12" md="6">
      <v-card color="grey-darken-2" variant="tonal" height="400px">
        <v-card-title class="text-red">Gráfico 1</v-card-title>
        <div class="h-chart" ref="zoomableChart"></div>
      </v-card>
    </v-col>

    <!-- Sección media -->
    <v-col cols="12" md="3">
      <v-row>
        <!-- Led -->
        <v-col cols="6">
          <v-card color="grey-darken-2" variant="tonal" height="180px">
            <v-card-title class="text-center">Led</v-card-title>
            <v-card-text class="h-100 text-center">
              <!-- v-row>v-col>v-btn -> me genera las etiquetas de ambos elementos. -->
              <v-row class="h-100 mt-3">
                <v-col>
                  <v-btn
                    size="x-large"
                    :color="light ? 'yellow' : 'blue-grey'"
                    :icon="light ? 'mdi-lightbulb-on' : 'mdi-lightbulb-outline'"
                    @click="toggleLight()"
                  ></v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Ventilador -->
        <v-col cols="6">
          <v-card color="grey-darken-2" variant="tonal" height="180px">
            <v-card-title class="text-center">Ventilador</v-card-title>
            <v-card-text class="h-100 text-center">
              <!-- v-row>v-col>v-btn -> me genera las etiquetas de ambos elementos. -->
              <v-row class="h-100 mt-3">
                <v-col>
                  <v-btn
                    size="x-large"
                    :class="fan ? 'rotate' : ''"
                    :color="fan ? 'yellow' : 'blue-grey'"
                    :icon="fan ? 'mdi-fan' : 'mdi-fan-off'"
                    @click="toggleFan()"
                  ></v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Slider luminosidad -->
        <v-col cols="12">
          <v-card title="Luminosidad" color="grey-darken-2" variant="tonal" height="195px">
            <v-card-text>
              <v-row class="mt-3">
                <v-col class="text-center">
                  <span class="text-h2 font-weight-light" :class="`text-${sliderColor}`">{{ luminosity }}</span>
                </v-col>
              </v-row>

              <v-slider
                v-model="luminosity"
                :step="1"
                :color="sliderColor"
                min="0"
                max="1023"
              >
                <template v-slot:prepend>
                  <span>0</span>
                </template>

                <template v-slot:append>
                  <span>1023</span>
                </template>
              </v-slider>

            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-col>

    <!-- Sección derecha -->
    <v-col cols="12" md="3">
      <v-card title="Gráfico 2" color="grey-darken-2" variant="tonal" height="400px">
        <div class="h-chart" ref="customPictorialChart"></div>
      </v-card>
    </v-col>

    <v-col cols="12" md="4">
      <v-card title="Temperatura" color="grey-darken-2" variant="tonal" height="400px">
        <div class="h-chart" ref="gauge"></div>
      </v-card>
    </v-col>

    <v-col cols="12" md="4">
      <v-card title="Luminosidad" color="grey-darken-2" variant="tonal" height="400px">
        <div class="h-chart" ref="gauge2"></div>
      </v-card>
    </v-col>

    <!-- Columna 2 -->
    <v-col  cols="12" md="4">
      <v-card title="Gráfico 2" color="grey-darken-2" variant="tonal" height="400px">
        <div class="h-chart" ref="customChart"></div>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import am4themes_dark from "@amcharts/amcharts4/themes/dark";
import { computed, onBeforeMount, onMounted, ref, watch } from "vue";
import { io } from "socket.io-client";
import { useRoute } from "vue-router";
import { useSettingsStore } from "@/stores/settings";

const route = useRoute();
const light = ref(false);
const fan = ref(false);
const luminosity = ref(0);
const settings = useSettingsStore();

const toggleLight = () => {
  //            = !true
  //light.value = false
  // !true = false
  // !false = true
  light.value = !light.value;

  // socket.emit("led", 0);
  socket.emit("led", light.value ? 1 : 0);
}

const toggleFan = () => {
  fan.value = !fan.value;
}

const sliderColor = computed((a, b) => {
  // 0 - 1023
  if (luminosity.value < 250) {
    return 'indigo';
  }

  if (luminosity.value < 500) {
    return 'teal';
  }

  if (luminosity.value < 750) {
    return 'yellow';
  }

  if (luminosity.value < 1000) {
    return 'orange';
  }
  
  return 'red';
});

onBeforeMount(() => {
  socket.connect();

  if (undefined !== localStorage.theme && 'darkMode' === localStorage.theme) {
    am4core.useTheme(am4themes_dark);
  } else {
    am4core.useTheme(am4themes_animated);
  }
});

onMounted(() => {
  socket.emit('inicio', route.params.key);

  initZoomableChart();
  initCustomChart();
  initCustomPictorialChart();
  initGauge();
  initGauge2();

  socket.on('dispositivo', (dispositivo) => {
    console.log('Dispositivo no encontrado');
  });

  socket.on("luminosidad", ({ data }) => {
    luminosity.value = data;
  });
});

const socket = io(`${import.meta.env.VITE_HOST}:${import.meta.env.VITE_WEBSOCKET_PORT}`, {
  autoConnect: false
});

const zoomableChart = ref(null);
const initZoomableChart = () => {
  let chart = am4core.create(zoomableChart.value, am4charts.XYChart);

  socket.on('temperatura', ({date, value}) => {
    console.log('Temperatura: ', value);
    
    chart.addData({date: new Date(date), value: value });

    if (value > 40) {
      fan.value = true;
    } else {
      fan.value = false;
    }
  });

  let dateAxis = chart.xAxes.push(new am4charts.DateAxis());
  dateAxis.renderer.grid.template.location = 0;
  dateAxis.renderer.minGridDistance = 50;

  let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());

  let series = chart.series.push(new am4charts.LineSeries());
  series.dataFields.valueY = "value";
  series.dataFields.dateX = "date";
  series.strokeWidth = 3;
  series.fillOpacity = 0.5;

  chart.scrollbarY = new am4core.Scrollbar();
  chart.scrollbarY.marginLeft = 0;

  chart.cursor = new am4charts.XYCursor();
  chart.cursor.behavior = "zoomY";
  chart.cursor.lineX.disabled = true;
}

const customChart = ref(null);
const initCustomChart = () => {
  let chart = am4core.create(customChart.value, am4charts.XYChart3D);

  socket.on("temperatura", ({ date, value }) => {
    chart.addData({
      // Sat 17 on 2024 T 
      "year": `${new Date(date).getMinutes()}:${new Date(date).getSeconds()}`,
      "income": value,
      "color": chart.colors.next()
    })
  });

  let categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
  categoryAxis.dataFields.category = "year";
  categoryAxis.numberFormatter.numberFormat = "#";
  categoryAxis.renderer.inversed = true;

  let valueAxis = chart.xAxes.push(new am4charts.ValueAxis());

  let series = chart.series.push(new am4charts.ColumnSeries3D());
  series.dataFields.valueX = "income";
  series.dataFields.categoryY = "year";
  series.name = "Income";
  series.columns.template.propertyFields.fill = "color";
  series.columns.template.tooltipText = "{valueX}";
  series.columns.template.column3D.stroke = am4core.color("#fff");
  series.columns.template.column3D.strokeOpacity = 0.2;
}

const customPictorialChart = ref(null);
const initCustomPictorialChart = () => {
  let capacity = 1023;
  let value = 0;
  let circleSize = 0.8;

  let component = am4core.create(customPictorialChart.value, am4core.Container)
  component.width = am4core.percent(100);
  component.height = am4core.percent(100);

  let chartContainer = component.createChild(am4core.Container);
  chartContainer.x = am4core.percent(50)
  chartContainer.y = am4core.percent(50)

  let circle = chartContainer.createChild(am4core.Circle);
  circle.fill = am4core.color("#dadada");

  let circleMask = chartContainer.createChild(am4core.Circle);

  let waves = chartContainer.createChild(am4core.WavedRectangle);
  waves.fill = am4core.color("#34a4eb");
  waves.mask = circleMask;
  waves.horizontalCenter = "middle";
  waves.waveHeight = 10;
  waves.waveLength = 30;
  waves.y = 500;
  circleMask.y = -500;

  component.events.on("maxsizechanged", function(){
    let smallerSize = Math.min(component.pixelWidth, component.pixelHeight);  
    let radius = smallerSize * circleSize / 2;

    circle.radius = radius;
    circleMask.radius = radius;
    waves.height = smallerSize;
    waves.width = Math.max(component.pixelWidth, component.pixelHeight);  

    let labelRadius = radius + 20

    capacityLabel.path = am4core.path.moveTo({x:-labelRadius, y:0}) + am4core.path.arcToPoint({x:labelRadius, y:0}, labelRadius, labelRadius);
    capacityLabel.locationOnPath = 0.5;

    socket.on("luminosidad", ({ data }) => {
      value = data
      setValue(value);
    });
  })


  function setValue(value){
    let y = - circle.radius - waves.waveHeight + (1 - value / capacity) * circle.pixelRadius * 2;
    waves.animate([{property:"y", to:y}, {property:"waveHeight", to:10, from:15}, {property:"x", from:-50, to:0}], 5000, am4core.ease.elasticOut);
    circleMask.animate([{property:"y", to:-y},{property:"x", from:50, to:0}], 5000, am4core.ease.elasticOut);

    let formattedValue = component.numberFormatter.format(value, "#.#a");
    label.text = formattedValue;
  }

  let label = chartContainer.createChild(am4core.Label)
  let formattedValue = component.numberFormatter.format(value, "#.#a");

  label.text = formattedValue;
  label.fill = am4core.color("#607D8B");
  label.fontSize = 30;
  label.horizontalCenter = "middle";

  let capacityLabel = chartContainer.createChild(am4core.Label)

  let formattedCapacity = component.numberFormatter.format(capacity, "#.#a").toUpperCase();;

  capacityLabel.text = `Capacidad: ${capacity}`;
  capacityLabel.fill = am4core.color("#34a4eb");
  capacityLabel.fontSize = 20;
  capacityLabel.textAlign = "middle";
  capacityLabel.padding(0,0,0,0);
}

const gauge = ref(null);
const initGauge = () => {
  var chart = am4core.create(gauge.value, am4charts.GaugeChart);
  chart.innerRadius = am4core.percent(82);

  /**
   * Normal axis
   */

  var axis = chart.xAxes.push(new am4charts.ValueAxis());
  axis.min = 0;
  axis.max = 60;
  axis.strictMinMax = true;
  axis.renderer.radius = am4core.percent(80);
  axis.renderer.inside = true;
  axis.renderer.line.strokeOpacity = 1;
  axis.renderer.ticks.template.disabled = false
  axis.renderer.ticks.template.strokeOpacity = 1;
  axis.renderer.ticks.template.length = 10;
  axis.renderer.grid.template.disabled = true;
  axis.renderer.labels.template.radius = 40;
  axis.renderer.labels.template.adapter.add("text", function(text) {
    return text + "°";
  })

  /**
   * Axis for ranges
   */

  var colorSet = new am4core.ColorSet();

  var axis2 = chart.xAxes.push(new am4charts.ValueAxis());
  axis2.min = 0;
  axis2.max = 60;
  axis2.strictMinMax = true;
  axis2.renderer.labels.template.disabled = true;
  axis2.renderer.ticks.template.disabled = true;
  axis2.renderer.grid.template.disabled = true;

  var range0 = axis2.axisRanges.create();
  range0.value = 0;
  range0.endValue = 50;
  range0.axisFill.fillOpacity = 1;
  range0.axisFill.fill = colorSet.getIndex(0);

  var range1 = axis2.axisRanges.create();
  range1.value = 50;
  range1.endValue = 100;
  range1.axisFill.fillOpacity = 1;
  range1.axisFill.fill = colorSet.getIndex(2);

  /**
   * Label
   */

  var label = chart.radarContainer.createChild(am4core.Label);
  label.isMeasured = false;
  label.fontSize = 45;
  label.x = am4core.percent(50);
  label.y = am4core.percent(100);
  label.horizontalCenter = "middle";
  label.verticalCenter = "bottom";
  label.text = "50%";


  /**
   * Hand
   */

  var hand = chart.hands.push(new am4charts.ClockHand());
  hand.axis = axis2;
  hand.innerRadius = am4core.percent(20);
  hand.startWidth = 10;
  hand.pin.disabled = true;
  hand.value = 0;

  hand.events.on("propertychanged", function(ev) {
    range0.endValue = ev.target.value;
    range1.value = ev.target.value;
    label.text = axis2.positionToValue(hand.currentPosition).toFixed(1);
    axis2.invalidate();
  });

  socket.on("temperatura", ({date, value}) => {
    new am4core.Animation(hand, {
      property: "value",
      to: value
    }, 1000, am4core.ease.cubicOut).start();
  });

}

const gauge2 = ref(null);
const initGauge2 = () => {
  var chart = am4core.create(gauge2.value, am4charts.GaugeChart);
  chart.innerRadius = am4core.percent(82);

  /**
   * Normal axis
   */

  var axis = chart.xAxes.push(new am4charts.ValueAxis());
  axis.min = 0;
  axis.max = 1023;
  axis.strictMinMax = true;
  axis.renderer.radius = am4core.percent(80);
  axis.renderer.inside = true;
  axis.renderer.line.strokeOpacity = 1;
  axis.renderer.ticks.template.disabled = false
  axis.renderer.ticks.template.strokeOpacity = 1;
  axis.renderer.ticks.template.length = 10;
  axis.renderer.grid.template.disabled = true;
  axis.renderer.labels.template.radius = 40;
  axis.renderer.labels.template.adapter.add("text", function(text) {
    return text;
  })

  /**
   * Axis for ranges
   */

  var colorSet = new am4core.ColorSet();

  var axis2 = chart.xAxes.push(new am4charts.ValueAxis());
  axis2.min = 0;
  axis2.max = 1023;
  axis2.strictMinMax = true;
  axis2.renderer.labels.template.disabled = true;
  axis2.renderer.ticks.template.disabled = true;
  axis2.renderer.grid.template.disabled = true;

  var range0 = axis2.axisRanges.create();
  range0.value = 0;
  range0.endValue = 50;
  range0.axisFill.fillOpacity = 1;
  range0.axisFill.fill = colorSet.getIndex(0);

  var range1 = axis2.axisRanges.create();
  range1.value = 50;
  range1.endValue = 1023;
  range1.axisFill.fillOpacity = 1;
  range1.axisFill.fill = colorSet.getIndex(2);

  /**
   * Label
   */

  var label = chart.radarContainer.createChild(am4core.Label);
  label.isMeasured = false;
  label.fontSize = 45;
  label.x = am4core.percent(50);
  label.y = am4core.percent(100);
  label.horizontalCenter = "middle";
  label.verticalCenter = "bottom";
  label.text = "50%";


  /**
   * Hand
   */

  var hand = chart.hands.push(new am4charts.ClockHand());
  hand.axis = axis2;
  hand.innerRadius = am4core.percent(20);
  hand.startWidth = 10;
  hand.pin.disabled = true;
  hand.value = 0;

  hand.events.on("propertychanged", function(ev) {
    range0.endValue = ev.target.value;
    range1.value = ev.target.value;
    label.text = axis2.positionToValue(hand.currentPosition).toFixed(1);
    axis2.invalidate();
  });

  socket.on("luminosidad", ({ data }) => {
    new am4core.Animation(hand, {
      property: "value",
      to: data
    }, 1000, am4core.ease.cubicOut).start();
  });
}

watch(() => settings.getIsDarkMode, (newValue, oldValue) => {
  am4core.disposeAllCharts();
  am4core.unuseAllThemes();

  console.log('Es tema oscuro?: ', settings.getIsDarkMode);

  if (settings.getIsDarkMode) {
    am4core.useTheme(am4themes_dark);
  } else {
    am4core.useTheme(am4themes_animated);
  }

  initZoomableChart();
  initCustomChart();
  initCustomPictorialChart();
  initGauge();
  initGauge2();
});
</script>

<style>
.h-chart {
  height: 320px;
}

.rotate {
  animation-name: rotate;
  animation-duration: 4s;
}

@keyframes rotate {
  0% {
    transform: rotate(0);
  }
  100% {
    transform: rotate(360deg)
  }
}
</style>
