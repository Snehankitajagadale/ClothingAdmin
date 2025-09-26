import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'], // corrected property name (was styleUrl)
})
export class AppComponent {
  title = 'E-commerceAdmin';
  isSidebarCollapsed = false;
  showLayout = true;

  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const noLayoutRoutes = ['/login', '/signup', '/forgot-password'];
        const currentUrl = event.urlAfterRedirects.split('?')[0];
        this.showLayout = !noLayoutRoutes.includes(currentUrl);
      }
    });
  }

  // UI Event Handlers
  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }
}
