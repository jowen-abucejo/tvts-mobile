import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { map, take } from 'rxjs/operators';
import { API_URL } from 'src/app/services/api.service';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'app-create-ticket',
  templateUrl: './create-ticket.page.html',
  styleUrls: ['./create-ticket.page.scss'],
})
export class CreateTicketPage implements OnInit {
  violations = [];
  vehicle_types = [];
  selectViolations = [];
  ticketFormGroup: FormGroup = new FormGroup({
    last_name: new FormControl(),
    first_name: new FormControl(),
    middle_name: new FormControl(),
    birth_date: new FormControl(),
    address: new FormControl(),
    license_number: new FormControl(),
    vehicle_type: new FormControl(),
    plate_number: new FormControl(),
    parent_license: new FormControl(),
    licenseIsConfiscated: new FormControl(),
    vehicle_owner: new FormControl(),
    owner_address: new FormControl(),
    vehicleIsImpounded: new FormControl(),
    apprehension_date_time: new FormControl(),
    apprehension_place: new FormControl(),
    committed_violations: new FormControl(),
  });

  constructor(
    private http: HttpClient,
    private loadingCtrl: LoadingController,
    private auth: AuthenticationService,
    private router: Router
  ) {}

  ngOnInit() {
    console.log(JSON.stringify(this.auth.token));
    console.log(Date.now());
    this.http
      .get(API_URL.GROUPED_VIOLATIONS_AND_VEHICLE_TYPES, {
        headers: this.auth.createHeaderWithToken(),
      })
      .pipe(take(1))
      .subscribe((data: any) => {
        this.violations = data.violations;
        this.vehicle_types = data.vehicle_types;
      });
  }

  createTicket() {
    console.log(this.violations);
    console.log(this.vehicle_types);
  }

  changeSelectViolations() {
    this.selectViolations =
      this.violations[this.ticketFormGroup.get('vehicle_type').value];
    console.log(
      '🚀 ~ file: create-ticket.page.ts ~ line 66 ~ CreateTicketPage ~ changeSelectViolations ~ violations',
      this.selectViolations
    );
  }
}
