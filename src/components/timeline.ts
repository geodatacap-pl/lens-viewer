import { Chart, ChartType, registerables } from "chart.js";

Chart.register(...registerables);
import "chartjs-adapter-moment";

export class Timeline {
  private ctx: CanvasRenderingContext2D;
  private accuracyChart: Chart<ChartType, { x: string; y: number }[], unknown>;
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    this.canvas = canvas;
    this.accuracyChart = this.createLineChart();
  }

  getCanvas() {
    return this.canvas;
  }

  createLineChart() {
    return new Chart(this.ctx, {
      type: "line",
      data: {
        datasets: [
          {
            label: "Face front accuracy",
            data: [{ x: "", y: 0 }],
            backgroundColor: ["rgba(113,255,31,0.2)"],
            borderColor: ["rgb(113,255,31)"],
             borderWidth: 0.35,
            tension: 0.2,
            pointHoverRadius: 10,
            pointBackgroundColor: "rgba(113,255,31,0.8)",
            showLine: true,
          },
          {
            label: "Average",
            data: [{ x: "", y: 0 }],
            backgroundColor: ["rgba(113,255,31,0.2)"],
            borderColor: ["rgba(113,255,31,0.66)"],
            borderWidth: 4,
            showLine: true,
          },
          {
            label: "Face side accuracy",
            data: [{ x: "", y: 0 }],
            backgroundColor: ["rgba(255, 41, 85, 0.2)"],
            borderColor: ["rgb(255,41,85)"],
            tension: 0.2,
            borderWidth: 0.35,
            pointHoverRadius: 10,
            pointBackgroundColor: "rgba(255, 41, 85, 0.8)",
            showLine: true,
          },
          {
            label: "Average",
            data: [{ x: "", y: 0 }],
            backgroundColor: ["rgba(255, 41, 85, 0.2)"],
            borderColor: ["rgba(255,41,85,0.66)"],
            borderWidth: 4,
            showLine: true,
          },
          {
            label: "Person accuracy",
            data: [{ x: "", y: 0 }],
            backgroundColor: ["rgba(99,154,255,0.2)"],
            borderColor: ["rgb(99,154,255)"],
            borderWidth: 0.35,
            tension: 0.2,
            pointHoverRadius: 10,
            pointBackgroundColor: "rgba(99,154,255,0.8)",
            showLine: true,
          },
          {
            label: "Average",
            data: [{ x: "", y: 0 }],
            backgroundColor: ["rgba(99,154,255,0.2)"],
            borderColor: ["rgba(99,154,255,0.66)"],
            borderWidth: 4,
            showLine: true,
          },
        ],
      },
      options: {

        plugins: {
          title: {
            align: "start",
            display: true,
            text: "Detection accuracy",
          },
        },
        scales: {
          x: {
            type: "time",
          },
          y: {
            min: 0,
            max: 100,
          },
        },
      },
    });
  }

  updateChartData(timelineData: any[]) {
    if (timelineData.length === 0) {
      this.accuracyChart.data.datasets[0].data = [{ x: "", y: 0 }];
      this.accuracyChart.data.datasets[1].data = [{ x: "", y: 0 }];
      this.accuracyChart.data.datasets[2].data = [{ x: "", y: 0 }];
      this.accuracyChart.data.datasets[3].data = [{ x: "", y: 0 }];
      this.accuracyChart.data.datasets[4].data = [{ x: "", y: 0 }];
      this.accuracyChart.data.datasets[5].data = [{ x: "", y: 0 }];
      return this.accuracyChart.update();
    }

    const faceFront = timelineData.filter(
      (d) => d.detectionClass === "faceFront",
    );
    const faceFrontData = faceFront.map((d) => ({ x: d.date, y: d.accuracy }));
    const faceFrontAvg =
      faceFront.reduce((acc, d) => acc + parseFloat(d.accuracy), 0) /
      faceFront.length;
    const faceFrontAvgData = faceFrontData.length > 0 ? [
      { x: faceFront[0].date, y: faceFrontAvg },
      { x: faceFront[faceFront.length - 1].date, y: faceFrontAvg },
    ] : []

    const faceSide = timelineData.filter(
      (d) => d.detectionClass === "faceSide",
    );
    const faceSideData = faceSide.map((d) => ({ x: d.date, y: d.accuracy }));
    const faceSideAvg =
      faceSide.reduce((acc, d) => acc + parseFloat(d.accuracy), 0) /
      faceSide.length;
    const faceSideAvgData = faceSideData.length > 0 ? [
      { x: faceSide[0].date, y: faceSideAvg },
      { x: faceSide[faceSide.length - 1].date, y: faceSideAvg },
    ] : [];

    const person = timelineData.filter((d) => d.detectionClass === "person");
    const personData = person.map((d) => ({ x: d.date, y: d.accuracy }));
    const personAvg =
      person.reduce((acc, d) => acc + parseFloat(d.accuracy), 0) /
      person.length;
    const personAvgData = personData.length > 0 ? [
      { x: person[0].date, y: personAvg },
      { x: person[person.length - 1].date, y: personAvg },
    ] : [];

    this.accuracyChart.data.datasets[0].data = faceFrontData;
    this.accuracyChart.data.datasets[1].data = faceFrontAvgData;
    this.accuracyChart.data.datasets[2].data = faceSideData;
    this.accuracyChart.data.datasets[3].data = faceSideAvgData;
    this.accuracyChart.data.datasets[4].data = personData;
    this.accuracyChart.data.datasets[5].data = personAvgData;
    this.accuracyChart.update();
  }
}
