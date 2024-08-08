import * as THREE from "three";
import {
  Color,
  EdgesGeometry,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  Scene,
  WebGLRenderer,
} from "three";

export class Heatmap {
  private canvas: HTMLCanvasElement;
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private renderer: WebGLRenderer;
  private planes: Group;
  private faceFrontMaterial: MeshBasicMaterial;
  private faceSideMaterial: MeshBasicMaterial;
  private personMaterial: MeshBasicMaterial;
  private faceFrontMaterialOpaque: LineBasicMaterial;
  private faceSideMaterialOpaque: LineBasicMaterial;
  private personMaterialOpaque: LineBasicMaterial;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.renderer = new WebGLRenderer({ canvas: this.canvas, alpha: true, preserveDrawingBuffer: true });
    this.renderer.setClearColor(new Color(0x000000), 0);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);

    this.scene = new Scene();
    this.camera = this.createCamera();

    this.faceFrontMaterial = new MeshBasicMaterial({
      transparent: true,
      opacity: 0.1,
      color: 0x71ff1f,
    });
    this.faceFrontMaterialOpaque = new LineBasicMaterial({
      color: 0x71ff1f,
      transparent: true,
      opacity: 0.5,
    });
    this.faceSideMaterial = new MeshBasicMaterial({
      transparent: true,
      opacity: 0.1,
      color: 0xff2955,
    });
    this.faceSideMaterialOpaque = new LineBasicMaterial({
      transparent: true,
      opacity: 0.5,
      color: 0xff2955,
    });
    this.personMaterial = new MeshBasicMaterial({
      transparent: true,
      opacity: 0.1,
      color: 0x639aff,
    });
    this.personMaterialOpaque = new LineBasicMaterial({
      color: 0x639aff,
      transparent: true,
      opacity: 0.25,
    });

    this.planes = new Group();
    this.scene.add(this.planes);
    this.createTitle();
    this.render();
  }

  getCanvas() {
    return this.canvas;
  }

  createTitle() {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;

    canvas.width = 512; // Adjust as needed
    canvas.height = 256; // Adjust as needed

    context.font = "100px sans-serif"; // Customize your font
    context.fillStyle = "white"; // Text color
    context.fillText("Heatmap", 50, 150); // Text content and position

    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true; // Important for dynamic text updates

    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      alphaTest: 0.5,
    });

    const geometry = new THREE.PlaneGeometry(100, 50); // Adjust size as needed
    const plane = new THREE.Mesh(geometry, material);
    plane.position.set(
      -this.canvas.clientWidth / 2 + 50,
      this.canvas.clientHeight / 2 - 15,
      1,
    ); // Adjust position as needed
    this.scene.add(plane);
  }

  createCamera() {
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    const camera = new THREE.OrthographicCamera(
      width / -2,
      width / 2,
      height / 2,
      height / -2,
      0.1,
      1000,
    );
    camera.position.z = 10;

    this.scene.add(camera);
    return camera;
  }

  createPlane(width: number, height: number, material: MeshBasicMaterial) {
    const planeGeometry = new PlaneGeometry(width, height);
    return new Mesh(planeGeometry, material);
  }

  createHeatmapElement(
    d: any,
    material: MeshBasicMaterial,
    materialOpaque: LineBasicMaterial,
  ) {
    const xfactor = this.canvas.clientWidth / d.resolution_x;
    const yfactor = this.canvas.clientHeight / d.resolution_y;
    const plane = this.createPlane(
      d.width * xfactor,
      d.height * yfactor,
      material,
    );
    plane.position.set(
      (d.x - d.resolution_x / 2) * xfactor,
      (d.y - d.resolution_y / 2) * -1 * yfactor,
      0,
    );

    const edges = new EdgesGeometry(plane.geometry);
    const line = new LineSegments(edges, materialOpaque);
    line.position.set(
      (d.x - d.resolution_x / 2) * xfactor,
      (d.y - d.resolution_y / 2) * -1 * yfactor,
      0.1,
    );

    plane.material = material;

    this.planes.add(line);
    this.planes.add(plane);
  }

  updateHeatmap(heatmapData: any[]) {
    while (this.planes.children.length > 0) {
      this.planes.remove(this.planes.children[0]);
    }

    const faceFrontData = heatmapData.filter(
      (d) => d.detectionClass === "faceFront",
    );
    const faceSideData = heatmapData.filter(
      (d) => d.detectionClass === "faceSide",
    );
    const personData = heatmapData.filter((d) => d.detectionClass === "person");

    this.faceFrontMaterial.opacity = 2 / Math.max(40, faceFrontData.length || 1);
    this.faceSideMaterial.opacity = 2 / Math.max(40, faceSideData.length || 1);
    this.personMaterial.opacity = 2 / Math.max(40, personData.length || 1);

    faceFrontData.forEach((d: any) =>
      this.createHeatmapElement(
        d,
        this.faceFrontMaterial,
        this.faceFrontMaterialOpaque,
      ),
    );
    faceSideData.forEach((d: any) =>
      this.createHeatmapElement(
        d,
        this.faceSideMaterial,
        this.faceSideMaterialOpaque,
      ),
    );
    personData.forEach((d: any) =>
      this.createHeatmapElement(
        d,
        this.personMaterial,
        this.personMaterialOpaque,
      ),
    );

    this.render();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
