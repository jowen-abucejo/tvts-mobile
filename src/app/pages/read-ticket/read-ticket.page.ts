import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, AlertController } from '@ionic/angular';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-read-ticket',
  templateUrl: './read-ticket.page.html',
  styleUrls: ['./read-ticket.page.scss'],
})
export class ReadTicketPage implements OnInit {
  private routeState: any;
  ticket_data: any;
  ticketFormGroup: FormGroup;

  constructor(
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private apiService: ApiService,
    private router: Router,
    private formBuilder: FormBuilder
  ) {
    if (this.router.getCurrentNavigation().extras.state) {
      this.routeState = this.router.getCurrentNavigation().extras.state;
      if (this.routeState.ticket) {
        // check data passed by previous page, if exist fetch and assign to ticket
        this.ticket_data = this.routeState.ticket
          ? JSON.parse(this.routeState.ticket)
          : '';
      }
      console.log(
        '🚀 ~ file: generate-qrcode.page.ts ~ line 21 ~ ReadTicketPage ~ constructor ~ this.ticket_data',
        this.ticket_data
      );
    }
  }

  ngOnInit() {
    if (!this.ticket_data) {
      this.router.navigate(['home'], { replaceUrl: true });
    }
    let comm_violations = [];
    this.ticket_data.violations.forEach((element) => {
      comm_violations.push(element.id + '');
    });
    this.ticketFormGroup = this.formBuilder.group({
      last_name: [this.ticket_data.violator.name[2]],
      first_name: [this.ticket_data.violator.name[0]],
      middle_name: [this.ticket_data.violator.name[1]],
      birth_date: [this.ticket_data.violator.birth_date],
      address: [this.ticket_data.violator.address],
      license_number: [this.ticket_data.violator.license_number],
      vehicle_type: [this.ticket_data.vehicle_type],
      plate_number: [this.ticket_data.plate_number],
      parent_license: [this.ticket_data.violator.parent_and_license],
      licenseIsConfiscated: [
        this.ticket_data.license_is_confiscated ? true : false,
      ],
      vehicle_owner: [this.ticket_data.vehicle_owner],
      owner_address: [this.ticket_data.owner_address],
      vehicleIsImpounded: [
        this.ticket_data.vehicle_is_impounded ? true : false,
      ],
      apprehension_date_time: [this.ticket_data.apprehension_datetime],
      apprehension_place: [this.ticket_data.apprehension_place],
      committed_violations: [comm_violations],
      driverIsUnderProtest: [this.ticket_data.is_under_protest ? true : false],
      mobile_number: [this.ticket_data.violator.mobile_number],
    });
  }
}
