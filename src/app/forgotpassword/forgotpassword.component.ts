import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../admin.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-forgotpassword',
  templateUrl: './forgotpassword.component.html',
  styleUrl: './forgotpassword.component.css',
  standalone: false
})
export class ForgotpasswordComponent {
  currentStep = 1;
  forgotPasswordForm: FormGroup;
  otpForm: FormGroup;
  passwordForm: FormGroup;

  verifiedEmail = '';
  adminMobile = ''; // You can optionally fetch it if needed
  adminRole = 'ADMIN';
showPassword: boolean = false;
showConfirmPassword: boolean = false;
sentOtp: string = ''; // store OTP received from backend

togglePasswordVisibility(field: 'password' | 'confirmPassword'): void {
  if (field === 'password') {
    this.showPassword = !this.showPassword;
  } else if (field === 'confirmPassword') {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}

  constructor(
    private fb: FormBuilder,
    private service: AdminService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.forgotPasswordForm = this.fb.group({
      mailTo: ['', [Validators.required, Validators.email]]
    });

    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });

    this.passwordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {}

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    if (password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ mismatch: true });
    } else {
      form.get('confirmPassword')?.setErrors(null);
    }
    return null;
  }

  // Step 1: Send Email
onEmailSubmit() {
  if (this.forgotPasswordForm.valid) {
    const email = this.forgotPasswordForm.value.mailTo;
    this.verifiedEmail = email;

    this.service.sendEmailToAdmin(email).subscribe({
      next: (res) => {
        console.log('Admin OTP Response:', res);

        if (res?.status) {
          this.sentOtp = res.response;  // <-- Save the OTP for later comparison
          this.toastr.success(res.message || 'OTP sent', 'Success');
          this.currentStep = 2;
        } else {
          this.toastr.error(res.message || 'Failed to send OTP', 'Error');
        }
      },
      error: () => {
        this.toastr.error('Failed to send OTP email', 'Error');
      }
    });
  }
}


  // Step 2: Verify OTP
  onOtpSubmit() {
  if (this.otpForm.valid) {
    const enteredOtp = this.otpForm.value.otp;
    if (enteredOtp == this.sentOtp) {
      this.toastr.success('OTP Verified', 'Success');
      this.currentStep = 3;
    } else {
      this.toastr.error('Incorrect OTP', 'Error');
    }
  } else {
    this.toastr.error('Please enter valid OTP', 'Error');
  }
}

  // Step 3: Reset Password
  onPasswordSubmit() {
    if (this.passwordForm.valid) {
      const password = this.passwordForm.value.password;

      const payload = {
        mobile_no: this.adminMobile, // Can be blank or fetched if needed
        email: this.verifiedEmail,
        password: password,
        role: this.adminRole
      };

      this.service.resetAdminPassword(payload).subscribe({
        next: (res) => {
          if (res?.status) {
            this.toastr.success(res.message || 'Password reset success', 'Success');
            setTimeout(() => this.router.navigate(['/login']), 1500);
          } else {
            this.toastr.error(res.message || 'Failed to reset password', 'Error');
          }
        },
        error: () => {
          this.toastr.error('Error occurred while resetting password', 'Error');
        }
      });
    } else {
      this.toastr.error('Please enter valid password details', 'Error');
    }
  }
}
