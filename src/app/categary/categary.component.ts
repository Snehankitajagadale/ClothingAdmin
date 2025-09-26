import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { AdminService } from '../admin.service';

@Component({
  selector: 'app-categary',
  templateUrl: './categary.component.html',
  styleUrls: ['./categary.component.css'],
  standalone: false
})
export class CategaryComponent implements OnInit {
  role = 'Admin';
  categories: any[] = [];

  isModalOpen = false;
  isEditMode = false;
  imageTouched = false;
  selectedImage: File | null = null;

  formData = {
    index: -1,
    category_id: 0,
    categoryName: '',
    image_link: ''
  };

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  // ✅ Load categories
  loadCategories(): void {
    this.adminService.getAllCategories().subscribe({
      next: (res) => {
        if (res.status && res.response) {
this.categories = res.response.reverse(); 
        }
      },
      error: (err) => console.error('Error loading categories', err)
    });
  }

  openModal(index: number = -1): void {
    this.isModalOpen = true;
    this.imageTouched = false;
    this.selectedImage = null;

    if (index >= 0) {
      this.isEditMode = true;
      const selected = this.categories[index];
      this.formData = {
        index,
        category_id: selected.category_id,
        categoryName: selected.category_name,
        image_link: selected.image_link
      };
    } else {
      this.isEditMode = false;
      this.formData = {
        index: -1,
        category_id: 0,
        categoryName: '',
        image_link: ''
      };
    }
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  onImageChange(event: any): void {
    this.imageTouched = true;
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.formData.image_link = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  // ✅ Save or update category
  saveCategory(): void {
    if (!this.formData.categoryName.trim()) {
      Swal.fire('Error', 'Please enter a category name.', 'error');
      return;
    }

    const formDataObj = new FormData();
    if (this.formData.category_id > 0) {
      formDataObj.append('category_id', this.formData.category_id.toString());
    }
    formDataObj.append('category_name', this.formData.categoryName);
    if (this.selectedImage) {
      formDataObj.append('CategoryImg', this.selectedImage);
    }

    this.adminService.saveOrUpdateCategory(formDataObj).subscribe({
      next: (res) => {
        if (res.status) {
          Swal.fire('Success', res.message, 'success');
          this.loadCategories();
          this.closeModal();
        } else {
          Swal.fire('Error', res.message || 'Failed to save category', 'error');
        }
      },
      error: (err) => {
        console.error('Error saving category', err);
        Swal.fire('Error', 'Something went wrong', 'error');
      }
    });
  }

  deleteCategory(index: number): void {
    const category = this.categories[index];
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete "${category.category_name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminService.deleteCategory(category.category_id).subscribe({
          next: (res) => {
            if (res.status) {
              Swal.fire('Deleted!', res.message, 'success');
              this.loadCategories();
            } else {
              Swal.fire('Error', res.message || 'Failed to delete category', 'error');
            }
          },
          error: (err) => {
            console.error('Delete error', err);
            Swal.fire('Error', 'Something went wrong', 'error');
          }
        });
      }
    });
  }
}
