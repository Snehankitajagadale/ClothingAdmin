import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AdminService } from '../admin.service';

declare var html2pdf: any;

enum BookingStatus {
  PENDING = 'PENDING',

  CONFIRMED = 'CONFIRMED',
  PACKAGING = 'PACKAGING',
  ONTHEWAY = 'ONTHEWAY',
  COMPLETED = 'COMPLETED',

  CANCELLED = 'CANCELLED',
}

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.component.html',
  styleUrls: ['./bookings.component.css'],
  standalone: false,
})
export class BookingsComponent implements OnInit {
  selectedBooking: any = null;
  todayDate!: string;
  selectedStatus: string = '';
showImageModal: boolean = false;
previewImage: string = '';
  bookings: any[] = [];
  filters = {
    date: '',
    type: '',
    searchKey: '',
    searchValue: '',
  };
  loading = false;
allBookings: any[] = [];   // keep raw bookings

  // expose enum values to template
  bookingStatusEnum = Object.values(BookingStatus);

  constructor(private toastr: ToastrService, private adminService: AdminService) { }

  ngOnInit(): void {
    const today = new Date();
    this.todayDate = today.toISOString().split('T')[0];
    this.fetchAllBookings();
  }
viewImage(imgUrl: string) {
  this.previewImage = imgUrl;
  this.showImageModal = true;
}

closeImageModal() {
  this.showImageModal = false;
  this.previewImage = '';
}
  fetchAllBookings(): void {
  this.loading = true;
  this.adminService.getAllBookings().subscribe({
    next: (res) => {
      console.log('📥 fetchAllBookings response:', res);
      const list = Array.isArray(res?.response) ? res.response : [];
      this.allBookings = list.map((b: any) => this.mapBookingToRow(b));
      this.bookings = [...this.allBookings]; // start with full copy
      this.loading = false;
    },
    error: (err) => {
      this.loading = false;
      console.error('❌ fetchAllBookings error:', err);
      this.toastr.error('Failed to load bookings');
    },
  });
}

  fetchBookingsByType(type: string): void {
    this.loading = true;
    this.adminService.getAllBookingsByType(type.toUpperCase()).subscribe({
      next: (res) => {
        console.log(`📥 fetchBookingsByType(${type}) response:`, res);
        const list = Array.isArray(res?.response) ? res.response : [];
        this.bookings = list.map((b: any) => this.mapBookingToRow(b));
        this.loading = false;
        console.log('✅ mapped bookings by type:', this.bookings);
      },
      error: (err) => {
        this.loading = false;
        console.error('❌ fetchBookingsByType error:', err);
        this.toastr.error('Failed to load bookings by type');
      },
    });
  }
  fetchBookingsByStatus(status: string): void {
    this.loading = true;
    this.adminService.getAllBookingsByStatus(status.toUpperCase()).subscribe({
      next: (res) => {
        console.log(`📥 fetchBookingsByStatus(${status}) response:`, res);
        const list = Array.isArray(res?.response) ? res.response : [];
        this.bookings = list.map((b: any) => this.mapBookingToRow(b));
        this.loading = false;
        console.log('✅ mapped bookings by status:', this.bookings);
      },
      error: (err) => {
        this.loading = false;
        console.error('❌ fetchBookingsByStatus error:', err);
        this.toastr.error('Failed to load bookings by status');
      },
    });
  }

  onStatusChange(newStatus: string) {
    if (newStatus) {
      this.fetchBookingsByStatus(newStatus);
    } else {
      this.fetchAllBookings();
    }
  }

 onTypeChange(newType: string) {
  this.filters.type = newType;
  if (newType) {
    // If Retail or Wholesale → just update filter (no API)
    this.filters.type = newType;
  } else {
    // All → reset filter
    this.filters.type = '';
    
  }
}

  private mapBookingToRow(b: any) {
  const id = b?.booking_id ?? '';
  const bookingDate = b?.booking_date ? b.booking_date.split(' ')[0] : '';

  let status = 'Pending';
  if (Array.isArray(b?.booking_detail) && b.booking_detail.length > 0) {
    status = b.booking_detail[b.booking_detail.length - 1].status || 'Pending';
  }

  const bookedBy = b?.user?.user_name ?? 'Guest';

  // 🔥 Now type should come from the first product's booking_type
  const firstProduct = Array.isArray(b?.productDetail) && b.productDetail.length > 0
    ? b.productDetail[0]
    : null;

  const type = firstProduct?.booking_type
    ? (firstProduct.booking_type.charAt(0).toUpperCase() +
       firstProduct.booking_type.slice(1).toLowerCase())
    : '';

  return {
    raw: b,
    booking_id: id,
    booking_date: bookingDate,
    status: status,
    bookedBy: bookedBy,
    type: type,
    product_name: firstProduct?.product_name ?? '',
    brand: firstProduct?.brand ?? '',
    categoryName: firstProduct?.category_name ?? '',
    id: `BK${id}`,
  };
}


