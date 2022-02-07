import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { FileSharer } from '@byteowls/capacitor-filesharer';
import QRCode from 'easyqrcodejs';
import * as htmlToImage from 'html-to-image';
import { ApiService } from '../../../../services/api.service';

@Component({
  selector: 'app-generate-qrcode',
  templateUrl: './generate-qrcode.page.html',
  styleUrls: ['./generate-qrcode.page.scss'],
})
export class GenerateQrcodePage implements OnInit, AfterViewInit {
  private isSentToServer: boolean = false;
  trigger = false;
  private routeState: any;
  private qr_text: any;
  ticket_details: any;
  penalty_index: number;

  constructor(private router: Router, private apiService: ApiService) {
    if (this.router.getCurrentNavigation().extras.state) {
      this.routeState = this.router.getCurrentNavigation().extras.state;
      if (this.routeState) {
        // check data passed by previous page, if exist fetch and assign to ticket_details
        this.ticket_details = this.routeState.ticket.data
          ? this.routeState.ticket.data
          : '';
      }
      this.penalty_index = parseInt(this.ticket_details.offense_number) - 1;
    }
  }

  ngOnInit() {}

  @ViewChild('qrcode', { static: false }) qrcode: ElementRef;

  async ngAfterViewInit() {
    //qr code encoded data
    this.qr_text = {
      number: this.ticket_details.number,
      violator: `${this.ticket_details.violator.first_name} ${this.ticket_details.violator.middle_name} ${this.ticket_details.violator.last_name}`,
      offense_number: this.ticket_details.offense_number,
      vehicle_type: this.ticket_details.vehicle_type,
      apprehension_datetime: this.ticket_details.apprehension_datetime,
      issued_by: this.ticket_details.issued_by,
      violations: this.ticket_details.violations,
    };
    // Options for QRCode
    const options = {
      text: JSON.stringify(this.qr_text),
      title: `Ticket ${this.ticket_details.number}`,
      titleColor: 'red',
      titleHeight: 50,
      titleTop: 25,
      // subTitle: `Issued by: ${this.ticket_details.issued_by}`,
      // subTitleTop: 43,
      quietZone: 10,
      quietZoneColor: 'white',
      width: 250,
      height: 250,
      onRenderingEnd: (q, o) => {
        setTimeout(() => {
          this.sendToServerAndEmail(this.qr_text.number);
        }, 1000);
      },
    };

    // Create new QRCode Object
    new QRCode(this.qrcode.nativeElement, options);
  }

  async shareQRCode() {
    const dataUrl = await htmlToImage.toJpeg(document.getElementById('QRImg'), {
      quality: 0.95,
    });

    // .then(async function (dataURL) {
    //   const image = dataURL.replace('data:image/jpeg;base64,', '');
    //   await FileSharer.share({
    //     filename: 'Ticket.jpeg',
    //     base64Data: image,
    //     contentType: 'image/jpeg',
    //   })
    //     .then(() => {})
    //     .catch((error) => {});
    // });
    const image = dataUrl.replace('data:image/png;base64,', '');
    await FileSharer.share({
      filename: 'Ticket.jpeg',
      base64Data: image,
      contentType: 'image/jpeg',
    })
      .then(() => {})
      .catch((error) => {});
  }

  private async sendToServerAndEmail(ticket_number: string) {
    if (this.isSentToServer) return;

    const blob = await htmlToImage.toBlob(document.getElementById('QRImg'));
    const formData = new FormData();
    formData.append('qrImage', blob);
    await this.apiService.sendQRToEmail(ticket_number, formData).then(
      (data: any) => {
        this.isSentToServer = true;
      },
      (res) => {
        this.isSentToServer = false;
      }
    );
  }
}
