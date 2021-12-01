import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Camera,
  CameraResultType,
  CameraSource,
  Photo,
} from '@capacitor/camera';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { AlertController, LoadingController } from '@ionic/angular';
import { finalize } from 'rxjs/operators';
import { ApiService } from 'src/app/services/api.service';
export interface imageFile {
  name: string;
  data: any;
  path: string;
}
export const TMP_DIR = 'tmp_img/';

@Component({
  selector: 'app-create-ticket',
  templateUrl: './create-ticket.page.html',
  styleUrls: ['./create-ticket.page.scss'],
})
export class CreateTicketPage implements OnInit {
  private violations = {};
  private base64: imageFile = { name: '', data: null, path: null };
  private routeState: any;
  searched_violator: any;
  vehicle_types = [];
  selectViolations;
  imageData: any;
  ticketFormGroup: FormGroup;

  customAlertOptions: any = {
    cssClass: '.alert-violation-selection',
  };

  constructor(
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private apiService: ApiService,
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
      }
    }
  }

  ngOnInit() {
    //fetch data from api service
    this.apiService.getViolationsByVehicleType().subscribe((data: any) => {
      this.violations = data;

      for (const key in this.violations) {
        this.vehicle_types.push(key);
      }
    });

    //initialized form groups and controls
    this.ticketFormGroup = this.formBuilder.group({
      last_name: [
        this.searched_violator && this.searched_violator.name
          ? this.searched_violator.name[2]
          : '',
        [Validators.required, Validators.pattern('[a-zA-ZÑñ ]*')],
      ],
      first_name: [
        this.searched_violator && this.searched_violator.name
          ? this.searched_violator.name[0]
          : '',
        [Validators.required, Validators.pattern('[a-zA-ZÑñ ]*')],
      ],
      middle_name: [
        this.searched_violator && this.searched_violator.name
          ? this.searched_violator.name[1]
          : '',
        [Validators.required, Validators.pattern('[a-zA-ZÑñ ]*')],
      ],
      birth_date: [
        this.searched_violator && this.searched_violator.birth_date
          ? this.searched_violator.birth_date
          : '',
        [Validators.required],
      ],
      address: [
        this.searched_violator && this.searched_violator.address
          ? this.searched_violator.address
          : '',
        [Validators.required],
      ],
      license_number: [
        this.searched_violator ? this.searched_violator.license_number : '',
        [Validators.required],
      ],
      vehicle_type: ['', [Validators.required]],
      plate_number: ['', [Validators.required]],
      parent_license: [
        this.searched_violator && this.searched_violator.parent_and_license
          ? this.searched_violator.parent_and_license
          : '',
      ],
      licenseIsConfiscated: [false],
      vehicle_owner: ['', [Validators.required]],
      owner_address: ['', [Validators.required]],
      vehicleIsImpounded: [false],
      apprehension_date_time: ['', [Validators.required]],
      apprehension_place: ['', [Validators.required]],
      committed_violations: [null, [Validators.required]],
      driverIsUnderProtest: [false],
      mobile_number: [
        null,
        [
          Validators.required,
          Validators.maxLength(10),
          Validators.minLength(10),
          Validators.pattern('9[0-9]{9}'),
        ],
      ],
    });
  }

  ngOnDestroy() {
    //delete saved image when page destroy
    if (this.base64.path) {
      this.deleteImage(this.base64.path);
    }
  }

  async createTicket() {
    const loading = await this.loadingCtrl.create();
    await loading.present();

    //create form data to send on api server
    const formData = new FormData();
    for (const key in this.ticketFormGroup.value) {
      formData.append(key, this.ticketFormGroup.get(key).value);
    }

    //append image to form data
    const resp = await fetch(this.base64.data);
    const blob = await resp.blob();
    formData.append('drivers_id', blob, this.base64.name);

    this.apiService
      .saveTicket(formData)
      .pipe(
        finalize(async () => {
          await loading.dismiss();
        })
      )
      .subscribe(
        //redirect on success
        (data) => {
          this.router.navigate(['generate-qrcode'], {
            relativeTo: this.route,
            state: { ticket: data },
            replaceUrl: true,
          });
        },
        //show error message
        async (err) => {
          const errorAlert = await this.alertCtrl.create({
            header: 'Failed to Create Ticket!',
            message: err.error.message,
            buttons: ['OK'],
          });
          errorAlert.present();
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

  //capture and save photo of driver's id
  async captureImage() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
    });

    this.base64.name = new Date().getTime() + '.jpeg';
    const filepath = TMP_DIR + this.base64.name;
    await Filesystem.writeFile({
      directory: Directory.Data,
      path: filepath,
      data: image.base64String,
      recursive: true,
    });

    //delete previous saved image if exist
    if (this.base64.path) {
      this.deleteImage(this.base64.path);
    }

    await this.showImage(filepath);
  }

  //read the saved image and show on thumbnail
  private async showImage(filepath: string) {
    const bs64 = await Filesystem.readFile({
      directory: Directory.Data,
      path: filepath,
    });
    this.imageData = 'data:image/jpeg;base64,' + bs64.data;
    this.base64.data = this.imageData;
    this.base64.path = filepath;
  }

  //delete image file of driver's id
  async deleteImage(filepath: string) {
    await Filesystem.deleteFile({
      directory: Directory.Data,
      path: filepath,
    });
  }

  //view image upon clicking image thumbnail
  async zoomImage() {
    const loading = await this.alertCtrl.create({
      header: "Driver's ID",
      message: `<img src="${this.imageData}">`,
      buttons: [
        {
          text: 'Retake',
          cssClass: 'dark',
          handler: () => {
            this.captureImage();
          },
        },
        {
          text: 'Ok',
          role: 'cancel',
        },
      ],
    });
    await loading.present();
  }
}
