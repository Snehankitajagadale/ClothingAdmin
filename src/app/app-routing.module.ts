import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ForgotpasswordComponent } from './forgotpassword/forgotpassword.component';
import { ProductComponent } from './product/product.component';
import { BannerImageComponent } from './banner-image/banner-image.component';
import { BookingsComponent } from './bookings/bookings.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { MyprofileComponent } from './myprofile/myprofile.component';
import { CategaryComponent } from './categary/categary.component';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { SubcategoryComponent } from './subcategory/subcategory.component';
import { ViewReviewComponent } from './view-review/view-review.component';
import { AddupdateprocutComponent } from './addupdateprocut/addupdateprocut.component';
import { AuthGuard } from './auth.guard';
import { BookingDetailsComponent } from './booking-details/booking-details.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotpasswordComponent },

  // Protected Routes
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'sidebar', component: SidebarComponent, canActivate: [AuthGuard] },
  { path: 'my-profile', component: MyprofileComponent, canActivate: [AuthGuard] },
  { path: 'category', component: CategaryComponent, canActivate: [AuthGuard] },
  { path: 'subcategory', component: SubcategoryComponent, canActivate: [AuthGuard] },
  { path: 'product', component: ProductComponent, canActivate: [AuthGuard] },
  { path: 'product-details/:id', component: ProductDetailsComponent, canActivate: [AuthGuard] },
  { path: 'reviews/:id', component: ViewReviewComponent, canActivate: [AuthGuard] },
  { path: 'products/add', component: AddupdateprocutComponent, canActivate: [AuthGuard] },
  { path: 'products/edit/:id', component: AddupdateprocutComponent, canActivate: [AuthGuard] },
  { path: 'bookings', component: BookingsComponent, canActivate: [AuthGuard] },
  { path: 'notifications', component: NotificationsComponent, canActivate: [AuthGuard] },
  { path: 'banner-image', component: BannerImageComponent, canActivate: [AuthGuard] },
  { path: 'bookings/:id', component: BookingDetailsComponent, canActivate: [AuthGuard] }

];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
