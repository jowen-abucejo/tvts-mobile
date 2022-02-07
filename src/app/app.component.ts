import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';
import { AlertController, LoadingController, Platform } from '@ionic/angular';
import { AuthenticationService } from './services/authentication.service';
import { registerPlugin } from '@capacitor/core';

export interface CustomPlugin {
  restart(type: string): void;
}

const RestartPlugin = registerPlugin<CustomPlugin>('RestartPlugin');

export default RestartPlugin;
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  isAuthenticated = false;

  constructor(
    private loadingController: LoadingController,
    private auth: AuthenticationService,
    private router: Router,
    private platform: Platform,
    private alertController: AlertController
  ) {
    router.events.subscribe((url: any) => {
      this.isAuthenticated =
        router.url !== '/login' && router.url !== '/settings';
    });
    this.platform.backButton.subscribeWithPriority(-1, (processNextHandler) => {
      const url = this.router.url;
      if (url === '/home' || url === '/login' || url === '/intro') {
        this.router.navigate(['/tabs/home']);
        this.showConfirmExit();
        processNextHandler();
      }
    });

    this.platform.backButton.subscribeWithPriority(-2, () => {
      const url = this.router.url;
      if (url === '/home' || url === '/login' || url === '/intro') {
        this.alertController
          .getTop()
          .then((alert) => {
            if (alert) {
              alert.dismiss();
              App.exitApp();
            }
          })
          .catch((res) => {});
      }
    });
  }

  async logout() {
    const loading = await this.loadingController.create({
      spinner: 'bubbles',
      message: 'Please wait...',
    });
    await loading.present();
    await this.auth.logout().catch((err) => {}); //revoke token on api server
    await loading.dismiss();
    this.router.navigateByUrl('login', { replaceUrl: true });
  }

  async showConfirmExit() {
    const alert = await this.alertController.create({
      header: 'Exit App',
      message: 'Are you sure to close the app?',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Stay',
          role: 'cancel',
          handler: () => {
            console.log('Application exit prevented!');
          },
        },
        {
          text: 'Exit',
          handler: () => {
            App.exitApp();
          },
        },
      ],
    });

    await alert.present();
  }
}
