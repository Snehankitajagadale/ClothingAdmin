import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AdminService } from '../admin.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  notifications: any[] = [];
  unreadNotificationsCount = 0;
  showNotifications = false;
  showviewModal = false;
  selectedNotification: any = null;
  employeeId: number = 0;
  today = new Date().toISOString().split('T')[0];

  constructor(
    private router: Router,
    private adminService: AdminService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    const storedId = localStorage.getItem('employeeId');
    if (storedId) {
      this.employeeId = Number(storedId);
    }
    this.loadNotifications();
  }

  // ✅ Fetch notifications by AdminId
  loadNotifications(): void {
    const adminId = 1; // Replace with dynamic adminId if needed
    this.adminService.getNotificationsByAdminId(adminId).subscribe({
      next: (res) => {
        if (res?.status && res.response) {
          this.notifications = res.response.map((n: any) => ({
            notificationId: n.notification_id,
            message: n.message,
            creation_time: n.creation_time,
            viewed: n.isview,
            bookingId: n.booking_id
          })).reverse();

          this.unreadNotificationsCount = this.notifications.filter(n => !n.viewed).length;
        }
      },
      error: (err) => {
        console.error('❌ Error fetching notifications:', err);
      }
    });
  }

  toggleNotification(): void {
    this.showNotifications = !this.showNotifications;
  }

  // ✅ Open modal and fetch booking + product + user details
  openviewModal(notificationId: number): void {
  const notification = this.notifications.find(n => n.notificationId === notificationId);
  if (!notification) return;

  this.selectedNotification = { ...notification };
  this.showviewModal = true;

  // Mark notification as viewed
  this.adminService.viewNotificationById(notificationId).subscribe({
    next: () => this.loadNotifications(),
    error: (err) => console.error('❌ Error marking as viewed:', err)
  });

  // Fetch booking details and user details
  if (notification.bookingId) {
    this.adminService.getBookingById(notification.bookingId).subscribe({
      next: (res) => {
        if (res.status && res.response) {
          const b = res.response;
          const newStatus = b.booking_detail?.[b.booking_detail.length - 1]?.status || 'Pending';

          this.selectedNotification.bookingDetails = {
            bookingId: b.booking_id,
            bookingStatus: newStatus,
            bookingDate: b.booking_date,
            totalPrice: b.total_price
          };

          // ✅ Product Details
          this.selectedNotification.productDetails = b.productDetail || [];

          // ✅ User Details (handle both array or single object)
          if (Array.isArray(b.user)) {
            this.selectedNotification.userDetails = b.user.find((u: any) => u.role === 'USER') || null;
          } else {
            this.selectedNotification.userDetails = b.user || null;
          }
        }
      },
      error: (err) => console.error('❌ Error fetching booking details:', err)
    });
  }
}

  closeModal(): void {
    this.showviewModal = false;
    this.selectedNotification = null;
  }

  logout(): void {
    if (!this.employeeId) {
      this.toastr.error('Employee ID missing. Please log in again.', 'Error');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to log out?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, log out',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminService.logoutUser(this.employeeId).subscribe({
          next: (response) => {
            if (response.status) {
              Swal.fire('Logged Out', response.message || 'Logout successful', 'success');
              localStorage.clear();
              this.router.navigate(['/login']);
            } else {
              Swal.fire('Error', response.message || 'Logout failed. Please try again.', 'error');
            }
          },
          error: (err) => {
            console.error('Logout error:', err);
            Swal.fire('Error', 'Something went wrong. Please try again.', 'error');
          }
        });
      }
    });
  }
}
