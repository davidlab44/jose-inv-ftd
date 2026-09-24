import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ModalController, ToastController, Config, IonSearchbar } from '@ionic/angular';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ConferenceData } from '../../../../providers/conference-data';
import { UserData } from '../../../../providers/user-data';
import { Session } from '../../../../interfaces/session';
import { UtilService } from '../../../../services/util.service';
import { ProductService } from '../../../../services/product.service';
import { CategoryService } from '../../../../services/category.service';
import { UmService } from '../../../../services/um.service';
@Component({
  selector: 'page-readprd',
  templateUrl: 'readprd.html',
  styleUrls: ['./readprd.scss']
})
export class ReadprdPage {
  @ViewChild('searchbar', { static: false }) searchbar!: IonSearchbar;
  showSearchbar: boolean;
  filteredCategories: any[] = [];
  categories: any[] = [];
  ums: any[] = [];
  searchSubject = new Subject<string>();
  storedObject: any;
  queryText: any;
  activeSession: Session | null = null;
  sessionId: number | null = null;
  filteredProductsByCategory: any[] = [];
  hash: string = '';
  constructor(
    public alertCtrl: AlertController,
    public confData: ConferenceData,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    public router: Router,
    public toastCtrl: ToastController,
    public user: UserData,
    private modalController: ModalController,
    public config: Config,
    private utilService: UtilService,
    private productService: ProductService,
    private categoryService: CategoryService,
    private umService: UmService,
  ) {}
  ngOnInit() {
    this.loadCategories();
    this.loadUms();
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe({
      next: text => {
        this.filteredCategories = this.applyFilter(text);
      },
      error: err => console.error('Error en búsqueda:', err)
    });
  }
  loadCategories() {
    this.categoryService.getAllCategories().subscribe({
      next: r => {
        this.categories = r;
        this.filteredCategories = r;
        this.categoryService.saveCategoriesToLocal(r);
        console.log('categories', r);
      },
      error: e => {
        console.error('Error categorías:', e);
        this.categories = this.categoryService.getCategoriesFromLocal();
        this.filteredCategories = this.categories;
      }
    });
  }
  loadUms() {
    this.umService.getAllUms().subscribe({
      next: r => {
        this.ums = r;
      },
      error: e => {
        console.error('Error UMs:', e);
        this.ums = this.umService.getUmsFromLocal();
      }
    });
  }
  onSearch(text: string) {
    console.log('search subject', text);
    this.searchSubject.next(text);
  }
  applyFilter(text: string): any[] {
    console.log('hash', text);
    if (!text || text.trim() === '') {
      return this.categories;
    }
    const search = text.trim().toLowerCase();
    const filtered = this.categories.filter(item => {
      const name = (item?.data?.name_es_CO || '').toLowerCase();
      return name.includes(search);
    });
    console.log('filteredCategories', filtered);
    return filtered;
  }
  goToNewProduct(item: any) {
    console.log('item:', item);
    this.router.navigate(
      ['/app/tabs/asset-stock-post'],
      { state: { item: item } }
    );
  }
}

