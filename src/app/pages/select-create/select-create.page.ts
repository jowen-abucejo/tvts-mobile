import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UtilityService } from '../../services/utility.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-select-create',
  templateUrl: './select-create.page.html',
  styleUrls: ['./select-create.page.scss'],
})
export class SelectCreatePage implements OnInit {
  createFormGroup1: FormGroup;
  createFormGroup2: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private utility: UtilityService
  ) {}

  ngOnInit() {
    this.createFormGroup1 = this.formBuilder.group({
      license_number: ['', [Validators.required]],
    });
    this.createFormGroup2 = this.formBuilder.group({
      first_name: [
        '',
        [Validators.required, Validators.pattern('[a-zA-ZÑñ ]*')],
      ],
      middle_name: [
        '',
        [Validators.required, Validators.pattern('[a-zA-ZÑñ ]*')],
      ],
      last_name: [
        '',
        [Validators.required, Validators.pattern('[a-zA-ZÑñ ]*')],
      ],
      birth_date: ['', [Validators.required]],
    });
  }

  async createTicket(index: number) {
    if (index === 1) {
      const fallbackData = {
        license_number: this.createFormGroup1.get('license_number').value,
        tickets_count: 0,
      };
      let formData = new FormData();
      for (const key in this.createFormGroup1.value) {
        formData.append(key, this.createFormGroup1.get(key).value);
      }
      await this.searchViolator(formData, fallbackData);
    }
    if (index === 2) {
      const f = this.createFormGroup2.get('first_name').value + '';
      const m = this.createFormGroup2.get('middle_name').value + '';
      const l = this.createFormGroup2.get('last_name').value + '';
      const fallbackData = {
        first_name: f.trim(),
        middle_name: m.trim(),
        last_name: l.trim(),
        birth_date: this.createFormGroup2.get('birth_date').value,
        tickets_count: 0,
      };
      let formData = new FormData();
      for (const key in this.createFormGroup2.value) {
        formData.append(key, this.createFormGroup2.get(key).value);
      }
      await this.searchViolator(formData, fallbackData);
    }
  }

  async searchViolator(formData: FormData, fallbackData: {}) {
    const loading = await this.utility.createIonLoading();
    await loading.present();
    let err = false;
    let state: any = await this.apiService
      .getViolatorDetails(formData)
      .catch(async (res) => {
        loading.dismiss();
        err = await this.utility.alertErrorStatus(res);
      });
    if (!state || !state.data) {
      state = {
        data: fallbackData,
      };
    }
    if (!err) {
      loading.dismiss();
      this.router.navigate(['create-ticket'], {
        relativeTo: this.route,
        state: { violator: JSON.stringify(state.data) },
      });
    }
  }
}
