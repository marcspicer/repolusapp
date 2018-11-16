import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.css']
})
export class BlogComponent implements OnInit {

  // collection = [];	
  constructor() {
     console.log("BlogComponent constructor called.");
     // for (let i = 1; i <= 100; i++) {
     //       this.collection.push(i);
     //     }
  }

  ngOnInit() {
  }

}
