import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  constructor(
    private auth: AuthenticationService,
    private router: Router,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {}

  async logout() {
    const loading = await this.loadingCtrl.create();
    await loading.present();
    this.auth.logout();
    await loading.dismiss();
    this.router.navigateByUrl('login', { replaceUrl: true });
  }
}
