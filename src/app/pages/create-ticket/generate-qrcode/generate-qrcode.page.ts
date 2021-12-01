import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FileSharer } from '@byteowls/capacitor-filesharer';
import QRCode from 'easyqrcodejs';
@Component({
  selector: 'app-generate-qrcode',
  templateUrl: './generate-qrcode.page.html',
  styleUrls: ['./generate-qrcode.page.scss'],
})
export class GenerateQrcodePage implements OnInit {
  private canvas: any;
  private routeState: any;
  ticket_details: any;

  constructor(private router: Router) {
    if (this.router.getCurrentNavigation().extras.state) {
      this.routeState = this.router.getCurrentNavigation().extras.state;
      if (this.routeState) {
        // check data passed by previous page, if exist fetch and assign to ticket_details
        this.ticket_details = this.routeState.ticket.data
          ? this.routeState.ticket.data
          : '';
      }
      // console.log(
      //   '🚀 ~ file: generate-qrcode.page.ts ~ line 21 ~ GenerateQrcodePage ~ constructor ~ this.ticket_details',
      //   this.ticket_details
      // );
    }
  }

  ngOnInit() {}

  @ViewChild('qrcode', { static: false }) qrcode: ElementRef;

  ngAfterViewInit() {
    // Options
    var options = {
      // text: JSON.stringify(this.ticket_details),
      text: this.ticket_details.number,
      title: `Ticket ${this.ticket_details.number}`,
      titleColor: 'red',
      titleHeight: 50,
      titleTop: 25,
      subTitle: `Issued by: ${this.ticket_details.issued_by}`,
      subTitleTop: 43,
      quietZone: 10,
      quietZoneColor: 'white',
      width: 400,
      height: 400,
    };

    // Create new QRCode Object
    new QRCode(this.qrcode.nativeElement, options);
  }

  async shareQRCode() {
    this.canvas = document.getElementById('QRImg').firstElementChild;
    const dataURL = this.canvas.toDataURL();
    const image = dataURL.replace('data:image/png;base64,', '');
    await FileSharer.share({
      filename: 'Ticket.jpeg',
      base64Data: image,
      contentType: 'image/jpeg',
    })
      .then(() => {})
      .catch((error) => {});
  }
}
