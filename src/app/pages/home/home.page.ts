import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { AlertController, LoadingController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  isScanning: boolean = false;

  constructor(
    private auth: AuthenticationService,
    private apiService: ApiService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {}
  ngOnDestroy() {
    this.stopQRScan();
  }

  async logout() {
    const loading = await this.loadingCtrl.create();
    await loading.present();
    this.auth.logout(); //revoke token on api server
    await loading.dismiss();
    this.router.navigateByUrl('login', { replaceUrl: true });
  }

  //show alert to search for violator details with the given license number
  async promptLicenseNumberField() {
    const alert = await this.alertCtrl.create({
      header: "Driver's  License Number",
      inputs: [
        {
          name: 'license_number',
          placeholder: 'Enter License Number',
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Next',
          handler: async (alertData) => {
            const loading = await this.loadingCtrl.create();
            await loading.present();
            let state;
            if (alertData.license_number) {
              state = await this.apiService.getViolatorDetails(
                alertData.license_number
              );
            }
            if (!state) {
              state = {
                data: { license_number: alertData.license_number },
              };
            }
            await loading.dismiss();
            this.router.navigate(['create-ticket'], {
              state: { violator: JSON.stringify(state.data) },
            });
          },
        },
      ],
    });
    await alert.present();
  }

  //show alert to search for ticket details with the given ticket number
  async promptTicketNumberField() {
    const alert = await this.alertCtrl.create({
      header: 'Citation Ticket Number',
      inputs: [
        {
          name: 'ticket_number',
          placeholder: 'Enter Ticket Number',
          type: 'number',
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Next',
          handler: async (alertData) => {
            const loading = await this.loadingCtrl.create();
            await loading.present();
            let state;
            if (alertData.ticket_number) {
              state = await this.apiService.getTicketDetails(
                alertData.ticket_number
              );
            }
            if (!state) {
              const alertMessage = await this.alertCtrl.create({
                header: 'No match found',
                message: 'Ticket #' + alertData.ticket_number + " don't exist!",
              });
              await loading.dismiss();
              alertMessage.present();
            } else {
              await loading.dismiss();
              this.router.navigate(['read-ticket'], {
                state: { ticket: JSON.stringify(state.data) },
              });
            }
          },
        },
      ],
    });
    await alert.present();
  }

  //start qr scan and then fetch ticket details
  async scanQRSearch() {
    const allowed = await this.checkPermission();

    if (allowed) {
      this.isScanning = true;
      const result = await BarcodeScanner.startScan();
      if (result.hasContent) {
        this.isScanning = false;

        // this.router.navigate(['read-ticket'], {
        //   state: { ticket: JSON.stringify(result.content) },
        // });

        const loading = await this.loadingCtrl.create();
        await loading.present();
        let state;
        state = await this.apiService.getTicketDetails(result.content);
        if (!state) {
          const alertMessage = await this.alertCtrl.create({
            header: 'No match found',
            message: 'Ticket ' + result.content + " don't exist!",
          });
          await loading.dismiss();
          alertMessage.present();
        } else {
          await loading.dismiss();
          this.router.navigate(['read-ticket'], {
            state: { ticket: JSON.stringify(state.data) },
          });
        }
      }
    }
  }

  //permission check to scan qrcode
  private async checkPermission() {
    return new Promise(async (resolve, reject) => {
      const status = await BarcodeScanner.checkPermission({ force: true });
      if (status.granted) {
        resolve(true);
      } else if (status.denied) {
        const alertChangeSettings = await this.alertCtrl.create({
          header: 'No Permission',
          message: 'Please allow camera access in your settings',
          buttons: [
            {
              text: 'No',
              role: 'cancel',
            },
            {
              text: 'Open Settings',
              handler: () => {
                BarcodeScanner.openAppSettings();
                resolve(false);
              },
            },
          ],
        });
        await alertChangeSettings.present();
      } else {
        resolve(false);
      }
    });
  }

  stopQRScan() {
    BarcodeScanner.stopScan();
    this.isScanning = false;
  }
}
