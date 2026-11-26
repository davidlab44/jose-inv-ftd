import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, Subscription } from 'rxjs';
import { TService } from '../../../../services/mnt/t.service';
import { CcoService } from '../../../../services/cc/cco.service';
import { PService } from '../../../../services/p/p.service';
import { CcService } from '../../../../services/cc/cc.service';

interface ActivityRow { item: any; name: string; context: string; }

@Component({ selector: 'app-get', templateUrl: './get.html', styleUrls: ['./get.scss'] })
export class GetPage {
  tList: any[] = [];
  ccoList: any[] = [];
  pList: any[] = [];
  ccList: any[] = [];
  tRows: ActivityRow[] = [];
  pRows: ActivityRow[] = [];
  loading = false;
  error = '';
  private sub?: Subscription;

  constructor(private router: Router, private tService: TService,
    private ccoService: CcoService, private pService: PService,
    private ccService: CcService) {}

  ionViewWillEnter(): void { this.load(); }
  ionViewWillLeave(): void { this.sub?.unsubscribe(); }
  ngOnDestroy(): void { this.sub?.unsubscribe(); }

  load(): void {
    this.sub?.unsubscribe();
    this.loading = true;
    this.error = '';
    this.sub = forkJoin([
      this.tService.getAll(), this.ccoService.getAll(),
      this.pService.getAll(), this.ccService.getAll()
    ]).subscribe({
      next: ([t, cco, p, cc]) => {
        this.tList = t; this.ccoList = cco; this.pList = p; this.ccList = cc;
        const ccos = new Map(this.ccoList.map(x => [String(x.id), x]));
        const ccs = new Map(this.ccList.map(x => [String(x.id), x]));
        this.tRows = this.tList.filter(x => this.assigned(x)).map(item => {
          const cco = ccos.get(String(item.data.id_cco));
          return { item, name: item.data.name || item.data.ats?.data?.name || cco?.data?.name || ('Actividad #' + item.id), context: cco?.data?.name || '' };
        });
        this.pRows = this.pList.filter(x => this.assigned(x)).map(item => {
          const cc = ccs.get(String(item.data.id_cc ?? item.data.id?.cc ?? item.data['id.cc']));
          return { item, name: item.data.name || cc?.data?.name || ('Actividad #' + item.id), context: cc?.data?.name || '' };
        });
        this.loading = false;
      },
      error: err => { console.error('get activities', err); this.error = 'No fue posible cargar las actividades.'; this.loading = false; }
    });
  }
  private assigned(item: any): boolean {
    return Array.isArray(item?.data?.asgn) && item.data.asgn.some((id: any) => id != null && String(id).trim() !== '' && Number.isInteger(Number(id)) && Number(id) > 0);
  }
  trackById(index: number, row: ActivityRow): any { return row.item.id; }
  goToTaskPatch(p: any): void {
    this.router.navigate(['/app/tabs/p-exc-patch'], { state: { item: p, custom: 'prueba' } });
  }
  goToTaskEnd(p: any): void {
    this.router.navigate(['/app/tabs/p-exc-end'], { state: { item: p, custom: 'prueba' } });
  }
}
