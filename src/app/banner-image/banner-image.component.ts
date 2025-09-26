import { Component, OnInit } from '@angular/core';
import { AdminService } from '../admin.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-banner-image',
  templateUrl: './banner-image.component.html',
  styleUrls: ['./banner-image.component.css'],
  standalone: false
})
export class BannerImageComponent implements OnInit {

  allBanners: any[] = [];
  isModalOpen = false;
  selectedImage: File | null = null;

  deleteModal = false;
  selectedBanner: any;
  isLoading = false;
  isSubmitting = false;
  isDeleting = false;

  constructor(private adminService: AdminService, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.loadBanners();
  }

  // 🔹 Load all slider images
  loadBanners(): void {
    this.isLoading = true;
    this.adminService.getAllSliderImages().subscribe({
      next: (res) => {
        console.log('GetAll Response:', res);

        // ✅ Use the correct key from backend
        this.allBanners = res.response || [];

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching banners:', err);
        this.toastr.error('Failed to fetch banners');
        this.isLoading = false;
      }
    });
  }

  // 🔹 Open upload modal
  openModal(): void {
    this.isModalOpen = true;
  }

  // 🔹 Close upload modal
  closeModal(): void {
    this.isModalOpen = false;
    this.selectedImage = null;
  }

  // 🔹 Handle image select
  onImageSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedImage = file;
    }
  }

  // 🔹 Save image to backend
  onSave(): void {
    if (!this.selectedImage) return;

    const formData = new FormData();
    formData.append('sliderImages', this.selectedImage); // field name must match backend

    this.isSubmitting = true;
    this.adminService.saveSliderImage(formData).subscribe({
      next: (res) => {
        console.log('Save Response:', res);
        this.toastr.success(res.message || 'Image uploaded successfully');
        this.loadBanners();
        this.closeModal();
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('Error saving image:', err);
        this.toastr.error('Failed to upload image');
        this.isSubmitting = false;
      }
    });
  }

  // 🔹 Open delete confirmation modal
  openDeleteModal(banner: any): void {
    this.selectedBanner = banner;
    this.deleteModal = true;
  }

  // 🔹 Close delete confirmation modal
  closeDeleteModal(): void {
    this.deleteModal = false;
  }

  // 🔹 Delete banner
  deleteBannerImage(id: number): void {
    if (!id) return;

    this.isDeleting = true;
    this.adminService.deleteSliderImage(id).subscribe({
      next: (res) => {
        console.log('Delete Response:', res);
        this.toastr.success(res.message || 'Image deleted successfully');
        this.loadBanners();
        this.closeDeleteModal();
        this.isDeleting = false;
      },
      error: (err) => {
        console.error('Error deleting image:', err);
        this.toastr.error('Failed to delete image');
        this.isDeleting = false;
      }
    });
  }
}