  openModalWithId(apiBookingId: number | string) {
    const idNum = Number(apiBookingId);
    console.log('🔍 Fetching booking by ID:', idNum);
    this.loading = true;
    this.adminService.getBookingById(idNum).subscribe({
      next: (res) => {
        console.log('📥 getBookingById response:', res);
        this.loading = false;
        const b = res?.response;
        if (!b) {
          this.toastr.error('Booking not found');
          return;
        }
        this.selectedBooking = this.buildSelectedBookingForModal(b);
        console.log('✅ selectedBooking:', this.selectedBooking);
      },
      error: (err) => {
        this.loading = false;
        console.error('❌ getBookingById error:', err);
        this.toastr.error('Failed to load booking details');
      },
    });
  }

private buildSelectedBookingForModal(b: any) {
  const firstProduct = Array.isArray(b?.productDetail) && b.productDetail.length > 0
    ? b.productDetail[0]
    : null;

  const type = firstProduct?.booking_type
    ? (firstProduct.booking_type.charAt(0).toUpperCase() +
       firstProduct.booking_type.slice(1).toLowerCase())
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
        booking_type: pd.booking_type ?? ''
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
    mode: type, // Retail/Wholesale (from product)
    bookingMode: b?.booking_mode ?? '', // 🔥 add ONLINE/OFFLINE from root
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
      name: b?.payment_image_name ?? ''
    }
  };
}


  closeModal() {
    this.selectedBooking = null;
  }

  calculateTotalPrice(): number {
    if (!this.selectedBooking || !this.selectedBooking.products) return 0;

    return this.selectedBooking.products.reduce((total: number, p: any) => {
      const unitPrice = this.selectedBooking.mode === 'Retail' ? p.retailPrice : p.wholesalePrice;
      const totalWithDiscount = unitPrice * p.quantity - (p.discount ?? 0);
      return total + totalWithDiscount;
    }, 0);
  }

  updateBookingStatus(newStatus: string) {
    if (!this.selectedBooking) return;

    const payload = {
      booking_id: this.selectedBooking.booking_id,
      booking_detail: [{ status: newStatus }],
    };

    const formData = new FormData();
    formData.append('booking', JSON.stringify(payload));

    console.log('📤 updateBookingStatus payload:', payload);

    this.adminService.updateBookingStatus(formData).subscribe({
      next: (res) => {
        console.log('📥 updateBookingStatus response:', res);

        // Different toaster messages based on status
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

        this.selectedBooking.status = newStatus;
        this.fetchAllBookings();
      },
      error: (err) => {
        console.error('❌ updateBookingStatus error:', err);
        this.toastr.error('Failed to update booking', 'Error');
      },
    });
  }



  getSearchPlaceholder(): string {
    switch (this.filters.searchKey) {
      case 'product_name':
        return 'Product Name';
      case 'brand':
        return 'Brand';
      case 'categoryName':
        return 'Category Name';
      case 'subCategoryName':
        return 'SubCategory Name';
      default:
        return 'Name';
    }
  }

get filteredBookings() {
  const filtered = this.allBookings.filter((booking) => {
    const matchesDate = !this.filters.date || booking.booking_date === this.filters.date;
    const matchesType = !this.filters.type || booking.type === this.filters.type;
    const matchesStatus = !this.selectedStatus || booking.status === this.selectedStatus;
    const matchesSearch =
      !this.filters.searchKey ||
      (this.filters.searchValue &&
        (booking as any)[this.filters.searchKey]
          ?.toString()
          .toLowerCase()
          .includes(this.filters.searchValue.toLowerCase()));

    return matchesDate && matchesType && matchesStatus && matchesSearch;
  });

  // 🔍 Debug logs
  // console.log('📊 Filters applied:', {
  //   date: this.filters.date,
  //   type: this.filters.type,
  //   status: this.selectedStatus,
  //   searchKey: this.filters.searchKey,
  //   searchValue: this.filters.searchValue,
  // });
  // console.log('✅ Filtered Bookings:', filtered);

  return filtered;
}


}
