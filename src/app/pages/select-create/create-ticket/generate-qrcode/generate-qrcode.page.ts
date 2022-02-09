import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { FileSharer } from '@byteowls/capacitor-filesharer';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { ViewDidLeave } from '@ionic/angular';
import QRCode from 'easyqrcodejs';
import * as htmlToImage from 'html-to-image';
import { ApiService } from '../../../../services/api.service';

@Component({
  selector: 'app-generate-qrcode',
  templateUrl: './generate-qrcode.page.html',
  styleUrls: ['./generate-qrcode.page.scss'],
})
export class GenerateQrcodePage implements OnInit, AfterViewInit, ViewDidLeave {
  private isSentToServer: boolean = false;
  private filepath: string;
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
  ionViewDidLeave(): void {
    if (this.filepath) {
      Filesystem.deleteFile({
        path: this.filepath,
        directory: Directory.Data,
      }).catch((err) => {});
      this.filepath = null;
    }
  }

  ngOnInit() {}

  @ViewChild('qrcode', { static: false }) qrcode: ElementRef;

  async ngAfterViewInit() {
    //qr code encoded data
    this.qr_text = {
      number: this.ticket_details.number,
      // violator: `${this.ticket_details.violator.first_name} ${this.ticket_details.violator.middle_name} ${this.ticket_details.violator.last_name}`,
      // offense_number: this.ticket_details.offense_number,
      // vehicle_type: this.ticket_details.vehicle_type,
      // apprehension_datetime: this.ticket_details.apprehension_datetime,
      // issued_by: this.ticket_details.issued_by,
      // violations: this.ticket_details.violations,
    };
    // Options for QRCode
    const options = {
      text: JSON.stringify(this.qr_text),
      title: `Ticket ${this.ticket_details.number}`,
      titleColor: 'red',
      titleHeight: 50,
      titleTop: 25,
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
    const image = dataUrl.replace('data:image/png;base64,', '');
    const name = new Date().getTime() + '.jpeg';
    this.filepath = 'temp_qr/' + name;
    const res = await Filesystem.writeFile({
      directory: Directory.Data,
      path: this.filepath,
      data: image,
      recursive: true,
    });

    await FileSharer.share({
      filename: this.filepath,
      base64Data: res.uri,
      contentType: 'image/jpeg',
    }).then(
      () => {},
      (error) => {}
    );
  }

  private async sendToServerAndEmail(ticket_number: string) {
    if (this.isSentToServer) return;

    let blob = await htmlToImage.toBlob(document.getElementById('QRImg'));
    let formData = new FormData();
    formData.append('qrImage', blob);
    await this.apiService
      .sendQRToEmail(ticket_number, formData)
      .then(
        (data: any) => {
          this.isSentToServer = true;
        },
        (res) => {
          this.isSentToServer = false;
        }
      )
      .finally(() => {
        blob = null;
        formData = null;
      });
  }
}
