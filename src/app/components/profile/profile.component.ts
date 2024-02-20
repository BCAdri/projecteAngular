import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl,FormBuilder,FormGroup,ReactiveFormsModule,ValidatorFn,Validators,} from '@angular/forms';
import { Router } from '@angular/router';
import { map } from 'rxjs';
import { IUsuaris } from '../../interfaces/usuaris';
import { UsersService } from '../../services/users.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {

  constructor(
    private router : Router,
    private toastr: ToastrService,
    private formBuilder: FormBuilder,
    private userService: UsersService,

  ) {
    this.crearFormulario();
  }

  formulario!: FormGroup;

  ngOnInit(): void {

    this.userService.isLogged().then((logged) => {
      if (logged) {
        this.userService.userSubject
          .pipe(
            map((p: IUsuaris) => {
              return {
                id: p.id,
                username: p.username,
                full_name: p.full_name,
                avatar_url: p.avatar_url,
                website: p.website,
              };
            })
          )
          .subscribe((profile) => this.formulario.setValue(profile));
      } else{
        this.toastr.success('Debes iniciar sesion', 'Identificate!')
        .onHidden
        .subscribe(() => {
            this.router.navigate(['login']);
        });
      }
    });
  }

  onSubmit() {
    if (this.formulario.valid) {
      this.userService.setProfile(this.formulario);
    } else {
      console.error('Not valid');
    }
  }

  crearFormulario() {
    this.formulario = this.formBuilder.group({
      id: [localStorage.getItem('uid')],
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.pattern('.*[a-zA-Z].*'),
        ],
      ],
      full_name: [''],
      avatar_url: [''],
      website: ['', websiteValidator('http.*')],
    });
  }

  get usernameNoValid() {
    return (
      this.formulario.get('username')!.invalid &&
      this.formulario.get('username')!.touched
    );
  }

  loadImg(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
  
    if (file) {
      this.readAndSetImage(file);
    }
  }
  
  private readAndSetImage(file: File) {
    const reader = new FileReader();
  
    reader.onload = () => {
      this.updateAvatarUrl(reader.result);
    };
  
    reader.readAsDataURL(file);
  }
  
  private updateAvatarUrl(result: string | ArrayBuffer | null) {
    if (result) {
      this.formulario.patchValue({ avatar_url: result });
      this.formulario.get('avatar_url')?.updateValueAndValidity();
    }
  }

}

function websiteValidator(pattern: string): ValidatorFn {
  return (c: AbstractControl): { [key: string]: any } | null => {
    if (c.value) {
      let regexp = new RegExp(pattern);

      return regexp.test(c.value) ? null : { website: c.value };
    }
    return null;
  };
}
