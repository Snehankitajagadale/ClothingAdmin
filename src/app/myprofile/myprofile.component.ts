import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AdminService } from '../admin.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-myprofile',
  templateUrl: './myprofile.component.html',
  styleUrls: ['./myprofile.component.css'],
  standalone: false
})
export class MyprofileComponent {

   editMode: boolean = false;

    profile = {
    image: 'assets/Pro.jpg',
    name: 'John Doe',
    email: 'john@example.com',
    mobile: '9876543210'
  };

    constructor(private toastr: ToastrService) {}

  toggleEdit() {
    this.editMode = !this.editMode;
  }

  saveProfile() {
    // Simulate save logic (e.g., API call)
    console.log('Profile saved:', this.profile);

    this.toastr.success('Profile updated successfully!', 'Success');
    this.editMode = false;
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.profile.image = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

}