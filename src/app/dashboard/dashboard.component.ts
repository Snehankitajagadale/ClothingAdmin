import { Component, OnInit } from '@angular/core';
import { AdminService } from '../admin.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: false
})
export class DashboardComponent implements OnInit {
  startDate: string = '';
  endDate: string = '';
  today: string = '';

  // Permanent stats (overall totals)
  totalBooking: number = 0;
  totalProducts: number = 0;
  totalRetailSale: number = 0;
  totalWholesaleSale: number = 0;
  totalSale: number = 0;

  // Search stats
  searchStatsVisible: boolean = false;
  searchBooking: number = 0;
  searchProducts: number = 0;
  searchRetailSale: number = 0;
  searchWholesaleSale: number = 0;
  searchTotalSale: number = 0;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {

      const adminLoggin = localStorage.getItem("employeeId");
  if (!adminLoggin) {
    // 🚨 not logged in → redirect to login
    window.location.href = '/login';
    return;
  }
    const todayObj = new Date();
    this.today = todayObj.toISOString().split('T')[0];
    this.startDate = this.today;
    this.endDate = this.today;
    this.searchByDate();
    console.log("Today Date", this.today)
    this.loadTotalSale();
  }

  // Load overall totals
  loadTotalSale() {
    this.adminService.getAllBookingSale().subscribe({
      next: (res) => {
        const data = res?.response;
        if (data) {
          this.totalBooking = data.booking_count ?? 0;
          this.totalProducts = data.product_count ?? 0;
          this.totalRetailSale = data.total_retail_sale ?? 0;
          this.totalWholesaleSale = data.total_wholesale_sale ?? 0;
          this.totalSale = data.total_sale ?? 0;
        }
      },
      error: (err) => {
        Swal.fire('Error', 'Failed to load total sale data', 'error');
      }
    });
  }

  // Search by date
  searchByDate() {
    if (!this.startDate || !this.endDate) {
      Swal.fire('Warning', 'Please select both start and end dates', 'warning');
      return;
    }

    if (new Date(this.startDate) > new Date(this.endDate)) {
      Swal.fire('Warning', 'Start Date cannot be greater than End Date', 'warning');
      return;
    }

    this.adminService.getAllBookingSaleBetweenDates(this.startDate, this.endDate).subscribe({
      next: (res) => {
        const data = res?.response;
        if (data) {
          this.searchBooking = data.booking_count ?? 0;
          this.searchProducts = data.product_count ?? 0;
          this.searchRetailSale = data.total_retail_sale ?? 0;
          this.searchWholesaleSale = data.total_wholesale_sale ?? 0;
          this.searchTotalSale = data.total_sale ?? 0;
          this.searchStatsVisible = true;
        }
      },
      error: () => {
        Swal.fire('Error', 'Failed to load sale data for selected dates', 'error');
      }
    });
  }

  // Clear search results
  clearSearch() {
    this.startDate = '';
    this.endDate = '';
    this.searchStatsVisible = false;

    const todayObj = new Date();
    this.today = todayObj.toISOString().split('T')[0];
    this.startDate = this.today;
    this.endDate = this.today;
    this.searchByDate();
  }
}
