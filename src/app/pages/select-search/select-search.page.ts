import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { UtilityService } from '../../services/utility.service';
import { ApiService } from '../../services/api.service';
import { ViewWillLeave } from '@ionic/angular';

@Component({
  selector: 'app-select-search',
  templateUrl: './select-search.page.html',
  styleUrls: ['./select-search.page.scss'],
})
export class SelectSearchPage implements OnInit, OnDestroy, ViewWillLeave {
  searchFormGroup = new FormGroup({
    ticket_number: new FormControl('', [Validators.required]),
  });
  isScanning = false;
  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private utility: UtilityService
  ) {}

  ionViewWillLeave(): void {
    this.stopQRScan();
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.stopQRScan();
  }

  //start qr scan and then fetch ticket details
  async scanQRSearch() {
    const allowed = await this.checkPermission();

    if (allowed) {
      this.isScanning = true;
      const result = await BarcodeScanner.startScan();
      document.body.classList.add('qrscanner');
      if (result.hasContent) {
        this.isScanning = false;
        document.body.classList.remove('qrscanner');
        const qr_text = JSON.parse(result.content);
        this.searchTicket(qr_text.number);
      }
    } else {
      const alert = await this.utility.alertMessage(
        'Failed to Open Camera!',
        'Please try searching by ticket number.'
      );
      await alert.present();
    }
  }

  async searchTicket(
    ticket_number: string = this.searchFormGroup.get('ticket_number').value
  ) {
    const loading = await this.utility.createIonLoading();
    await loading.present();
    let err = false;
    let state: any = await this.apiService
      .getTicketDetails(ticket_number)
      .catch(async (res) => {
        loading.dismiss();
        err = await this.utility.alertErrorStatus(res);
      });
    if (!err) {
      if (!state || !state.data) {
        loading.dismiss();
        const alertMessage = await this.utility.alertMessage(
          'No Match Found',
          `Ticket ${ticket_number} doesn't exist.`
        );
        alertMessage.present();
      } else {
        loading.dismiss();
        this.router.navigate(['read-ticket'], {
          relativeTo: this.route,
          state: { ticket: JSON.stringify(state.data) },
        });
      }
    }
  }

  //permission check to scan qrcode
  private async checkPermission() {
    return new Promise(async (resolve, reject) => {
      const status = await BarcodeScanner.checkPermission({
        force: true,
      }).catch(() => {
        return { granted: false, denied: false };
      });
      if (status.granted) {
        resolve(true);
      } else if (status.denied) {
        const options = {
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
        };
        const alertChangeSettings = await this.utility.alertMessage(
          'No Permission',
          'Please allow camera access in your settings',
          options
        );
        await alertChangeSettings.present();
      } else {
        resolve(false);
      }
    });
  }

  stopQRScan() {
    BarcodeScanner.stopScan().then(
      () => {},
      () => {}
    );
    this.isScanning = false;
    document.body.classList.remove('qrscanner');
  }
}
