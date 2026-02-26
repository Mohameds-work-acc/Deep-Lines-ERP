import { Injectable } from '@angular/core';

import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  showToast(msg: string , icon: any) {
    Swal.fire({
      toast: true,
      position: 'top',
      icon: icon,
      title: msg,
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    });
  }
}
