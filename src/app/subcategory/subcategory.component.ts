import { Component, OnInit } from '@angular/core';
import { AdminService } from '../admin.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-subcategory',
  templateUrl: './subcategory.component.html',
  styleUrls: ['./subcategory.component.css']
})
export class SubcategoryComponent implements OnInit {
  role = 'Admin';
  categories: any[] = [];
  subcategories: any[] = [];
  groupedData: any[] = []; // <-- For grouped category + subcategories

  isModalOpen = false;
  isEditMode = false;
  selectedImage: File | null = null;

  formData = {
    sub_category_id: 0,
    sub_category_name: '',
    category_id: '',
    image_link: ''
  };

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadSubcategories();
  }

  /** Load all categories */
  loadCategories(): void {
    this.adminService.getAllCategories().subscribe(res => {
      this.categories = res.response || [];
    });
  }

  /** Load all subcategories and group them */
 /** Load all subcategories and group them */
loadSubcategories(): void {
  this.adminService.getAllSubcategories().subscribe(res => {
    this.subcategories = (res.response || []).reverse(); // ⬅ reverse order
    this.groupSubcategories();
  });
}


  /** Group subcategories by category */
  groupSubcategories(): void {
    const grouped: any = {};

    this.subcategories.forEach((sub: any) => {
      const catName = sub.category?.category_name || 'Uncategorized';
      if (!grouped[catName]) {
        grouped[catName] = {
          category: sub.category,
          subcategories: []
        };
      }
      grouped[catName].subcategories.push(sub);
    });

    this.groupedData = Object.values(grouped);
    console.log("Grouped Data:", this.groupedData);
  }

  /** Open modal for Add/Edit */
  openModal(subcat: any = null): void {
    this.isModalOpen = true;
    if (subcat) {
      this.isEditMode = true;
      this.formData = {
        sub_category_id: subcat.sub_category_id,
        sub_category_name: subcat.sub_category_name.trim(),
        category_id: subcat.category.category_id,
        image_link: subcat.image_link
      };
    } else {
      this.isEditMode = false;
      this.resetForm();
    }
  }

  /** Close modal */
  closeModal(): void {
    this.isModalOpen = false;
  }

  /** Handle image upload */
  onImageChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;
      const reader = new FileReader();
      reader.onload = () => (this.formData.image_link = reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  /** Save or update subcategory */
  saveSubcategory(): void {
    const categoryId = Number(this.formData.category_id);

    if (!this.formData.sub_category_name.trim() || !categoryId) {
      Swal.fire('Error', 'Please select a valid category and enter a subcategory name.', 'error');
      return;
    }

    const fd = new FormData();
    if (this.formData.sub_category_id) {
      fd.append('sub_category_id', this.formData.sub_category_id.toString());
    }
    fd.append('sub_category_name', this.formData.sub_category_name.trim());
    fd.append('category.category_id', categoryId.toString());

    if (this.selectedImage) {
      fd.append('subCategoryImg', this.selectedImage);
    }

    this.adminService.saveOrUpdateSubcategory(fd).subscribe({
      next: (res) => {
        if (res.status) {
          Swal.fire('Success', res.message || 'Subcategory saved successfully!', 'success');
          this.loadSubcategories();
          this.resetForm();
          this.closeModal();
        } else {
          Swal.fire('Error', res.message || 'Failed to save subcategory', 'error');
        }
      },
      error: () => {
        Swal.fire('Error', 'Something went wrong!', 'error');
      }
    });
  }

  /** Delete subcategory */
  deleteSubcategory(subCategoryId: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Delete this subcategory?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!'
    }).then(result => {
      if (result.isConfirmed) {
        this.adminService.deleteSubcategory(subCategoryId).subscribe({
          next: (res) => {
            if (res.status) {
              Swal.fire('Deleted!', res.message || 'Subcategory deleted successfully.', 'success');
              this.loadSubcategories();
            } else {
              Swal.fire('Error', res.message || 'Failed to delete subcategory.', 'error');
            }
          },
          error: () => {
            Swal.fire('Error', 'Something went wrong while deleting.', 'error');
          }
        });
      }
    });
  }

  /** Reset form */
  resetForm(): void {
    this.formData = { sub_category_id: 0, sub_category_name: '', category_id: '', image_link: '' };
    this.selectedImage = null;
  }
}
