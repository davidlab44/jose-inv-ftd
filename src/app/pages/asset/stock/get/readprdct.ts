import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

type AttributeType =
  | 'string'
  | 'number'
  | 'enum'
  | 'array'
  | 'boolean';

interface ProductAttribute {
  type: AttributeType;
  required: boolean;
  values?: string[];
  semantic_weight?: number;
  desc?: string;
}

interface CategoryDefinition {
  name: string;
  name_es_CO: string;
  desc: string;

  oncreate_product_attributes: Record<string, ProductAttribute>;

  onupdate_product_attributes?: Record<string, unknown>;
}

@Component({
  selector: 'app-dynamic-product-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './dynamic-product-form.component.html',
  styleUrl: './dynamic-product-form.component.css'
})
export class DynamicProductFormComponent implements OnInit {

  form!: FormGroup;

  /*
   * Hardcoded por ahora.
   *
   * Más adelante esto puede reemplazarse por:
   *
   * this.categoryService.getCategory('welding')
   */
  category: CategoryDefinition = {
    name: 'welding',

    name_es_CO: 'Soldadura',

    desc: 'Welding equipment, electrodes, torches, consumables, parts, components, accessories, and related supplies used for welding, cutting, brazing, fabrication, and maintenance operations.',

    oncreate_product_attributes: {

      application: {
        type: 'enum',
        required: true,
        values: [
          'fabrication',
          'repair',
          'maintenance',
          'structural_welding',
          'pipe_welding',
          'sheet_metal',
          'brazing',
          'cutting',
          'hardfacing',
          'general'
        ],
        semantic_weight: 60,
        desc: 'Main welding or fabrication application.'
      },

      subcategories: {
        type: 'array',
        required: true,
        values: [
          'electrode',
          'welding_wire',
          'filler_rod',
          'torch',
          'nozzle',
          'contact_tip',
          'holder',
          'ground_clamp',
          'regulator',
          'hose',
          'flux',
          'anti_spatter',
          'welding_machine',
          'cutting_consumable',
          'accessory'
        ],
        semantic_weight: 80,
        desc: 'Welding product families.'
      },

      process: {
        type: 'array',
        required: true,
        values: [
          'smaw',
          'gmaw_mig',
          'fcaw',
          'gtaw_tig',
          'saw',
          'oxy_fuel',
          'plasma_cutting',
          'brazing',
          'general'
        ],
        semantic_weight: 90,
        desc: 'Compatible welding or thermal processes.'
      },

      material_compatibility: {
        type: 'array',
        required: false,
        values: [
          'carbon_steel',
          'stainless_steel',
          'aluminum',
          'cast_iron',
          'copper',
          'bronze',
          'nickel_alloy',
          'mixed'
        ],
        semantic_weight: 75,
        desc: 'Base materials intended to be processed.'
      },

      electrode_class: {
        type: 'string',
        required: false,
        semantic_weight: 75,
        desc: 'Electrode, wire or filler classification such as E6013, E7018 or ER70S-6.'
      },

      diameter_mm: {
        type: 'number',
        required: false,
        semantic_weight: 55,
        desc: 'Nominal consumable or component diameter in millimeters.'
      },

      current_a: {
        type: 'number',
        required: false,
        semantic_weight: 50,
        desc: 'Nominal or recommended welding current in amperes.'
      },

      voltage_v: {
        type: 'number',
        required: false,
        semantic_weight: 40,
        desc: 'Nominal operating voltage in volts.'
      },

      polarity: {
        type: 'enum',
        required: false,
        values: [
          'ac',
          'dcen',
          'dcep',
          'ac_dc',
          'not_applicable'
        ],
        semantic_weight: 45,
        desc: 'Recommended welding polarity.'
      },

      gas_type: {
        type: 'array',
        required: false,
        values: [
          'argon',
          'co2',
          'argon_co2',
          'oxygen',
          'acetylene',
          'propane',
          'nitrogen',
          'none'
        ],
        semantic_weight: 55,
        desc: 'Compatible shielding, cutting or fuel gases.'
      },

      certification: {
        type: 'array',
        required: false,
        values: [
          'aws',
          'asme',
          'iso',
          'en',
          'ntc',
          'none'
        ],
        semantic_weight: 50,
        desc: 'Applicable welding standards.'
      },

      cert_value: {
        type: 'array',
        required: false,
        semantic_weight: 50,
        desc: 'Specific certification or classification identifiers.'
      },

      brand: {
        type: 'string',
        required: true,
        semantic_weight: 12,
        desc: 'Brand that manufactures and commercializes the product.'
      }
    }
  };

  constructor(
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.buildForm();
  }

  /**
   * Solo atributos required === true.
   */
  get requiredAttributes(): Array<{
    key: string;
    config: ProductAttribute;
  }> {

    return Object.entries(
      this.category.oncreate_product_attributes
    )
      .filter(([_, config]) => config.required)
      .map(([key, config]) => ({
        key,
        config
      }));
  }

  private buildForm(): void {

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
  }

  /**
   * Convierte:
   *
   * structural_welding
   *
   * en:
   *
   * Structural Welding
   */
  label(value: string): string {

    return value
      .replaceAll('_', ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  }

  submit(): void {

    if (this.form.invalid) {

      this.form.markAllAsTouched();

      return;
    }

    const productAttributes = this.form.getRawValue();

    console.log('Product attributes:', productAttributes);
  }
}
