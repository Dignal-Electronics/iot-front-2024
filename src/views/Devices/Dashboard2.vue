<template>
    <v-row>
        <!-- Columna 1 -->
        <v-col cols="12" md="6">
            <v-card color="grey-darken-2" variant="tonal" height="400px">
                <v-card-title class="text-red">Gráfico 1</v-card-title>
                <div class="h-chart" ref="zoomableChart"></div>
            </v-card>
        </v-col>

        <!-- humedad -->
        <v-col cols="12" md="2">
          <v-card title="Humedad" color="grey-darken-2" variant="tonal" class="h-100">
            <v-card-text class="h-100">
              <v-row class="h-100 align-center">
                <v-col class="text-center">
                  <span class="text-h3 font-weight-light text-cyan-accent-3">{{ humedad.valor }} %</span>
                  <p class="font-weight-light" v-if="humedad.fecha !== null">
                    Última actualización: {{ new Date(humedad.fecha).toLocaleDateString() }}
                  </p>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- temperatura -->
        <v-col cols="12" md="2">
          <v-card title="Temperatura" color="grey-darken-2" variant="tonal" class="h-100">
            <v-card-text class="h-100">
              <v-row class="h-100 align-center">
                <v-col class="text-center">
                  <span class="text-h3 font-weight-light text-light-green">{{ temperatura.valor }} °C</span>
                  <p class="font-weight-light" v-if="temperatura.fecha !== null">
                    Última actualización: {{ new Date(temperatura.fecha).toLocaleDateString() }}
                  </p>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- presión -->
        <v-col cols="12" md="2">
          <v-card title="Presión" color="grey-darken-2" variant="tonal" class="h-100">
            <v-card-text class="h-100">
              <v-row class="h-100 align-center">
                <v-col class="text-center">
                  <span class="text-h3 font-weight-light text-purple-accent-3">{{ presion.valor }} hPa</span>
                  <p class="font-weight-light" v-if="presion.fecha !== null">
                    Última actualización: {{ new Date(presion.fecha).toLocaleDateString() }}
                  </p>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="3">
          <v-card title="Presión" color="grey-darken-2" variant="tonal" height="400px">
            <div class="h-chart" ref="gauge2"></div>
          </v-card>
        </v-col>

        <v-col cols="12" md="3">
          <v-card title="Temperatura" color="grey-darken-2" variant="tonal" height="400px">
            <div class="h-chart" ref="gauge"></div>
          </v-card>
        </v-col>

        <!-- Led -->
        <v-col cols="12" md="3">
          <v-card color="grey-darken-2" variant="tonal" class="h-100">
            <v-card-title class="text-center">Led</v-card-title>
            <v-card-text class="h-100 text-center">
              <!-- v-row>v-col>v-btn -> me genera las etiquetas de ambos elementos. -->
              <v-row class="h-100" align="center">
                <v-col>
                  <v-btn
                    size="170"
                    :color="light ? 'yellow' : 'blue-grey'"
                    :icon="light ? 'mdi-lightbulb-on' : 'mdi-lightbulb-outline'"
                    @click="toggleLight()"
                  ></v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="3">
          <v-card title="Humedad" color="grey-darken-2" variant="tonal" height="400px">
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
const settings = useSettingsStore();

const humedad = ref({
  valor: 0,
  fecha: null
});
const temperatura = ref({
  valor: 0,
  fecha: null
});
const presion = ref({
  valor: 0,
  fecha: null
});

const toggleLight = () => {
  //            = !true
  //light.value = false
  // !true = false
  // !false = true
  light.value = !light.value;

  // socket.emit("led", 0);
  socket.emit("led", light.value ? 1 : 0);
}


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
  initGauge();
  initGauge2();
  initCustomChart();

  socket.on('dispositivo', (dispositivo) => {
    console.log('Dispositivo no encontrado');
  });

  socket.on("humedad", ({ date, value }) => {
    console.log('humedad: ', value);
    
    humedad.value.fecha = date;
    humedad.value.valor = value;
  });

  socket.on("presion", ({ date, value }) => {
    console.log('presion: ', value);
    
    presion.value.fecha = date;
    presion.value.valor = value;
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

    temperatura.value.valor = value;
    temperatura.value.fecha = date;
    
    chart.addData({date: new Date(date), value: value });
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

const gauge = ref(null);
const initGauge = () => {
  var chart = am4core.create(gauge.value, am4charts.GaugeChart);
  chart.innerRadius = am4core.percent(82);

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

  var label = chart.radarContainer.createChild(am4core.Label);
  label.isMeasured = false;
  label.fontSize = 45;
  label.x = am4core.percent(50);
  label.y = am4core.percent(100);
  label.horizontalCenter = "middle";
  label.verticalCenter = "bottom";
  label.text = "50%";

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

    console.log('Gauge temperatura');
    
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

  var label = chart.radarContainer.createChild(am4core.Label);
  label.isMeasured = false;
  label.fontSize = 45;
  label.x = am4core.percent(50);
  label.y = am4core.percent(100);
  label.horizontalCenter = "middle";
  label.verticalCenter = "bottom";
  label.text = "50%";

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

  socket.on("presion", ({ date, value }) => {
    new am4core.Animation(hand, {
      property: "value",
      to: value
    }, 1000, am4core.ease.cubicOut).start();
  });
}

const customChart = ref(null);
const initCustomChart = () => {
  let chart = am4core.create(customChart.value, am4charts.XYChart3D);

  socket.on("humedad", ({ date, value }) => {
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
</script>

<style>
.h-chart {
  height: 320px;
}
</style>