import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';   
import { ProductService } from '../../../../services/product.service';   
import { UtilService } from '../../../../services/util.service';   
import { FormBuilder,FormControl,FormGroup,ReactiveFormsModule,Validators} from '@angular/forms';

type AttributeType =
  | 'string'
  | 'number'
  | 'enum'
  | 'array'
  | 'boolean';

interface ProductAttribute {
  type: AttributeType;
  required: boolean;
  //values?: string[];
  semantic_weight?: number;
  desc?: string;
}

interface CategoryDefinition {
  name: string;
  name_es_CO: string;
  desc: string;
  product_template: Record<string, ProductAttribute>;
  //oncreate_product_attributes: Record<string, ProductAttribute>;
  //onupdate_product_attributes?: Record<string, unknown>;
}

@Component({
  selector: 'page-post',
  templateUrl: 'post.html',
  styleUrls: ['./post.scss'],
})

export class AssetSupplyPostPage implements OnInit {

  form!: FormGroup;
  category!: CategoryDefinition;
  categFull:any
  categ:any
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private productService: ProductService,
    private utilService: UtilService,
  ){}

  receiveDataFromRouter(){
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state?.item) {
      this.categFull = navigation.extras.state.item;
      console.log("Item recibidoxi:", this.categFull);
      this.categ = navigation.extras.state.item.data;
      console.log("Item recibidox2:", this.categ);
      this.category = this.categ as CategoryDefinition;
      console.log("Item recibido:", this.category);
    } else {
      // Si recargaron la página, puedes cargar el item desde un servicio o API
      console.warn('No se recibió item por NavigationExtras.state');
    }
    console.log("Item recibidox3h:", this.categ);
  }

  ngOnInit(): void {
    this.receiveDataFromRouter();
    this.buildForm();
  }

  get requiredAttributes(): Array<{
    key: string;
    config: ProductAttribute;
  }> {
    return Object.entries(
      this.category.product_template
    )
      .filter(([_, config]) => config.required)
      .map(([key, config]) => ({
        key,
        config
      }));
  }

  private buildForm(): void {


  if(!Number(this.categFull.ext_id)||Number(this.categFull.ext_id)<1 ){
      console.log ("Categoria No Valida")
      return;
    }
    //this.requiredAttributes.data.categ = [this.categFull.ext_id];
    //delete data.category;


    const controls: Record<string, FormControl> = {};
    for (const { key, config } of this.requiredAttributes) {
      let defaultValue: unknown;
      switch (config.type) {
        case 'array':
          defaultValue = [];
          break;
        case 'number':
          defaultValue = null;
          break;
        case 'boolean':
          defaultValue = false;
          break;
        default:
          defaultValue = '';
      }
      controls[key] = new FormControl(
        defaultValue,
        {
          nonNullable: false,
          validators: config.required
            ? [Validators.required]
            : []
        }
      );
    }
    this.form = this.fb.group(controls);
    this.form.patchValue({
      category:this.categFull.ext_id ?? null
    })
  }
  label(value: string): string {
    return value
      //.replaceAll('_', ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const productAttributes = this.form.getRawValue();
    console.log('Product attributes:', productAttributes);
    this.guardar(productAttributes);
  }

  guardar(prdtAtt:any) {
    const data: any = prdtAtt;
    if(!Number(this.categFull.ext_id)||Number(this.categFull.ext_id)<1 ){
      console.log ("Categoria No Valida")
      return;
    }
    data.categ = [this.categFull.ext_id];
    delete data.category;
    console.log('Product to post =>', data);
    this.productService.post(data).subscribe({
      next: (response) => {
        console.log("product post response", response);
        if(response && response.length>0){
          this.utilService.presentToast('producto creado ,   id:',response[0].id)
          this.productService.getOne(response[0].id).subscribe({
            next:(res)=>{
              console.log('producto creado (res)',res);
              if(res[0].id>0){
                let data=res[0].data;
                data.barcode=res[0].id;
                console.log('data',data)
                //console.log('data.data',data[0].data);
                //console.log('data',data)
                this.productService.patch2(res[0].id,data).subscribe({
                  next:(patchresp)=>{
                    console.log('patched',patchresp);
                  },
                  error:(err)=>console.error('patch_prdt_err',err)
                });
                this.productService.patchField(res[0].id,'ext_id',res[0].id).subscribe({
                  next:res=>console.log('create_prdt',res),
                  error:err=>console.error('create_prdt',err)
                });
                this.productService.patchField(res[0].id,'state','active').subscribe({
                  next:res=>{
                    console.log('create_prdt',res)
                    this.router.navigate(['/app/tabs/asset-supply-readprdct'],{ replaceUrl: true });    
                  },
                  error:err=>console.error('create_prdt',err)
                });
              }
            },
            error:(err)=>console.log('getcreated product ',err)
          })
        }
      }
    });
  }


}
