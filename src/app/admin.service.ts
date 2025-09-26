import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private baseUrl = 'https://testing1.mahaapp.online/Cloth/v1';
  private loginApiUrl = 'https://testing1.mahaapp.online/Cloth/v1/user/loginUser';
  private logoutApiUrl = 'https://testing1.mahaapp.online/Cloth/v1/user/logoutUser';
  private productBaseUrl = `${this.baseUrl}/Product`;

  constructor(private http: HttpClient) { }

  loginUser(payload: any): Observable<any> {
    return this.http.post<any>(this.loginApiUrl, payload);
  }

  logoutUser(employeeId: number): Observable<any> {
    return this.http.post<any>(`${this.logoutApiUrl}?employee_id=${employeeId}`, {});
  }

  getAllCategories(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/Category/getAllCategory`);
  }

  saveOrUpdateCategory(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/Category/saveAndUpdateCategory`, formData);
  }

  deleteCategory(categoryId: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/Category/deleteCategoryById?categoryId=${categoryId}`, {});
  }
  getAllSubcategories(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/SubCategory/getAllSubCategory`);
  }
  saveOrUpdateSubcategory(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/SubCategory/saveAndUpdateSubCategory`, formData);
  }

  deleteSubcategory(subCategoryId: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/SubCategory/deleteSubCategoryById?subCategoryId=${subCategoryId}`, {});
  }
  sendEmailToAdmin(mailTo: string): Observable<any> {
    const payload = { mailTo: mailTo };
    return this.http.post('https://testing1.mahaapp.online/Cloth/v1/user/sendEmailToUsere', payload);
  }

  resetAdminPassword(payload: {
    mobile_no: string;
    email: string;
    password: string;
    role: string;
  }): Observable<any> {
    return this.http.post('https://testing1.mahaapp.online/Cloth/v1/user/forgetPassword', payload);
  }

  getProductById(productId: number): Observable<any> {
    return this.http.get<any>(`${this.productBaseUrl}/getProductsById?productId=${productId}`);
  }
 deleteProductRating(ratingId: number): Observable<any> {
  return this.http.post<any>(`${this.baseUrl}/Product/deleteProductRating?ratingId=${ratingId}`, {});
}

  getAllProducts(): Observable<any> {
    return this.http.get<any>(`${this.productBaseUrl}/getAllProducts`);
  }

  saveOrUpdateProduct(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.productBaseUrl}/saveOrUpdateProduct`, formData);
  }

  saveorUpdateSize(payload: any): Observable<any> {
    return this.http.post('https://testing1.mahaapp.online/Cloth/v1/Product/saveOrUpdateSizeDetail', payload);
  }

  saveorUpdateColor(formData: FormData): Observable<any> {
    return this.http.post('https://testing1.mahaapp.online/Cloth/v1/Product/saveOrUpdateColorDetail', formData);
  }
deleteSizeDetail(sizeId: number): Observable<any> {
  return this.http.post<any>(`${this.productBaseUrl}/deleteSizeDetail?sizeId=${sizeId}`, {});
}

deleteColorDetail(colorId: number): Observable<any> {
  return this.http.post<any>(`${this.productBaseUrl}/deleteColorDetail?colorId=${colorId}`, {});
}
deleteProduct(productId: number): Observable<any> {
  return this.http.delete<any>(`${this.productBaseUrl}/deleteProductsById?productId=${productId}`);
}
getAllSliderImages(): Observable<any> {
  return this.http.get<any>(`${this.baseUrl}/sliderImage/getAllSliderImages`);
}

getSliderImageById(id: number): Observable<any> {
  return this.http.get<any>(`${this.baseUrl}/sliderImage/getSliderImageById/${id}`);
}

saveSliderImage(formData: FormData): Observable<any> {
  return this.http.post<any>(`${this.baseUrl}/sliderImage/saveSliderImage`, formData);
}

deleteSliderImage(id: number): Observable<any> {
  return this.http.delete<any>(`${this.baseUrl}/sliderImage/deleteImage/${id}`);
}
updateProductAvailability(payload: {
  product_id: number;
  color_id: number;
  size_id: number;
  is_available: boolean;
}): Observable<any> {
  return this.http.post<any>(
    `${this.baseUrl}/Product/saveAvailableProduct`,
    payload
  );
}
getAllBookings(): Observable<any> {
  return this.http.get<any>(`${this.baseUrl}/booking/getAllBooking`);
}

getBookingById(bookingId: number): Observable<any> {
  return this.http.get<any>(`${this.baseUrl}/booking/getBookingById?bookingId=${bookingId}`);
}

getAllBookingsByType(bookingType: string): Observable<any> {
  return this.http.get<any>(`${this.baseUrl}/booking/getAllBookingByType?bookingType=${bookingType}`);
}
getProductsByBrandOrModel(name: string): Observable<any> {
  return this.http.get<any>(
    `${this.baseUrl}/Product/getProductsByBrandOrModel?name=${encodeURIComponent(name)}`
  );
}
updateBookingStatus(formData: FormData): Observable<any> {
  return this.http.post<any>(`${this.baseUrl}/booking/saveOrUpdateBookingService`, formData);
}
getAllBookingSale(): Observable<any> {
  return this.http.get<any>(`${this.baseUrl}/booking/getAllBookingSale`);
}

getAllBookingSaleBetweenDates(start: string, end: string): Observable<any> {
  return this.http.get<any>(`${this.baseUrl}/booking/getAllBookingSaleBetweenDates?start=${start}&end=${end}`);
}


getAllBookingsByStatus(status: string): Observable<any> {
  return this.http.get<any>(
    `${this.baseUrl}/booking/getAllBookingByStatus?bookingStatus=${status}`
  );
}
// admin.service.ts

getNotificationsByAdminId(adminId: number = 1): Observable<any> {
  return this.http.get<any>(`${this.baseUrl}/booking/getNotificationsById?Id=${adminId}`);
}

viewNotificationById(notificationId: number): Observable<any> {
  return this.http.get<any>(`${this.baseUrl}/booking/viewNotificationById?Id=${notificationId}`);
}

}
