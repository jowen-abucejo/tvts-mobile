import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, from } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { StorageService, TOKEN_KEYS } from './storage.service';
export class TokenModel {
  access_token: string | null = '';
  refresh_token: string | null = '';
  token_type: string | null = '';
  expired_at: number | null = null;
}

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  isAuthenticated: BehaviorSubject<boolean> = new BehaviorSubject(null);
  public token: TokenModel = new TokenModel();

  constructor(private http: HttpClient, private storage: StorageService) {
    this.loadToken();
  }

  createHeaderWithToken(token: string) {
    const header = new HttpHeaders({
      Accept: 'application/json',
      Authorization: 'Bearer ' + token,
    });
    return header;
  }

  createHeaderWithOutToken() {
    const header = new HttpHeaders({
      Accept: 'application/json',
    });
    return header;
  }

  createRequestBody(username: string, password: string) {
    const body = {
      grant_type: 'password',
      client_id: '2',
      client_secret: 'efvxL94yuz0gtO4LjYFWjQO0g9VeQSdLRlZpXdLf',
      username: username,
      password: password,
      scope: '',
    };
    return body;
  }

  async loadToken() {
    this.token.access_token = await this.storage
      .get(TOKEN_KEYS.TOKEN)
      .pipe(take(1))
      .toPromise();
    this.token.refresh_token = await this.storage
      .get(TOKEN_KEYS.REFRESH)
      .pipe(take(1))
      .toPromise();
    this.token.token_type = await this.storage
      .get(TOKEN_KEYS.TYPE)
      .pipe(take(1))
      .toPromise();
    this.token.expired_at = await this.storage
      .get(TOKEN_KEYS.VALIDITY)
      .pipe(take(1))
      .toPromise();
    if (
      (this.token.access_token !== null || '') &&
      this.token.expired_at > Date.now()
    ) {
      this.isAuthenticated.next(true);
    } else {
      if (
        (this.token.access_token !== '' || null) &&
        this.token.expired_at < Date.now()
      ) {
        this.storage.remove(TOKEN_KEYS.TOKEN);
        this.storage.remove(TOKEN_KEYS.REFRESH);
        this.storage.remove(TOKEN_KEYS.VALIDITY);
        this.storage.remove(TOKEN_KEYS.TYPE);
      }
      this.isAuthenticated.next(false);
    }
  }

  login(username: string, password: string) {
    return this.http
      .post(
        'http://127.0.0.1:8000/oauth/token',
        this.createRequestBody(username, password),
        {
          headers: this.createHeaderWithOutToken(),
        }
      )
      .pipe(
        take(1),
        map((data: any) => {
          return data;
        }),
        switchMap((data) => {
          this.storage.set(TOKEN_KEYS.TOKEN, data.access_token);
          this.storage.set(TOKEN_KEYS.TYPE, data.token_type);
          this.storage.set(TOKEN_KEYS.REFRESH, data.refresh_token);
          this.storage.set(TOKEN_KEYS.VALIDITY, Date.now() + data.expires_in);
          return from(this.loadToken());
        }),
        tap((_) => {
          this.isAuthenticated.next(true);
        })
      );
  }

  logout() {
    this.storage.remove(TOKEN_KEYS.TOKEN);
    this.storage.remove(TOKEN_KEYS.REFRESH);
    this.storage.remove(TOKEN_KEYS.VALIDITY);
    this.storage.remove(TOKEN_KEYS.TYPE);
    this.isAuthenticated.next(false);
    return true;
  }
}
