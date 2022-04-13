import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  deleteImage,
  imageFile,
} from '../../../modules/shared/custom-input/custom-input.component';
import { ApiService } from '../../../services/api.service';
import { ViewDidLeave } from '@ionic/angular';
import { UtilityService } from '../../../services/utility.service';

@Component({
  selector: 'app-create-ticket',
  templateUrl: './create-ticket.page.html',
  styleUrls: ['./create-ticket.page.scss'],
})
export class CreateTicketPage implements OnInit, OnDestroy, ViewDidLeave {
  private violations = {};
  private routeState: any;
  private loading: HTMLIonLoadingElement;
  searched_violator: any;
  vehicle_types = [];
  selectViolations;
  images: imageFile[] = [];
  ticketFormGroup: FormGroup;
  public extra_inputs = {
    ext_violators: <any>[],
    ext_tickets: <any>[],
  };
  formData: FormData;

  customAlertOptions: any = {
    cssClass: '.alert-violation-selection',
  };

  constructor(
    private apiService: ApiService,
    private utility: UtilityService,
    private router: Router,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute
  ) {
    if (this.router.getCurrentNavigation().extras.state) {
      this.routeState = this.router.getCurrentNavigation().extras.state;
      if (this.routeState) {
        // check data passed by previous page, if exist fetch and assign to searched_violator
        this.searched_violator = this.routeState.violator
          ? JSON.parse(this.routeState.violator)
          : '';
      } else {
        router.navigateByUrl('select-create');
      }
    }
  }

  ionViewDidLeave(): void {
    if (this.loading) this.loading.dismiss();
    for (let index = 0; index < this.images.length; index++) {
      const image = this.images[index];
      deleteImage(image.path).catch(() => {});
    }
    this.ticketFormGroup = null;
    this.images = null;
  }

  ngOnInit() {
    this.ticketFormGroup = this.formBuilder.group({
      last_name: [
        this.searched_violator ? this.searched_violator.last_name : '',
        [Validators.required, Validators.pattern('[a-zA-ZÑñ][a-zA-ZÑñ ]*')],
      ],
      first_name: [
        this.searched_violator ? this.searched_violator.first_name : '',
        [Validators.required, Validators.pattern('[a-zA-ZÑñ][a-zA-ZÑñ ]*')],
      ],
      middle_name: [
        this.searched_violator && this.searched_violator.middle_name != 'null'
          ? this.searched_violator.middle_name
          : '',
        [Validators.required, Validators.pattern('[a-zA-ZÑñ ]*')],
      ],
      birth_date: [
        this.searched_violator && this.searched_violator.birth_date
          ? this.searched_violator.birth_date
          : '',
        [Validators.required],
      ],
      license_number: [
        this.searched_violator &&
        this.searched_violator.license_number != 'null'
          ? this.searched_violator.license_number
          : '',
        [Validators.pattern('[a-zA-Z0-9]*')],
      ],
      vehicle_type: ['', [Validators.required]],
      committed_violations: [null, [Validators.required]],
    });
    this.fetchExtraProperties();
  }

  ngOnDestroy() {
    if (this.images) {
      for (let index = 0; index < this.images.length; index++) {
        const image = this.images[index];
        deleteImage(image.path).catch(() => {});
      }
      this.images = null;
    }
    this.ticketFormGroup = null;
  }

  fetchExtraProperties() {
    //fetch data from api service
    this.apiService.getViolationsByVehicleType().then((data: any) => {
      this.violations = data;

      for (const key in this.violations) {
        this.vehicle_types.push(key);
      }
    });

    //fetch extra details needed for violator
    this.apiService.getExtraInputs('violator').then((data) => {
      let violator_extra_properties: any[] =
        this.searched_violator.extra_properties;
      this.extra_inputs.ext_violators = data;
      this.extra_inputs.ext_violators.data.forEach((extra_input) => {
        let default_value = extra_input.data_type == 'boolean' ? false : null;
        if (violator_extra_properties) {
          for (
            let index = 0;
            index < violator_extra_properties.length;
            index++
          ) {
            const ext = violator_extra_properties[index];
            if (ext.propertyDescription.id == extra_input.id) {
              default_value =
                ext.property_value != 'null'
                  ? ext.property_value
                  : default_value;
              violator_extra_properties.splice(index, 1);
              break;
            }
          }
        }
        if (extra_input.data_type != 'image') {
          try {
            this.ticketFormGroup.addControl(
              extra_input.property,
              new FormControl(
                default_value,
                extra_input.is_required ? Validators.required : []
              )
            );
          } catch (error) {}
        }
      });
    });

    //fetch extra details needed for ticket
    this.apiService.getExtraInputs('ticket').then((data) => {
      this.extra_inputs.ext_tickets = data;
      this.extra_inputs.ext_tickets.data.forEach((extra_input) => {
        let default_value = extra_input.data_type == 'boolean' ? false : '';
        try {
          this.ticketFormGroup.addControl(
            extra_input.property,
            new FormControl(
              default_value,
              extra_input.is_required ? Validators.required : []
            )
          );
        } catch (error) {}
      });
    });
  }

  async createTicket() {
    //create form data to send on api server
    this.formData = new FormData();
    for (const key in this.ticketFormGroup.value) {
      this.formData.append(key, this.ticketFormGroup.get(key).value);
    }
    if (this.searched_violator && this.searched_violator.id)
      this.formData.append('violator_id', this.searched_violator.id);
    //prompt user to enter password
    await this.confirmCreateTicket();
  }

  async confirmCreateTicket() {
    const options = {
      inputs: [
        {
          name: 'password',
          type: 'password',
          placeholder: 'Enter password',
        },
      ],
      buttons: [
        {
          text: 'Continue',
          cssClass: 'secondary',
          handler: async (credentials) => {
            if (credentials.password) {
              const formData = new FormData();
              formData.append('password', credentials.password);
              this.apiService.confirmPassword(formData).then(
                async (data: any) => {
                  if (data.password_match_status === true) {
                    //save ticket details
                    this.saveTicketDetails();
                  } else {
                    const alert = await this.utility.alertMessage(
                      'Ticket Creation Failed!',
                      'You enter an incorrect password. Please try again.'
                    );
                    alert.present();
                  }
                },

                //show error message
                async (res) => {
                  await this.utility.alertErrorStatus(res);
                }
              );
            } else {
              const alert = await this.utility.alertMessage(
                'Ticket Creation Failed!'
              );
              alert.present();
            }
          },
        },
      ],
    };
    const alert = await this.utility.alertMessage(
      'Confirm Password',
      '',
      options
    );
    await alert.present();
  }

  //save ticket details to server
  async saveTicketDetails() {
    this.loading = await this.utility.createIonLoading();
    this.loading.present();
    this.apiService.saveTicket(this.formData).then(
      //redirect on success
      (data) => {
        this.router
          .navigate(['generate-qrcode'], {
            relativeTo: this.route,
            state: { ticket: data },
            replaceUrl: true,
          })
          .finally(() => {
            this.loading.dismiss();
          });
      },
      //show error message
      async (res) => {
        await this.utility.alertErrorStatus(res);
        this.loading.dismiss();
      }
    );
  }

  //change list of violations on change of vehicle type
  changeSelectViolations() {
    this.selectViolations = [];
    for (
      let type = 0;
      type <
      this.violations[this.ticketFormGroup.get('vehicle_type').value].length;
      type++
    ) {
      const v =
        this.violations[this.ticketFormGroup.get('vehicle_type').value][type];
      for (let violation = 0; violation < v.violations.length; violation++) {
        this.selectViolations.push(v.violations[violation]);
      }
    }
    this.ticketFormGroup.get('committed_violations').setValue(null); //reset value of committed violations
  }

  //helper function to change values of form controls with boolean type
  toggleValue(formCtrlName: string) {
    const vI = this.ticketFormGroup.get(formCtrlName);
    vI.setValue(!vI.value);
  }

  //listen to custom components when it returns an image to be appended in form before submission
  async pushImage(image: imageFile) {
    let resp = await fetch(image.data);
    let blob = await resp.blob();
    this.ticketFormGroup.get(image.property_name).setValue(blob);
    this.images.push(image);
  }
}
