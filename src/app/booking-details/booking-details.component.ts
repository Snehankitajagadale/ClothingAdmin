import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AdminService } from '../admin.service';

enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PACKAGING = 'PACKAGING',
  ONTHEWAY = 'ONTHEWAY',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Component({
  selector: 'app-booking-details',
  templateUrl: './booking-details.component.html',
  styleUrls: ['./booking-details.component.css'],
})
export class BookingDetailsComponent implements OnInit {
  booking: any = null;
  bookingId!: number;
  loading = false;

  // Image preview
  showImageModal = false;
  previewImage = '';

  // expose enum to template
  bookingStatusEnum = Object.values(BookingStatus);

  constructor(
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private adminService: AdminService
  ) {}

 ngOnInit(): void {
  this.route.paramMap.subscribe(params => {
    this.bookingId = Number(params.get('id'));
    if (this.bookingId) {
      this.fetchBookingDetails();
    }
  });
}

  /** ✅ Fetch booking details by ID */
  fetchBookingDetails() {
    this.loading = true;
    this.adminService.getBookingById(this.bookingId).subscribe({
      next: (res) => {
        this.loading = false;
        const b = res?.response;
        if (!b) {
          this.toastr.error('Booking not found');
          return;
        }
        this.booking = this.buildBookingDetails(b);
        console.log('✅ Booking Details:', this.booking);
      },
      error: (err) => {
        this.loading = false;
        console.error('❌ fetchBookingDetails error:', err);
        this.toastr.error('Failed to load booking details');
      },
    });
  }

  /** ✅ Transform API booking into UI-friendly object */
  private buildBookingDetails(b: any) {
    const firstProduct =
      Array.isArray(b?.productDetail) && b.productDetail.length > 0
        ? b.productDetail[0]
        : null;

    const type = firstProduct?.booking_type
      ? firstProduct.booking_type.charAt(0).toUpperCase() +
        firstProduct.booking_type.slice(1).toLowerCase()
      : 'Retail';

    const products = Array.isArray(b?.productDetail)
      ? b.productDetail.map((pd: any) => ({
          name: pd.product_name ?? 'Product',
          price: pd.price ?? 0,
          retailPrice: pd.retailPrice ?? pd.price ?? 0,
          wholesalePrice: pd.wholesalePrice ?? pd.price ?? 0,
          discount: pd.discount ?? 0,
          quantity: pd.qunatity ?? pd.quantity ?? 1,
          image: pd.image_link ?? '',
          totalPrice: pd.total_price ?? 0,
          color: pd.colorName ?? '',
          size: pd.description ?? '',
          booking_type: pd.booking_type ?? '',
        }))
      : [];

    const customer = {
      name: b?.user?.user_name ?? 'Guest',
      email: b?.user?.email ?? '',
      mobile: b?.user?.mobile_no ?? '',
    };

    const address = {
      line: b?.address?.line ?? '',
      landmark: b?.address?.landmark ?? '',
      city: b?.address?.city ?? '',
      pincode: b?.address?.pincode ?? '',
    };

    let status = 'Pending';
    if (Array.isArray(b?.booking_detail) && b.booking_detail.length > 0) {
      status = b.booking_detail[b.booking_detail.length - 1].status ?? status;
    }

    const payments = Array.isArray(b?.payment_details) ? b.payment_details : [];

    return {
      id: `BK${b.booking_id}`,
      booking_id: b.booking_id,
      mode: type, // Retail/Wholesale
      bookingMode: b?.booking_mode ?? '', // ONLINE/OFFLINE
      time: b.booking_date ?? '',
      status: status,
      customer,
      address,
      products,
      bookingDetails: b?.booking_detail ?? [],
      paymentType: b?.payment ?? '',
      paidAmount: b?.paid_amount ?? 0,
      balanceAmount: b?.balance_amount ?? 0,
      totalAmount: b?.total_price ?? 0,
      payments,
      paymentImage: {
        link: b?.payment_image_link ?? '',
        name: b?.payment_image_name ?? '',
      },
    };
  }

  /** ✅ Preview Image */
  viewImage(imgUrl: string) {
    this.previewImage = imgUrl;
    this.showImageModal = true;
  }

  closeImageModal() {
    this.showImageModal = false;
    this.previewImage = '';
  }

  /** ✅ Calculate total */
  calculateTotalPrice(): number {
    if (!this.booking || !this.booking.products) return 0;

    return this.booking.products.reduce((total: number, p: any) => {
      const unitPrice =
        this.booking.mode === 'Retail' ? p.retailPrice : p.wholesalePrice;
      const totalWithDiscount =
        unitPrice * p.quantity - (p.discount ?? 0);
      return total + totalWithDiscount;
    }, 0);
  }

  /** ✅ Update Booking Status (API call) */
  updateBookingStatus(newStatus: string) {
    if (!this.booking) return;

    const payload = {
      booking_id: this.booking.booking_id,
      booking_detail: [{ status: newStatus }],
    };

    const formData = new FormData();
    formData.append('booking', JSON.stringify(payload));

    console.log('📤 updateBookingStatus payload:', payload);

    this.adminService.updateBookingStatus(formData).subscribe({
      next: (res) => {
        console.log('📥 updateBookingStatus response:', res);

        switch (newStatus) {
          case 'CONFIRMED':
            this.toastr.success('✅ Order Confirmed Successfully!', 'Booking Status');
            break;
          case 'CANCELLED':
            this.toastr.error('❌ Order Cancelled', 'Booking Status');
            break;
          case 'COMPLETED':
            this.toastr.success('🎉 Order Completed', 'Booking Status');
            break;
          case 'PENDING':
            this.toastr.info('⏳ Order marked as Pending', 'Booking Status');
            break;
          case 'PACKAGING':
            this.toastr.info('📦 Order is being Packed', 'Booking Status');
            break;
          case 'ONTHEWAY':
            this.toastr.warning('🚚 Order is On The Way', 'Booking Status');
            break;
          default:
            this.toastr.info(`Booking updated to ${newStatus}`, 'Booking Status');
        }

        this.booking.status = newStatus;
      },
      error: (err) => {
        console.error('❌ updateBookingStatus error:', err);
        this.toastr.error('Failed to update booking', 'Error');
      },
    });
  }
}
