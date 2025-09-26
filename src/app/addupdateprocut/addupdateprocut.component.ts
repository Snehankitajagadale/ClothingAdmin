import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { AdminService } from '../admin.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-addupdateprocut',
  templateUrl: './addupdateprocut.component.html',
  styleUrls: ['./addupdateprocut.component.css']
})
export class AddupdateprocutComponent implements OnInit {
  productForm!: FormGroup;
  isEdit = false;
  productId!: any;
  subcategories: any[] = [];

  // track items for deletion
  sizesToDelete: number[] = [];
  colorsToDelete: number[] = [];
isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private adminService: AdminService,
    private router: Router
  ) { }

  ngOnInit() {
    this.buildForm();

    this.adminService.getAllSubcategories().subscribe(res => {
      if (res.status) {
        this.subcategories = res.response;
      }
    });

    this.productId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.productId) {
      this.isEdit = true;
      this.loadProduct(this.productId);
    } else {
      this.addTechnicalSpec();
      this.addOtherSpec();
    }
  }

 buildForm() {
  this.productForm = this.fb.group({
    sub_category_id: ['', Validators.required],
    brand: ['', this.isEdit ? [] : [Validators.required]],
    model: ['', this.isEdit ? [] : [Validators.required]],
    about: ['', this.isEdit ? [] : [Validators.required]],
    minimum_quantity_wholesale: [null, this.isEdit ? [] : [Validators.required, Validators.min(1)]],

    technical_specifications: this.fb.array([],
      this.isEdit ? [] : [Validators.required, Validators.minLength(1)]),
    other_specifications: this.fb.array([],
      this.isEdit ? [] : [Validators.required, Validators.minLength(1)]),

    size_detail: this.fb.array([],
      this.isEdit ? [] : [Validators.required, Validators.minLength(1)]),
    color_detail: this.fb.array([],
      this.isEdit ? [] : [Validators.required, Validators.minLength(1)])
  });
}


  get sizeDetail(): FormArray {
    return this.productForm.get('size_detail') as FormArray;
  }

  get colorDetail(): FormArray {
    return this.productForm.get('color_detail') as FormArray;
  }

  addSize(id: any | null = null, description = '', price: number | null = null, wholesale_price: number | null = null) {
    this.sizeDetail.push(
      this.fb.group({
        size_detail_id: [id],
        description: [description],
        price: [price, [ Validators.min(1)]],
        wholesale_price: [wholesale_price, [Validators.min(1)]]
      })
    );
  }

  removeSize(index: number) {
    const sizeGroup = this.sizeDetail.at(index);
    const sizeId = sizeGroup.get('size_detail_id')?.value;

    if (sizeId) {
      this.sizesToDelete.push(sizeId); // mark for deletion
    }

    this.sizeDetail.removeAt(index);
  }

  get technicalSpecifications(): FormArray {
    return this.productForm.get('technical_specifications') as FormArray;
  }

  get otherSpecifications(): FormArray {
    return this.productForm.get('other_specifications') as FormArray;
  }

  addTechnicalSpec(key: string = '', value: string = '') {
    this.technicalSpecifications.push(
      this.fb.group({
        key: [key],
        value: [value]
      })
    );
  }

  removeTechnicalSpec(index: number) {
    this.technicalSpecifications.removeAt(index);

    // If no entries left, add a default null entry
    if (this.technicalSpecifications.length === 0) {
      this.technicalSpecifications.push(
        this.fb.group({
          key: [null],
          value: [null]
        })
      );
    }
  }

  addOtherSpec(key: string = '', value: string = '') {
    this.otherSpecifications.push(
      this.fb.group({
        key: [key],
        value: [value]
      })
    );
  }

 removeOtherSpec(index: number) {
  this.otherSpecifications.removeAt(index);

  // If no entries left, add a default null entry
  if (this.otherSpecifications.length === 0) {
    this.otherSpecifications.push(
      this.fb.group({
        key: [null],
        value: [null]
      })
    );
  }
}


  addColor(id: any | null = null, color_name = '', extra_amount: number | null = null, images: File[] = []) {
    this.colorDetail.push(
      this.fb.group({
        color_detail_id: [id],
        color_name: [color_name],
        extra_amount: [extra_amount, [Validators.min(0)]],
        images: [images],
        previewImages: [[]],
        existingFileNames: [[]]
      })
    );
  }

  removeColor(index: number) {
    const colorGroup = this.colorDetail.at(index);
    const colorId = colorGroup.get('color_detail_id')?.value;

    if (colorId) {
      this.colorsToDelete.push(colorId); // mark for deletion
    }

    this.colorDetail.removeAt(index);
  }

  onImageChange(event: any, index: number) {
    const files = Array.from(event.target.files) as File[];
    if (files.length > 0) {
      const previewUrls = files.map(file => URL.createObjectURL(file));

      this.colorDetail.at(index).patchValue({
        images: files,
        previewImages: previewUrls // show only new preview for this upload
      });
    }
  }


 loadProduct(id: number) {
  this.adminService.getProductById(id).subscribe(res => {
    if (res.status) {
      const p = res.response.products; 
     
      this.productForm.patchValue({
        sub_category_id: p.subCategory.sub_category_id, 
        brand: p.brand,
        model: p.model,
        about: p.about,
        minimum_quantity_wholesale: p.minimum_quantity_wholesale
      });

      if (p.technical_specifications) {
        Object.entries(p.technical_specifications).forEach(([key, value]) => {
          this.addTechnicalSpec(key, value as string);
        });
      }

      if (p.other_specifications) {
        Object.entries(p.other_specifications).forEach(([key, value]) => {
          this.addOtherSpec(key, value as string);
        });
      }

      p.size_detail.forEach((s: any) =>
        this.addSize(s.size_detail_id, s.description, s.price, s.wholesale_price)
      );

      p.color_detail.forEach((c: any) => {
        const existingImages = (c.imagevideos || []).map((imgObj: any) => imgObj.img_link);

        const colorGroup = this.fb.group({
          color_detail_id: [c.color_detail_id],
          color_name: [c.color_name],
          extra_amount: [c.extra_amount],
          images: [[]],
          previewImages: [existingImages],
        });

        this.colorDetail.push(colorGroup);
      });
    }
  });
}


  
   onSubmit() {
  if (!this.isEdit && this.productForm.invalid) {
    this.productForm.markAllAsTouched();
    return;
  }
  this.isLoading = true;


    // First delete items if edit mode
    if (this.isEdit) {
      this.sizesToDelete.forEach(sizeId => {
        this.adminService.deleteSizeDetail(sizeId).subscribe(res => {
          console.log('Deleted size:', res);
        });
      });

      this.colorsToDelete.forEach(colorId => {
        this.adminService.deleteColorDetail(colorId).subscribe(res => {
          console.log('Deleted color:', res);
        });
      });
    }

    const formData = new FormData();
    formData.append('sub_category_id', this.productForm.value.sub_category_id);
    formData.append('brand', this.productForm.value.brand);
    formData.append('model', this.productForm.value.model);
    formData.append('about', this.productForm.value.about);
    formData.append('minimum_quantity_wholesale', this.productForm.value.minimum_quantity_wholesale);

    this.technicalSpecifications.value.forEach((spec: any) => {
      formData.append(`technical_specifications[${spec.key}]`, spec.value);
    });

    this.otherSpecifications.value.forEach((spec: any) => {
      formData.append(`other_specifications[${spec.key}]`, spec.value);
    });

    if (this.isEdit) {
      const sizeDetailsArray: any[] = [];
      this.productForm.value.size_detail.forEach((s: any) => {
        sizeDetailsArray.push({
          size_detail_id: s.size_detail_id,
          description: s.description,
          price: s.price,
          wholesale_price: s.wholesale_price
        });
      });

      const sizePayload = {
        product_id: this.productId,
        size_details: sizeDetailsArray
      };

      this.adminService.saveorUpdateSize(sizePayload).subscribe(res => {
        console.log('Size update response:', res);
      });

      const formDataForColor = new FormData();
      this.productForm.value.color_detail.forEach((c: any, i: number) => {
        if (c.color_detail_id) {
          formDataForColor.append(`cColorDetailDTOs[${i}].color_detail_id`, c.color_detail_id);
        }
        formDataForColor.append(`cColorDetailDTOs[${i}].color_name`, c.color_name);
        formDataForColor.append(`cColorDetailDTOs[${i}].extra_amount`, c.extra_amount);

        // only send new files
        if (c.images && c.images.length > 0) {
          c.images.forEach((file: File) => {
            formDataForColor.append(`cColorDetailDTOs[${i}].images`, file);
          });
        }
      });


      formDataForColor.append('product_id', this.productId.toString());

      this.adminService.saveorUpdateColor(formDataForColor).subscribe(res => {
        console.log('Color update response:', res);
      });
    } else {
      this.productForm.value.size_detail.forEach((s: any, i: number) => {
        formData.append(`size_detail[${i}].description`, s.description);
        formData.append(`size_detail[${i}].price`, s.price);
        formData.append(`size_detail[${i}].wholesale_price`, s.wholesale_price);
      });

      this.productForm.value.color_detail.forEach((c: any, i: number) => {
        formData.append(`color_detail[${i}].color_name`, c.color_name);
        formData.append(`color_detail[${i}].extra_amount`, c.extra_amount);

        if (c.previewImages?.length) {
          c.previewImages.forEach((url: string, idx: number) => {
            formData.append(`color_detail[${i}].existingImages[${idx}]`, url);
          });
        }

        if (c.images?.length) {
          c.images.forEach((file: File, idx: number) => {
            formData.append(`color_detail[${i}].images[${idx}]`, file);
          });
        }
      });
    }

    if (this.isEdit) {
      formData.append('product_id', this.productId.toString());
    }

    formData.forEach((key, value) => {
      console.log(`${key} : ${value}`)
    })

    this.adminService.saveOrUpdateProduct(formData).subscribe({
      next: (res: any) => {
          this.isLoading = false;
        if (res.status) {
          setTimeout(() => {
            Swal.fire({
              icon: 'success',
              title: res.message || 'Saved successfully!',
              timer: 2000,
              showConfirmButton: false
            });
this.router.navigate(['/product'], { state: { refresh: true } });
          }, 500);
        }
      },
      error: (err) => {
          this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: err.error?.message || 'Something went wrong while saving.',
        });
      }
    });
  }
}
