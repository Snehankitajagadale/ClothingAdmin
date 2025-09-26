import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { AdminService } from '../admin.service';

interface Review {
  id: number;
  productId: number;
  userName: string;
  rating: number;
  message: string;
  date: string;
  mediaUrl?: string;
  color?: string;
  size?: string;
}

@Component({
  selector: 'app-view-review',
  templateUrl: './view-review.component.html',
  styleUrls: ['./view-review.component.css']
})
export class ViewReviewComponent implements OnInit {
  productId: number = 0;
  productBrand: string = '';
  productModel: string = '';
  reviews: Review[] = [];
  visibleReviews: Review[] = [];   // ✅ first few reviews only
  isLoading = false;
  showCount = 18;   // ✅ number of cards to show initially

  constructor(private route: ActivatedRoute, private adminService: AdminService) {}

  ngOnInit(): void {
    this.productId = Number(this.route.snapshot.paramMap.get('id'));
    console.log('🔹 ngOnInit → ProductId from route:', this.productId);

    if (this.productId) {
      this.loadReviews();
    }
  }

  loadReviews() {
    console.log('⏳ Loading reviews for product:', this.productId);
    this.isLoading = true;

    this.adminService.getProductById(this.productId).subscribe({
      next: (res) => {
        console.log('✅ API Response:', res);

        if (res?.status && res?.response?.products) {
          const product = res.response.products;
          console.log('📦 Product Data:', product);

          this.productBrand = product.brand;
          this.productModel = product.model;
          console.log('🏷️ Product Brand:', this.productBrand, 'Model:', this.productModel);

          if (product.rating) {
            this.reviews = product.rating.map((r: any) => {
              const mappedReview: Review = {
                id: r.rating_id,
                productId: this.productId,
                userName: r.user?.user_name,
                rating: r.rating,
                message: r.review,
                date: r.user?.creation_time,
                mediaUrl: r.images && r.images.length > 0 ? r.images[0].img_link : undefined,
                color: r.colorDetail?.color_name,
                size: r.sizeDetail?.description
              };
              console.log('📝 Mapped Review:', mappedReview);
              return mappedReview;
            });

            // ✅ initially show only first N
            this.visibleReviews = this.reviews.slice(0, this.showCount);
            console.log(`👀 Initial Visible Reviews (${this.showCount}):`, this.visibleReviews);
          }
        } else {
          console.warn('⚠️ No product or reviews found in API response');
        }

        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Error fetching reviews:', err);
        this.isLoading = false;
      }
    });
  }

  // ✅ Load more reviews
 // ✅ Load more reviews
showMore() {
  console.log('🔹 Show More clicked');
  const nextCount = this.visibleReviews.length + this.showCount;
  this.visibleReviews = this.reviews.slice(0, nextCount);
  console.log(`📜 Showing ${this.visibleReviews.length} of ${this.reviews.length} reviews`);
}

// ✅ Collapse back to initial
showLess() {
  console.log('🔹 Show Less clicked');
  this.visibleReviews = this.reviews.slice(0, this.showCount);
  console.log(`📜 Showing only first ${this.showCount} reviews`);
}

  // 🔹 Delete review
  deleteReview(id: number) {
    console.log('🗑️ Delete clicked for Review ID:', id);

    Swal.fire({
      title: 'Are you sure?',
      text: 'This review will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      console.log('🔎 Delete confirmation result:', result);

      if (result.isConfirmed) {
        console.log('✅ User confirmed deletion for ID:', id);

        this.adminService.deleteProductRating(id).subscribe({
          next: (res) => {
            console.log('🗑️ Delete API Response:', res);

            if (res?.status) {
              this.reviews = this.reviews.filter(r => r.id !== id);
              this.visibleReviews = this.reviews.slice(0, this.visibleReviews.length); // ✅ refresh view
              console.log('✅ Review deleted successfully. Updated reviews:', this.reviews);

              Swal.fire('Deleted!', res?.message || 'Review deleted successfully.', 'success');
            } else {
              console.warn('⚠️ Delete failed:', res?.message);
              Swal.fire('Failed!', res?.message || 'Failed to delete review.', 'error');
            }
          },
          error: (err) => {
            console.error('❌ Error deleting review:', err);
            Swal.fire('Error!', 'Something went wrong while deleting.', 'error');
          }
        });
      } else {
        console.log('🚫 User canceled deletion');
      }
    });
  }
}
