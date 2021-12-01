import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthenticationService } from './authentication.service';

const domain = 'https://dry-citadel-29932.herokuapp.com'; //heroku server
// const domain = 'https://tvts-qrsms.000webhostapp.com'; //000webhost server
// const domain = 'http://127.0.0.1:8000'; //local server
// const domain = 'http://10.0.2.2:8000'; // for android emulator
export const API_URL = {
  REQUEST_TOKEN: `${domain}/api/users/user/login`,
  REQUEST_LOGOUT: `${domain}/api/v1/users/user/logout`,
  GROUPED_VIOLATIONS_AND_VEHICLE_TYPES: `${domain}/api/v1/violations/types/by-vehicle-types`,
  // TEST_ADD_VIOLATION_TYPES: `${domain}/api/violations/types/new`,
  // TEST_ADD_VIOLATION: `${domain}/api/violations/new`,
  GET_ONE_VIOLATOR: `${domain}/api/v1/violators/violator`,
  STORE_TICKET_DETAILS: `${domain}/api/v1/tickets/new`,
  GET_ONE_TICKET: `${domain}/api/v1/tickets/ticket`,
};
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient, private auth: AuthenticationService) {}

  getViolatorDetails(license_number: any) {
    return this.http
      .get(API_URL.GET_ONE_VIOLATOR, {
        headers: this.auth.createHeaderWithToken(),
        params: {
          license_number,
        },
      })
      .toPromise();
  }

  getViolationsByVehicleType() {
    return this.http.get(API_URL.GROUPED_VIOLATIONS_AND_VEHICLE_TYPES, {
      headers: this.auth.createHeaderWithToken(),
    });
  }

  saveTicket(details: FormData) {
    return this.http.post(API_URL.STORE_TICKET_DETAILS, details, {
      headers: this.auth.createHeaderWithToken(),
    });
  }

  getTicketDetails(ticket_number: any) {
    return this.http
      .get(API_URL.GET_ONE_TICKET, {
        headers: this.auth.createHeaderWithToken(),
        params: {
          ticket_number,
        },
      })
      .toPromise();
  }
}
