import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs/operators';
import * as _ from "lodash";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  submitted = false;

  constructor(public auth: AuthService, private formBuilder: FormBuilder, private route: ActivatedRoute,
    private router: Router, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      emailuser: ['', Validators.required],
      passworduser: ['', Validators.required]
    });
  }
   // convenience getter for easy access to form fields
   get f() { return this.loginForm.controls; }

  onSubmit() {
    try {
      this.submitted = true;
      // stop here if form is invalid
      if (this.loginForm.invalid) {
        //console.log('this.loginForm.invalid: ', this.loginForm.invalid)
        return;
      }
      //
      this.loading = true;
      //console.log(this.f.emailuser.value, this.f.passworduser.value);
      this.auth.login(this.f.emailuser.value, this.f.passworduser.value)
        .pipe(first())
        .subscribe(
          data => {
            //console.log('data: ', data)
            this.toastr.success('Hello welcome ' + _.get(data,'nameuser'), 'Aviso de Angular 9', {
              timeOut: 10000,
              positionClass: 'toast-bottom-right'
            });
            this.router.navigate(['catalogo']);
          },
          error => {
            this.toastr.error('Error login', 'Aviso de Angular 9', {
              timeOut: 10000,
              positionClass: 'toast-bottom-right'
            });
            //console.log('error Login: ', error)
            this.loginForm.reset();
            this.submitted = true;
            this.loading = false;
          });
    }
    catch (e) {
      console.error(e);
    }
  }

  register() {
    this.router.navigate(['register']);
  }

}
