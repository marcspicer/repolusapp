import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataService } from '../data.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {

  // send message work. 
  emailForm: FormGroup;
  message: any;
  errMessage: any;

  constructor(private dataService: DataService) { 
     console.log("ContactComponent constructor called."); 
  }

  ngOnInit() {
      this.emailForm = new FormGroup({
          name: new FormControl(), 
          email: new FormControl('', [
            Validators.required,
            Validators.pattern("[^ @]*@[^ @]*")
          ]),
          password: new FormControl(),
          subject: new FormControl(),
          comment: new FormControl()
      });
  }

// send message method
sendEmail(recData) {
 	console.log("sendEmail called recData:", recData);
  this.dataService.sendEmail(recData)
  .subscribe(
      res => {
        // console.log("res::", res);
        this.message = res;
        this.errMessage = '';
        this.emailForm.reset();
      },
      err => {
        // console.log("Error occured while sending email", err);
        this.errMessage = err.error.response;
        this.message = '';
      }
    );
}; 

}
