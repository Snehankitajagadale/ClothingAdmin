import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { AdminService } from '../admin.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css'],
  standalone: false
})
export class ProductComponent implements OnInit {
  showForm = false;            // not used for modal now, kept for backward compat if required
  editMode = false;
  editingIndex: number | null = null;

  searchTerm: string = '';     // now used to search by brand
  products: any[] = [];
  isFilterVisible: boolean = false;

  // filter state
  selectedCategories: string[] = [];
  selectedSubcategories: string[] = [];
  selectedBrands: string[] = [];
  priceRange: number = 10000;

  // dynamic lists from backend
  categories: any[] = [];
  subcategories: any[] = [];
  subcategoriesMap: { [key: string]: string[] } = {};
  subcategoryBrandMap: { [key: string]: string[] } = {};
selectedProduct: any = null;
selectedColorId: number | null = null;
selectedSizeId: number | null = null;
selectedStatus: boolean | null = null;
showStockModal: boolean = false;
  selectedProductId: any;
  isAvailable: any;
  constructor(private router: Router, private adminService: AdminService) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.refreshData();
      });
  }

  ngOnInit(): void {
    this.getAllProducts();
    this.getAllCategories();
    this.getAllSubcategories();
    this.refreshData()

     const nav = this.router.getCurrentNavigation();
  if (nav?.extras?.state?.['refresh']) {
    this.getAllProducts();
  }
  }

  refreshData() {
    this.getAllProducts();
    this.getAllCategories();
    this.getAllSubcategories();
  }

openStockModal(prod: any) {
  this.selectedProduct = prod;
  this.selectedColorId = null;
  this.selectedSizeId = null;
  this.selectedStatus = null;
  this.showStockModal = true;
}

