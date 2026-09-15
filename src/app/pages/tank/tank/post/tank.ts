import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import * as THREE from 'three';

interface TankZone {
  id: string;
  side: number;
  area: number;
  selected: boolean;
  mesh: THREE.Mesh;
}

@Component({
  selector: 'app-tank',
  templateUrl: './tank.html',
  styleUrls: ['./tank.scss']
})
export class TankPage implements AfterViewInit, OnDestroy {
  @ViewChild('rendererContainer', { static: false }) rendererContainer!: ElementRef<HTMLDivElement>;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private tankGroup = new THREE.Group();
  private zonesGroup = new THREE.Group();
  private animationId = 0;
  private dragging = false;
  private previousX = 0;
  private previousY = 0;

  readonly tankLength = 6.00;
  readonly tankRadius = 1.13;
  readonly tankDiameter = 2.26;
  readonly circumference = 7.13;
  readonly longitudinalDivisions = 12;

  zones: TankZone[] = [];
  selectedZones: TankZone[] = [];
  intervention = 'anticorrosive_paint';
  note = '';

  ngAfterViewInit() {
    this.initThree();
    this.createTank();
    this.createShellZones();
    this.createHeadZones();
    this.createLabels();
    this.animate();
    window.addEventListener('resize', this.onResize);
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animationId);
    window.removeEventListener('resize', this.onResize);
    this.renderer?.dispose();
  }

  private initThree() {
    const el = this.rendererContainer.nativeElement;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf4f5f8);
    this.camera = new THREE.PerspectiveCamera(45, el.clientWidth / el.clientHeight, 0.1, 100);
    this.camera.position.set(7.8, 4.2, 8.2);
    this.camera.lookAt(0, 0, 0);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(el.clientWidth, el.clientHeight);
    el.appendChild(this.renderer.domElement);

    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x777777, 1.8));
    const light = new THREE.DirectionalLight(0xffffff, 2.2);
    light.position.set(6, 8, 7);
    this.scene.add(light);

    const grid = new THREE.GridHelper(12, 12, 0x777777, 0xd8d8d8);
    grid.position.y = -1.7;
    this.scene.add(grid);
    this.scene.add(this.tankGroup);
    this.scene.add(this.zonesGroup);
  }

  private createTank() {
    const material = new THREE.MeshStandardMaterial({
      color: 0xdde3e8,
      metalness: 0.42,
      roughness: 0.5
    });

    const shell = new THREE.Mesh(
      new THREE.CylinderGeometry(this.tankRadius, this.tankRadius, this.tankLength, 64, 1, true),
      material
    );
    shell.rotation.z = Math.PI / 2;
    this.tankGroup.add(shell);

    // Cabezas curvas tipo elipsoidal aproximadas.
    const headGeometry = new THREE.SphereGeometry(
      this.tankRadius, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2
    );

    const head1 = new THREE.Mesh(headGeometry, material);
    head1.rotation.z = -Math.PI / 2;
    head1.scale.set(0.48, 1, 1);
    head1.position.x = -this.tankLength / 2;
    this.tankGroup.add(head1);

    const head3 = new THREE.Mesh(headGeometry.clone(), material);
    head3.rotation.z = Math.PI / 2;
    head3.scale.set(0.48, 1, 1);
    head3.position.x = this.tankLength / 2;
    this.tankGroup.add(head3);

    const ringMaterial = new THREE.MeshStandardMaterial({
      color: 0x747b82,
      metalness: 0.6,
      roughness: 0.35
    });

    [-this.tankLength / 2, this.tankLength / 2].forEach(x => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(this.tankRadius + 0.012, 0.025, 10, 64),
        ringMaterial
      );
      ring.rotation.y = Math.PI / 2;
      ring.position.x = x;
      this.tankGroup.add(ring);
    });
  }

  private createShellZones() {
    const dx = this.tankLength / this.longitudinalDivisions;
    const arc = this.circumference / 4;
    const area = dx * arc;

    for (let column = 0; column < this.longitudinalDivisions; column++) {
      for (let quadrant = 0; quadrant < 4; quadrant++) {
        const theta1 = quadrant * Math.PI / 2;
        const theta2 = (quadrant + 1) * Math.PI / 2;
        const x1 = -this.tankLength / 2 + column * dx;
        const x2 = x1 + dx;
        const geometry = this.createCylinderPatch(
          x1, x2, theta1, theta2, this.tankRadius + 0.012
        );
        const material = new THREE.MeshBasicMaterial({
          color: 0xffff00,
          transparent: true,
          opacity: 0,
          side: THREE.DoubleSide,
          depthWrite: false
        });
        const mesh = new THREE.Mesh(geometry, material);
        const side = this.sideFromAngle((theta1 + theta2) / 2);
        const zone: TankZone = {
          id: `L${side}-${String(column + 1).padStart(2, '0')}`,
          side,
          area,
          selected: false,
          mesh
        };
        mesh.userData['zone'] = zone;
        this.zones.push(zone);
        this.zonesGroup.add(mesh);
      }
    }
  }

  private createHeadZones() {
    [-1, 1].forEach(sign => {
      const side = sign < 0 ? 1 : 3;
      const geometry = new THREE.CircleGeometry(this.tankRadius * 0.96, 64);
      const material = new THREE.MeshBasicMaterial({
        color: 0xffff00,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.y = Math.PI / 2;
      mesh.position.x = sign * (this.tankLength / 2 + this.tankRadius * 0.49);
      const zone: TankZone = {
        id: `L${side}-01`,
        side,
        area: Math.PI * this.tankRadius * this.tankRadius,
        selected: false,
        mesh
      };
      mesh.userData['zone'] = zone;
      this.zones.push(zone);
      this.zonesGroup.add(mesh);
    });
  }

  private createCylinderPatch(
    x1: number, x2: number, theta1: number, theta2: number, radius: number
  ): THREE.BufferGeometry {
    const segments = 10;
    const vertices: number[] = [];
    const indices: number[] = [];

    for (let i = 0; i <= segments; i++) {
      const theta = theta1 + (theta2 - theta1) * i / segments;
      vertices.push(
        x1, Math.cos(theta) * radius, Math.sin(theta) * radius,
        x2, Math.cos(theta) * radius, Math.sin(theta) * radius
      );
      if (i < segments) {
        const a = i * 2;
        indices.push(a, a + 1, a + 3, a, a + 3, a + 2);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
  }

  private sideFromAngle(theta: number): number {
    const y = Math.cos(theta);
    const z = Math.sin(theta);
    if (Math.abs(y) >= Math.abs(z)) return y >= 0 ? 6 : 5;
    return z >= 0 ? 2 : 4;
  }

  private createLabels() {
    this.addLabel('1', -4.0, 0, 0);
    this.addLabel('3', 4.0, 0, 0);
    this.addLabel('6', 0, 1.55, 0);
    this.addLabel('5', 0, -1.55, 0);
    this.addLabel('2', 0, 0, 1.55);
    this.addLabel('4', 0, 0, -1.55);
  }

  private addLabel(text: string, x: number, y: number, z: number) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'rgba(20,20,20,.80)';
    ctx.beginPath();
    ctx.arc(64, 64, 42, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 58px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 64, 66);

    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: new THREE.CanvasTexture(canvas),
        transparent: true,
        depthTest: false
      })
    );
    sprite.position.set(x, y, z);
    sprite.scale.set(0.48, 0.48, 0.48);
    sprite.renderOrder = 100;
    this.tankGroup.add(sprite);
  }

  onCanvasClick(event: MouseEvent) {
    if (this.dragging) return;

    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const hit = this.raycaster.intersectObjects(this.zonesGroup.children, false)[0];
    if (!hit) return;

    const zone = hit.object.userData['zone'] as TankZone;
    zone.selected = !zone.selected;
    (zone.mesh.material as THREE.MeshBasicMaterial).opacity = zone.selected ? 0.62 : 0;
    this.selectedZones = this.zones.filter(z => z.selected);
  }

  pointerDown(event: PointerEvent) {
    this.dragging = false;
    this.previousX = event.clientX;
    this.previousY = event.clientY;
  }

  pointerMove(event: PointerEvent) {
    if (!(event.buttons & 1)) return;

    const dx = event.clientX - this.previousX;
    const dy = event.clientY - this.previousY;
    if (Math.abs(dx) + Math.abs(dy) > 2) this.dragging = true;

    this.tankGroup.rotation.y += dx * 0.008;
    this.zonesGroup.rotation.y = this.tankGroup.rotation.y;
    this.tankGroup.rotation.x += dy * 0.004;
    this.zonesGroup.rotation.x = this.tankGroup.rotation.x;

    this.previousX = event.clientX;
    this.previousY = event.clientY;
  }

  clearSelection() {
    this.zones.forEach(zone => {
      zone.selected = false;
      (zone.mesh.material as THREE.MeshBasicMaterial).opacity = 0;
    });
    this.selectedZones = [];
    this.note = '';
  }

  saveIntervention() {
    if (!this.selectedZones.length) return;

    const payload = {
      asset_type: 'isotank',
      component: 'tank',
      dimensions: {
        length_m: this.tankLength,
        radius_m: this.tankRadius,
        diameter_m: this.tankDiameter,
        circumference_m: this.circumference
      },
      intervention: this.intervention,
      area_m2: Number(this.totalArea.toFixed(3)),
      sides: this.selectedSides,
      zones: this.selectedZones.map(zone => ({
        id: zone.id,
        side: zone.side,
        area_m2: Number(zone.area.toFixed(3))
      })),
      note: this.note,
      status: 'pending'
    };

    console.log('[WORK ORDER]', payload);
    alert(
      `Work Order lista para backend\nÁrea: ${this.totalArea.toFixed(2)} m²\nLados: ${this.selectedSides.join(', ')}`
    );
  }

  get totalArea(): number {
    return this.selectedZones.reduce((sum, zone) => sum + zone.area, 0);
  }

  get selectedSides(): number[] {
    return Array.from(new Set(this.selectedZones.map(zone => zone.side))).sort((a, b) => a - b);
  }

  get selectedZoneNames(): string {
    const names = this.selectedZones.slice(0, 10).map(zone => zone.id).join(', ');
    return this.selectedZones.length > 10 ? `${names}...` : names;
  }

  private animate = () => {
    this.animationId = requestAnimationFrame(this.animate);
    this.renderer.render(this.scene, this.camera);
  };

  private onResize = () => {
    if (!this.rendererContainer || !this.renderer) return;
    const el = this.rendererContainer.nativeElement;
    this.camera.aspect = el.clientWidth / el.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(el.clientWidth, el.clientHeight);
  };
}
