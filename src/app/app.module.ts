import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { ForgotpasswordComponent } from './forgotpassword/forgotpassword.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ProductComponent } from './product/product.component';
import { BannerImageComponent } from './banner-image/banner-image.component';
import { BookingsComponent } from './bookings/bookings.component';
import { HeaderComponent } from './header/header.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MyprofileComponent } from './myprofile/myprofile.component';
import { CategaryComponent } from './categary/categary.component';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { NgChartsModule } from 'ng2-charts';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { SubcategoryComponent } from './subcategory/subcategory.component';
import { CommonModule } from '@angular/common';
import { ViewReviewComponent } from './view-review/view-review.component';
import { AddupdateprocutComponent } from './addupdateprocut/addupdateprocut.component';
import { BookingDetailsComponent } from './booking-details/booking-details.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ForgotpasswordComponent,
    BannerImageComponent,
    BookingsComponent,
    HeaderComponent,
    NotificationsComponent,
    DashboardComponent,
    SidebarComponent,
    MyprofileComponent,
    CategaryComponent,
    ProductComponent,
    ProductDetailsComponent,
    SubcategoryComponent,
     ViewReviewComponent,
     AddupdateprocutComponent,
     BookingDetailsComponent,
  ],
  imports: [
  BrowserModule,
  AppRoutingModule,
  FormsModule,
  ReactiveFormsModule,
  CommonModule,
  HttpClientModule,
  BrowserAnimationsModule,
  ToastrModule.forRoot({
    timeOut: 3000,
    positionClass: 'toast-top-right',
    preventDuplicates: true
  }),
  NgChartsModule,
  NgxSliderModule,
],

  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }