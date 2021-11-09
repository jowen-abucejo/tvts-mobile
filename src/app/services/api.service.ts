import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';

const domain = 'https://dry-citadel-29932.herokuapp.com';
export const API_URL = {
  REQUEST_TOKEN: domain + '/oauth/token',
  GROUPED_VIOLATIONS_AND_VEHICLE_TYPES:
    domain + '/api/v1/violations/types/vehicle-types',
  TEST_ADD_VIOLATION_TYPES: domain + '/api/violations/types/new',
  TEST_ADD_VIOLATION: domain + '/api/violations/new',
};
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient, private storage: StorageService) {}
}
