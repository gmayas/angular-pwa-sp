import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs/operators';
import * as _ from "lodash";

// import custom validator to validate that password and confirm password fields match
import { MustMatch } from '../../modules/must-match.validator';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  loading = false;
  submitted = false;

  constructor(public auth: AuthService, private formBuilder: FormBuilder, private route: ActivatedRoute,
    private router: Router, private toastr: ToastrService) { }

  ngOnInit(): void {

    //emailuser, nameuser, passworduser, typeiduser
    this.registerForm = this.formBuilder.group({
      emailuser: ['', [Validators.required, Validators.email]],
      nameuser: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      typeiduser: [2, Validators.required]
    }, {
      validator: MustMatch('password', 'confirmPassword')
    });
  }

   // convenience getter for easy access to form fields
   get f(): any { return this.registerForm.controls; }

   onSubmit() {
       this.submitted = true;
       this.loading = true;

       // stop here if form is invalid
       if (this.registerForm.invalid) {
           return;
       }

       console.log('this.registerForm.value: ', this.registerForm.value);

       this.auth.register(this.registerForm.value)
           .pipe(first())
           .subscribe(
               data => {
                   console.log('data: ', data)
                   this.toastr.success('Hello welcome '+ _.get(data,'nameuser'), 'Aviso de Angular 9', {
                       timeOut: 10000,
                       positionClass: 'toast-bottom-right'
                   });
                   this.router.navigate(['catalogo']);
               },
               error => {
                   //this.router.navigate(['']);
                   this.toastr.error('Error register: ' + _.get(error,'error'), 'Aviso de Angular 9', {
                       timeOut: 10000,
                       positionClass: 'toast-bottom-right'
                   })
                   console.log('error Register: ', error)
                   this.onReset();
               });
   }

   onReset() {
       this.submitted = false;
       this.loading = false;
       this.registerForm.reset();
   }

}