closeStockModal() {
  this.showStockModal = false;
}
  getAllProducts() {
    this.adminService.getAllProducts().subscribe({
      next: (res: any) => {
        console.log('getAllProducts response:', res);
        if (res && res.response) {
          // assuming API returns res.response as array
          this.products = Array.isArray(res.response) ? res.response : (res.response.products || []);
        } else if (Array.isArray(res)) {
          this.products = res;
        } else {
          this.products = [];
        }
      },
      error: (err) => {
        console.error('getAllProducts error:', err);
        Swal.fire('Error', err.error?.message || 'Failed to fetch products', 'error');
      }
    });
  }

  getAllCategories() {
    this.adminService.getAllCategories().subscribe({
      next: (res: any) => {
        console.log('getAllCategories response:', res);
        if (res && res.response) {
          this.categories = res.response;
        } else if (Array.isArray(res)) {
          this.categories = res;
        } else {
          this.categories = [];
        }
      },
      error: (err) => {
        console.error('getAllCategories error:', err);
      }
    });
  }

  getAllSubcategories() {
    this.adminService.getAllSubcategories().subscribe({
      next: (res: any) => {
        console.log('getAllSubcategories response:', res);
        if (res && res.response) {
          this.subcategories = res.response; // array of subcategory objects

          // Build subcategoriesMap: categoryName -> [subcatName]
          this.subcategories.forEach((s: any) => {
            const catName = s.category?.category_name || s.categoryName || s.category || 'Uncategorized';
            if (!this.subcategoriesMap[catName]) this.subcategoriesMap[catName] = [];
            this.subcategoriesMap[catName].push(s.sub_category_name || s.subCategoryName || s.subCategory || s.sub_category_id);
          });

          // Optionally build subcategoryBrandMap from products (brands per subcategory)
          this.buildSubcategoryBrandMap();
        } else {
          this.subcategories = [];
        }
      },
      error: (err) => {
        console.error('getAllSubcategories error:', err);
      }
    });
  }

  // derive brands per subcategory from currently loaded products
  buildSubcategoryBrandMap() {
    this.subcategoryBrandMap = {};
    this.products.forEach(prod => {
      const sub = prod.subcategory || (prod.subCategory && prod.subCategory.sub_category_name) || prod.subCategory?.sub_category_name;
      const brand = prod.brand || prod.productBrand || prod.brandName;
      if (!sub || !brand) return;
      if (!this.subcategoryBrandMap[sub]) this.subcategoryBrandMap[sub] = [];
      if (!this.subcategoryBrandMap[sub].includes(brand)) this.subcategoryBrandMap[sub].push(brand);
    });
  }

  // Toggle filter panel for mobile
  toggleFilterPanel() {
    this.isFilterVisible = !this.isFilterVisible;
  }

  // category filter functions
  toggleCategory(categoryName: string): void {
    const idx = this.selectedCategories.indexOf(categoryName);
    if (idx > -1) this.selectedCategories.splice(idx, 1);
    else this.selectedCategories.push(categoryName);

    // Reset selectedSubcategories to only those valid for selected categories
    this.selectedSubcategories = this.selectedSubcategories.filter(sub => this.getAllSubcategoriesNames().includes(sub));
    // Reset brands similarly
    this.selectedBrands = this.selectedBrands.filter(brand => this.filteredBrands.includes(brand));
  }

  getAllSubcategoriesNames(): string[] {
    // flatten subcategoriesMap for selected categories or all if none selected
    const keys = this.selectedCategories.length ? this.selectedCategories : Object.keys(this.subcategoriesMap);
    return keys.flatMap(k => this.subcategoriesMap[k] || []);
  }

  toggleSubcategory(sub: string): void {
    const idx = this.selectedSubcategories.indexOf(sub);
    if (idx > -1) this.selectedSubcategories.splice(idx, 1);
    else this.selectedSubcategories.push(sub);

    // Keep brands consistent
    this.selectedBrands = this.selectedBrands.filter(brand => this.filteredBrands.includes(brand));
  }

  toggleBrandSelection(brandName: string): void {
    const idx = this.selectedBrands.indexOf(brandName);
    if (idx > -1) this.selectedBrands.splice(idx, 1);
    else this.selectedBrands.push(brandName);
  }

  isBrandSelected(brand: string): boolean {
    return this.selectedBrands.includes(brand);
  }

  // compute available brands from selected subcategories
  get filteredBrands(): string[] {
    const brands: string[] = [];
    this.selectedSubcategories.forEach(sub => {
      const fromMap = this.subcategoryBrandMap[sub];
      if (fromMap) brands.push(...fromMap);
    });
    // if no subcategories selected, derive brands from products
    if (brands.length === 0) {
      this.products.forEach(p => { if (p.brand) brands.push(p.brand); });
    }
    return Array.from(new Set(brands));
  }

  // search by brand (replaces search by name)
 onSearchChange() {
  const term = this.searchTerm.trim();
  console.log("Term Check", term)
  if (term.length >= 2) {  // call API only if at least 2 chars entered
    this.adminService.getProductsByBrandOrModel(term).subscribe({
      next: (res: any) => {
        console.log("Search response:", res);
        if (res?.status) {
          this.products = res.response;
        } else {
          this.products = [];
        }
      },
      error: (err) => {
        console.error("Search API error:", err);
        this.products = [];
      }
    });
  } else {
    // reset to all products when search is cleared
    this.getAllProducts();
  }
}


  // filteredProducts getter — filters by selected filters + searchTerm (brand)
  get filteredProducts(): any[] {
    return this.products.filter(prod => {
      const matchCategory = this.selectedCategories.length === 0 || this.selectedCategories.includes(prod.category);
      const matchSub = this.selectedSubcategories.length === 0 || this.selectedSubcategories.includes(prod.subcategory);
      const matchBrand = this.selectedBrands.length === 0 || this.selectedBrands.includes(prod.brand);
      const matchPrice = (prod.price ?? 0) <= this.priceRange;
      const matchSearch = this.searchTerm.trim() === '' || (prod.brand || prod.model || '').toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchCategory && matchSub && matchBrand && matchPrice && matchSearch;
    });
  }

  // Navigation to add product page (opens new component)
  goToAddProduct() {
    this.router.navigate(['/products/add']);
  }

  // Navigation to edit product page
  goToEditProduct(productId: number | string) {
    this.router.navigate(['/products/edit', productId]);
  }

  // Use backend getById and then navigate to details route (passing state optionally)
  viewDetails(prod: any) {
    // if you want to fetch fresh data from backend before navigating:
    const productId = prod.product_id || prod.id;
    if (productId) {
      this.adminService.getProductById(Number(productId)).subscribe({
        next: (res: any) => {
          console.log('getProductById response:', res);
          const p = res?.response || prod;
          this.router.navigate(['/product-details', productId], { state: { product: p } });
        },
        error: (err) => {
          console.error('getProductById error:', err);
          // fallback navigate with existing data
          this.router.navigate(['/product-details', productId], { state: { product: prod } });
        }
      });
    } else {
      this.router.navigate(['/product-details', productId], { state: { product: prod } });
    }
  }

  // reviews
  viewReviews(productId: string | number) {
    this.router.navigate(['/reviews', productId]);
  }

  // edit button handler in table
  editProduct(index: number) {
    const prod = this.filteredProducts[index];
    const id = prod.product_id || prod.id;
    if (id) this.goToEditProduct(id);
    else Swal.fire('Error', 'Product id not found', 'error');
  }

  // delete product (local only). Replace with API delete if available
  confirmDelete(index: number) {
    const prod = this.filteredProducts[index];
    const productId = prod.product_id || prod.id;

    Swal.fire({
      title: 'Are you sure?',
      text: 'This will permanently delete the product.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed && productId) {
        this.adminService.deleteProduct(productId).subscribe({
          next: (res: any) => {
            console.log('deleteProduct response:', res); // 🔎 See full backend response

            if (res?.status) {
              // remove product from local list after success
              const idxOf = this.products.findIndex(p => (p.product_id || p.id) === productId);
              if (idxOf > -1) this.products.splice(idxOf, 1);

              // ✅ Show backend message
              Swal.fire('Deleted!', res.message || 'Product deleted successfully', 'success');
            } else {
              Swal.fire('Error', res.message || 'Failed to delete product', 'error');
            }
          },
          error: (err) => {
            console.error('deleteProduct error:', err);
            Swal.fire('Error', err.error?.message || 'Delete failed', 'error');
          }
        });
      }
    });
  }


  // Reset filters/search
  resetFilters() {
    this.selectedCategories = [];
    this.selectedSubcategories = [];
    this.selectedBrands = [];
    this.searchTerm = '';
    this.priceRange = 10000;
  }

  // handle stock status change locally and show message (can call API to persist)
 // handle stock status change locally and call API
