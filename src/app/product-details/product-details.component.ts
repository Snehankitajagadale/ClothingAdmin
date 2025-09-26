import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AdminService } from '../admin.service';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent {
  product: any = {
    stockStatus: true,
    productName: '',
    brand: '',
    model: '',
    category: '',
    subcategory: '',
    colors: [],
    sizes: [],
    minQty: 0,
    about: [],
    technicalDetails: [],
    otherDetails: [],
    availables: [],
    ratings: []
  };

  constructor(
    private route: ActivatedRoute,
    private service: AdminService
  ) {}

  ngOnInit(): void {
    const productId = Number(this.route.snapshot.paramMap.get('id'));
    if (productId) {
      this.getProductById(productId);
    }
  }

  getProductById(productId: number) {
    this.service.getProductById(productId).subscribe(res => {
      const data = res.response.products;
      const availables = res.response.availables || [];

      // Basic Info
      this.product.stockStatus = data.status;
      this.product.productName = `${data.brand} ${data.model}`;
      this.product.brand = data.brand;
      this.product.model = data.model;
      this.product.category = data.subCategory?.category?.category_name || '';
      this.product.subcategory = data.subCategory?.sub_category_name || '';
      this.product.minQty = data.minimum_quantity_wholesale;

      // Colors
    // Colors
this.product.colors = (data.color_detail || []).map((c: any) => ({
  id: c.color_detail_id,
  name: c.color_name,
  extraAmount: c.extra_amount,
  images: (c.imagevideos || []).map((img: any) => img.img_link) // 👈 
}));


      // Sizes
      this.product.sizes = (data.size_detail || []).map((s: any) => ({
        id: s.size_detail_id,
        description: s.description,
        price: s.price,
        wholesalePrice: s.wholesale_price
      }));

      // About
      this.product.about = data.about
        ? data.about.split(/\r?\n/).filter((line: string) => line.trim() !== '')
        : [];

      // Technical Specs
      this.product.technicalDetails = Object.entries(data.technical_specifications || {}).map(
        ([key, value]) => ({ key, value })
      );

      // Other Specs
      this.product.otherDetails = Object.entries(data.other_specifications || {}).map(
        ([key, value]) => ({ key, value })
      );

      // Availables
      this.product.availables = availables.map((a: any) => ({
        colorId: a.colorId,
        colorName: a.colorName,
        sizeId: a.sizeId,
        description: a.desciption,
        isAvailable: a.isavailable
      }));

      // Ratings
      this.product.ratings = (data.rating || []).map((r: any) => ({
        ratingId: r.rating_id,
        user: r.user,
        color: r.colorDetail?.color_name,
        size: r.sizeDetail?.description,
        stars: r.rating,
        review: r.review,
        images: (r.images || []).map((img: any) => img.img_link)
      }));
    });
  }
}
