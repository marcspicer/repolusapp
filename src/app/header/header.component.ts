import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../app.component';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  constructor() { }

  ngOnInit() {

  }

  goToMapSection() {
      setTimeout(function () {
         var node = document.querySelector('#map_section');
         var headerHeight = 70;
         node.scrollIntoView(true);
         var scrolledY = window.scrollY;
         if(scrolledY){
           window.scroll(0, scrolledY - headerHeight);
         }
      }, 400);    
  };

  goToMarketSection() {
      setTimeout(function () {
        var node = document.querySelector('#market_reports');
        var headerHeight = 70;
        node.scrollIntoView(true);
            var scrolledY = window.scrollY + 40;
            if(scrolledY){
              window.scroll(0, scrolledY - headerHeight);
            }
      }, 400);  
  };

  goToTop() {
  	setTimeout(function () {
  		window.scroll({ top: 0, left: 0, behavior: 'instant' });
    }, 400);
  };
  
}
