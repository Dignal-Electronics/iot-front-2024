<template>
    <v-row>
        <!-- Columna 1 -->
        <v-col cols="12" md="6">
            <v-card color="grey-darken-2" variant="tonal" height="400px">
                <v-card-title class="text-red">Gráfico 1</v-card-title>
                <div class="h-chart" ref="zoomableChart"></div>
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
//   initCustomChart();
//   initCustomPictorialChart();
//   initGauge();
//   initGauge2();

  socket.on('dispositivo', (dispositivo) => {
    console.log('Dispositivo no encontrado');
  });

  socket.on("luminosidad", ({ data }) => {
    luminosity.value = data;
  });
});

// const socket = io(`http://35.222.53.85:${import.meta.env.VITE_WEBSOCKET_PORT}`, {
const socket = io(`http://localhost:${import.meta.env.VITE_WEBSOCKET_PORT}`, {
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
</script>

<style>
.h-chart {
  height: 320px;
}
</style>