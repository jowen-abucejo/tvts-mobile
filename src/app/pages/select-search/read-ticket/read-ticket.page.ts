import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
@Component({
  selector: 'app-read-ticket',
  templateUrl: './read-ticket.page.html',
  styleUrls: ['./read-ticket.page.scss'],
})
export class ReadTicketPage implements OnInit {
  private routeState: any;
  ticket_data: any;
  ticketFormGroup: FormGroup;
  public extra_inputs = {
    ext_violators: <any>[],
    ext_tickets: <any>[],
  };

  constructor(private router: Router, private formBuilder: FormBuilder) {
    if (this.router.getCurrentNavigation().extras.state) {
      this.routeState = this.router.getCurrentNavigation().extras.state;
      if (this.routeState.ticket) {
        // check data passed by previous page, if exist fetch and assign to ticket_data
        this.ticket_data = this.routeState.ticket
          ? JSON.parse(this.routeState.ticket)
          : '';
      }
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
      last_name: [this.ticket_data.violator.last_name],
      first_name: [this.ticket_data.violator.first_name],
      middle_name: [
        this.ticket_data.violator.middle_name != 'null'
          ? this.ticket_data.violator.middle_name
          : '',
      ],
      birth_date: [this.ticket_data.violator.birth_date],
      license_number: [
        this.ticket_data.violator.license_number != 'null'
          ? this.ticket_data.violator.license_number
          : '',
      ],
      vehicle_type: [this.ticket_data.vehicle_type],
      apprehension_datetime: [this.ticket_data.apprehension_datetime],
      issued_by: [this.ticket_data.issued_by],
      committed_violations: [comm_violations],
    });
    this.attachExtraProperties();
  }

  attachExtraProperties() {
    //fetch extra details needed for violator
    this.ticket_data.violator.extra_properties.forEach((extra_input) => {
      this.ticketFormGroup.addControl(
        extra_input.propertyDescription.property,
        new FormControl(
          extra_input.property_value != 'null' ? extra_input.property_value : ''
        )
      );
    });
    this.ticket_data.extra_properties.forEach((extra_input) => {
      this.ticketFormGroup.addControl(
        extra_input.propertyDescription.property,
        new FormControl(
          extra_input.property_value != 'null' ? extra_input.property_value : ''
        )
      );
    });
  }
}
