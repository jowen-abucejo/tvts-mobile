import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loginFormGroup = new FormGroup({
    unameCtrl: new FormControl('', Validators.required),
    passCtrl: new FormControl('', Validators.required),
  });

  constructor(
    private auth: AuthenticationService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {}

  async login() {
    const loading = await this.loadingCtrl.create();
    await loading.present();

    this.auth
      .login(
        this.loginFormGroup.get('unameCtrl').value,
        this.loginFormGroup.get('passCtrl').value
      )
      .subscribe(
        //redirect on successful login
        async (res) => {
          await loading.dismiss();
          this.router.navigateByUrl('home', { replaceUrl: true });
        },

        //show error message
        async (res) => {
          await loading.dismiss();
          const alert = await this.alertCtrl.create({
            header: 'Login Failed',
            buttons: ['OK'],
          });
          console.log(res);
          alert.present();
        }
      );
  }
}
