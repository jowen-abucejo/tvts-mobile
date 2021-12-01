import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, from } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { API_URL } from './api.service';
import { StorageService, TOKEN_KEY } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  isAuthenticated: BehaviorSubject<boolean> = new BehaviorSubject(null);
  public token: any = {};

  constructor(private http: HttpClient, private storage: StorageService) {
    this.loadToken();
  }

  createHeaderWithToken() {
    const header = new HttpHeaders({
      Accept: 'application/json',
      Authorization: `${this.token.data.token_type} ${this.token.data.access_token}`,
    });
    return header;
  }

  createHeaderWithOutToken() {
    const header = new HttpHeaders({
      Accept: 'application/json',
    });
    return header;
  }

  private createRequestBody(username: string, password: string) {
    const body = {
      username: username,
      password: password,
    };
    return body;
  }

  async loadToken() {
    this.token = await this.storage.get(TOKEN_KEY).pipe(take(1)).toPromise();
    if (this.token !== null && this.token.expired_at > Date.now()) {
      this.isAuthenticated.next(true);
    } else {
      this.logout();
    }
  }

  login(username: string, password: string) {
    return this.http
      .post(API_URL.REQUEST_TOKEN, this.createRequestBody(username, password), {
        headers: this.createHeaderWithOutToken(),
      })
      .pipe(
        take(1),
        map((data: any) => {
          return data;
        }),
        switchMap(async (data) => {
          await this.storage.set(TOKEN_KEY, {
            data,
            expired_at: Date.now() + data.expires_in,
          });
          return from(this.loadToken());
        }),
        tap((_) => {
          this.isAuthenticated.next(true);
        })
      );
  }

  logout() {
    if (this.token) {
      this.http.post(
        API_URL.REQUEST_LOGOUT,
        {},
        {
          headers: this.createHeaderWithToken(),
        }
      );
    }
    this.storage.remove(TOKEN_KEY);
    this.isAuthenticated.next(false);
  }
}
