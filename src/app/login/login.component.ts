import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AdminService } from '../admin.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit{
  loginForm: FormGroup;
  errorMessage: string = '';
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    private adminService: AdminService
  ) {
    this.loginForm = this.fb.group({
      mobileNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const adminLoggin = localStorage.getItem("employeeId");
    if(adminLoggin){
      this.router.navigate(['/dashboard']);
    } else {
      console.log("Please Login")
    }
  }

  login() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const payload = {
      mobile_no: this.loginForm.value.mobileNumber,
      password: this.loginForm.value.password,
      role: 'ADMIN'
    };

    this.adminService.loginUser(payload).subscribe({
      next: (res) => {
        this.loading = false;
        if (res && res.status === true) {
          this.toastr.success(res.message, 'Success');
          
          // Optionally store user data
          localStorage.setItem('adminData', JSON.stringify(res.response));
          localStorage.setItem('employeeId', res.response.user_id);
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = res.message || 'Login failed';
          this.toastr.error(this.errorMessage, 'Error');
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = 'Server error, please try again later';
        this.toastr.error(this.errorMessage, 'Error');
        console.error('Login error:', err);
      }
    });
  }

  togglePasswordVisibility() {
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    const eyeIcon = document.getElementById('eyeIcon') as HTMLElement;

    if (eyeIcon) {
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.classList.remove('fa-eye');
        eyeIcon.classList.add('fa-eye-slash');
      } else {
        passwordInput.type = 'password';
        eyeIcon.classList.remove('fa-eye-slash');
        eyeIcon.classList.add('fa-eye');
      }
    }
  }
}