updateStock() {
  if (!this.selectedProduct || !this.selectedColorId || !this.selectedSizeId || this.selectedStatus === null) {
    Swal.fire('Error', 'Please select color, size, and status before updating', 'error');
    return;
  }

  const payload = {
    product_id: this.selectedProduct.product_id,
    color_id: this.selectedColorId, // actually color_detail_id
    size_id: this.selectedSizeId,   // actually size_detail_id
    is_available: this.selectedStatus
  };

  console.log("Payload being sent to API:", payload);

  this.adminService.updateProductAvailability(payload).subscribe({
    next: (res: any) => {
      console.log("Update stock response:", res);
      if (res?.status) {
        Swal.fire({
          icon: 'success',
          title: res.message || 'Stock updated successfully',
          timer: 1200,
          showConfirmButton: false
        });
        this.closeStockModal();
      } else {
        Swal.fire('Error', res?.message || 'Failed to update stock', 'error');
      }
    },
    error: (err) => {
      console.error('updateProductAvailability error:', err);
      Swal.fire('Error', err.error?.message || 'Update failed', 'error');
    }
  });
}





  // helper to handle image fallback
  getImageUrl(p: any) {
    // Try multiple fields returned by backend
    return p.imageUrl || p.img_link || p.productImage || '/assets/img/default.png';
  }
}
