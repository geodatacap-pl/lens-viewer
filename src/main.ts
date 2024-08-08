import {
  getDetectionData,
  getDetectionsIds,
  getNewestDetection,
} from "./components/api.ts";
import { Timeline } from "./components/timeline.ts";
import { Heatmap } from "./components/heatmap.ts";
import { jsPDF } from "jspdf";

class App {
  private timeline: Timeline;
  private heatmap: Heatmap;
  private startDate: string;
  private endDate: string;
  private device_id: string;
  private threshold: number;
  private data: any[];

  constructor() {
    const timelineCanvas = document.getElementById(
      "timeline",
    ) as HTMLCanvasElement;
    const heatmapCanvas = document.getElementById(
      "heatmap",
    ) as HTMLCanvasElement;
    this.timeline = new Timeline(timelineCanvas);
    this.heatmap = new Heatmap(heatmapCanvas);

    this.startDate = new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000)
      .toISOString()
      .substring(0, 16);
    this.endDate = new Date().toISOString().substring(0, 16);
    this.device_id = "";

    this.threshold = 25;
    this.data = [];

    this.init();
  }

  async init() {
    this.createDateSelectors();
    this.createDownloadHandlers();
    await this.createDeviceSelector();
    this.createThresholdSelector();
    const data = await this.getDeviceDetection();
    await this.updateData(data);
    this.updateView();
  }

  createDateSelectors() {
    const startDate = document.getElementById("start_date") as HTMLInputElement;
    const endDate = document.getElementById("end_date") as HTMLInputElement;

    startDate.onchange = async (e) => {
      this.startDate = (e.target as HTMLInputElement).value;
      await this.updateData();
      this.updateView();
    };

    endDate.onchange = async (e) => {
      this.endDate = (e.target as HTMLInputElement).value;
      await this.updateData();
      this.updateView();
    };

    startDate.value = new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000)
      .toISOString()
      .substring(0, 16);
    endDate.value = new Date().toISOString().substring(0, 16);
  }

  createDownloadHandlers() {
    const pdfButton = document.getElementById("pdf") as HTMLButtonElement;
    pdfButton.onclick = () => {
      const canvases = [this.timeline.getCanvas(), this.heatmap.getCanvas()];
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      canvases.forEach((canvas, index) => {
        if (index > 0) {
          pdf.addPage();
        }
        const imgData = canvas.toDataURL("image/png", 1.0);
        pdf.addImage(imgData, "PNG", 10, 20, 270, 135);
      });

      pdf.save("report.pdf");
    };

    const csvButton = document.getElementById("csv") as HTMLButtonElement;
    csvButton.onclick = () => {
      const csv = this.data
        .filter((d) => parseFloat(d.accuracy) > this.threshold)
        .map((d) => {
          return [
            d.timestamp,
            d.device_id,
            d.detectionclass,
            d.accuracy,
            d.position_x,
            d.position_y,
            d.width,
            d.height,
            d.resolution,
          ];
        });
      const csvHeader = [
        "timestamp",
        "device_id",
        "detectionclass",
        "accuracy",
        "position_x",
        "position_y",
        "width",
        "height",
        "resolution",
      ];
      csv.unshift(csvHeader);

      const csvContent =
        "data:text/csv;charset=utf-8," + csv.map((e) => e.join(",")).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "detection_data.csv");
      document.body.appendChild(link);
      link.click();
    };
  }

  async createDeviceSelector() {
    const data = await getDetectionsIds();
    const ids = data.map((d: any) => d.device_id);

    const dropdown = document.getElementById("device_ids") as HTMLSelectElement;
    dropdown.innerHTML = "";

    ids.forEach((id: string) => {
      const option = document.createElement("option");
      option.value = id;
      option.text = id;
      dropdown.appendChild(option);
    });

    dropdown.onchange = async (e) => {
      this.device_id = (e.target as HTMLSelectElement).value;
      const data = await this.getDeviceDetection();

      await this.updateData(data);
      this.updateView();
    };

    this.device_id = ids[0];
  }

  createThresholdSelector() {
    const threshold = document.getElementById("threshold") as HTMLInputElement;
    threshold.onchange = async (e) => {
      this.threshold = parseFloat((e.target as HTMLInputElement).value);
      this.updateView();
    };

    threshold.value = "25";
  }

  async getDeviceDetection() {
    const data = await getNewestDetection(this.device_id);
    this.startDate = new Date(data[0].timestamp).toISOString().substring(0, 16);
    this.endDate = new Date(data[data.length - 1].timestamp)
      .toISOString()
      .substring(0, 16);
    const startDate = document.getElementById("start_date") as HTMLInputElement;
    const endDate = document.getElementById("end_date") as HTMLInputElement;
    startDate.value = this.startDate;
    endDate.value = this.endDate;
    return data;
  }

  async updateData(data?: any[]) {
    if (!data) {
      data = await getDetectionData(
        this.device_id,
        this.startDate,
        this.endDate,
      );
    }

    if (data === undefined) return;
    this.data = data;
  }

  updateView() {
    const timelineData: any[] = [];
    const heatmapData: any[] = [];

    this.data.forEach((d: any) => {
      // const date = new Date(d.timestamp).toLocaleString();
      const date = new Date(d.timestamp);
      if (parseFloat(d.accuracy) < this.threshold) return;

      timelineData.push({
        date: date,
        accuracy: d.accuracy,
        detectionClass: d.detectionclass,
      });

      heatmapData.push({
        width: d.width,
        height: d.height,
        detectionClass: d.detectionclass,
        x: d.position_x,
        y: d.position_y,
        resolution_x: d.resolution.split("x")[0],
        resolution_y: d.resolution.split("x")[1],
      });
    });

    this.timeline.updateChartData(timelineData);
    this.heatmap.updateHeatmap(heatmapData);
    this.updateStats(timelineData);
  }

  updateStats(data: any[]) {
    const faceFront = data.filter((d) => d.detectionClass === "faceFront");
    const faceSide = data.filter((d) => d.detectionClass === "faceSide");
    const person = data.filter((d) => d.detectionClass === "person");

    const detectionCount = document.getElementById(
      "detection-count",
    ) as HTMLSpanElement;
    const facesFrontCount = document.getElementById(
      "faces-front-count",
    ) as HTMLSpanElement;
    const facesSideCount = document.getElementById(
      "faces-side-count",
    ) as HTMLSpanElement;
    const personCount = document.getElementById(
      "person-count",
    ) as HTMLSpanElement;
    const personToFaces = document.getElementById(
      "person-faces-ratio",
    ) as HTMLSpanElement;

    detectionCount.innerText = data.length.toString();
    facesFrontCount.innerText = faceFront.length.toString();
    facesSideCount.innerText = faceSide.length.toString();
    personCount.innerText = person.length.toString();
    personToFaces.innerText = (faceFront.length / person.length)
      .toFixed(2)
      .toString();
  }
}

new App();
