import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { API_URL } from 'src/app/services/api.service';
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
    private loadingCtrl: LoadingController,
    private http: HttpClient
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
