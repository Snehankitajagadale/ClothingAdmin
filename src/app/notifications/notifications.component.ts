import { Component, OnInit } from '@angular/core';
import { AdminService } from '../admin.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css'],
  standalone: false
})
export class NotificationsComponent implements OnInit {
  notifications: any[] = [];
  filteredNotifications: any[] = [];
  selectedNotification: any = null;
  showviewModal = false;
  today = new Date().toISOString().split('T')[0];

constructor(
  private adminService: AdminService,
  private router: Router
) {}
  ngOnInit(): void {
    console.log('✅ NotificationsComponent initialized');
    this.loadNotifications();
  }

  // 🔹 Fetch all notifications for Admin
  loadNotifications() {
    console.log('📥 Fetching notifications for Admin ID = 1...');
    this.adminService.getNotificationsByAdminId(1).subscribe({
      next: (res) => {
        console.log('📥 API Response (Notifications):', res);

        if (res.status && res.response) {
          this.notifications = res.response.map((n: any) => ({
            notificationId: n.notification_id,
            message: n.message,
            creation_time: n.creation_time,
            viewed: n.isview,
            bookingId: n.booking_id,
            // Store raw user data array (we'll pick correct user later)
            users: n.user
          })).reverse();

          console.log('✅ Processed Notifications:', this.notifications);
          this.filteredNotifications = [...this.notifications];
        }
      },
      error: (err) => {
        console.error('❌ Error fetching notifications:', err);
      }
    });
  }

  // 🔹 Date filter
  onDateChange(event: any) {
    const selectedDate = event.target.value;
    if (!selectedDate) {
      this.filteredNotifications = [...this.notifications];
      return;
    }
    this.filteredNotifications = this.notifications.filter((n) =>
      n.creation_time.startsWith(selectedDate)
    );
  }

  // 🔹 Open Modal and Fetch Booking Details
  openviewModal(notificationId: number) {
    const notification = this.notifications.find(n => n.notificationId === notificationId);
    if (!notification) return;

    this.selectedNotification = { ...notification };
    this.showviewModal = true;

    // Mark notification as viewed
    this.adminService.viewNotificationById(notificationId).subscribe();

    // Fetch full booking details
    if (notification.bookingId) {
      this.adminService.getBookingById(notification.bookingId).subscribe({
        next: (res) => {
          if (res.status && res.response) {
            const b = res.response;
            const newStatus = b.booking_detail?.[b.booking_detail.length - 1]?.status || 'Pending';

            // 🔹 Extract USER details
            const userData = b?.user && b.user.role === 'USER' ? b.user : null;

            this.selectedNotification.bookingDetails = {
              bookingId: b.booking_id,
              bookingStatus: newStatus,
              bookingDate: b.booking_date,
              totalPrice: b.total_price
            };

            this.selectedNotification.userDetails = {
              name: userData?.user_name || 'Guest',
              email: userData?.email || '',
              mobile: userData?.mobile_no || ''
            };

            // 🔹 Store product details
            this.selectedNotification.productDetails = (b.productDetail || []).map((p: any) => ({
              product_name: p.product_name,
              image_link: p.image_link,
              colorName: p.colorName,
              description: p.description,
              price: p.price,
              quantity: p.qunatity || p.quantity,
              total_price: p.total_price
            }));
          }
        },
        error: (err) => {
          console.error('❌ Error fetching booking details:', err);
        }
      });
    }
  }

  // 🔹 Close modal
  closeModal() {
    this.showviewModal = false;
    this.selectedNotification = null;
  }
  viewBooking(bookingId: number) {
  if (!bookingId) return;
  this.closeModal(); // close modal first
  this.router.navigate(['/bookings', bookingId]);
}

}
