import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import cordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import { BehaviorSubject, from, of } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
export const TOKEN_KEYS = {
  TYPE: 'type',
  TOKEN: 'token',
  REFRESH: 'refresh',
  VALIDITY: 'expired_at',
};

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private isReady = new BehaviorSubject(false);
  private _storage: Storage | null = null;

  constructor(private storage: Storage | null = null) {
    this.init();
  }

  async init() {
    // If using, define drivers here: await this.storage.defineDriver(/*...*/);
    await this.storage.defineDriver(cordovaSQLiteDriver);
    const storage1 = await this.storage.create();
    this._storage = storage1;

    this.isReady.next(true);
  }

  // Create and expose methods that users of this service can
  public get(key: string) {
    return this.isReady.pipe(
      filter((ready) => ready),
      switchMap((_) => {
        return from(this._storage.get(key)) || of([]);
      })
    );
  }

  public async set(key: string, value: any) {
    await this._storage.set(key, value);
  }

  public async remove(key: string) {
    await this._storage.remove(key);
  }
}
