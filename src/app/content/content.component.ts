import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';
import { NgbAccordionConfig } from '@ng-bootstrap/ng-bootstrap';
import {
  circle,
  geoJSON,
  icon,
  latLng,
  Layer,
  Marker,
  polygon,
  tileLayer,
  map,
  layerGroup
} from 'leaflet';
import * as L from 'leaflet';
import { DatePipe } from '@angular/common';
import smoothscroll from 'smoothscroll-polyfill';
import leafletPip from '@mapbox/leaflet-pip';
import { Chart } from 'chart.js';
import { C0NST } from './constants';
import { DataService } from '../data.service';
import { ToastrService } from 'ngx-toastr';
import { CompleterService, CompleterData, CompleterItem } from 'ng2-completer';
import * as moment from 'moment';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.css'],
  providers: [NgbDropdownConfig, NgbAccordionConfig] // add NgbDropdownConfig to the component providers
})
export class ContentComponent implements OnInit {
  // dropdown work
  NYBoroughs = [];
  selectedNYBorough: String;
  selectedNeighborhoods = [];
  neighborhoods: any;
  selectedCategories = [];
  selectedDataCategories: any;
  loading = false;
  // total = manhattan 47 and brooklyn 59 === 106
  allDowntown = C0NST.allDowntown;
  allMidtown = C0NST.allMidtown;
  allUpperEastSide = C0NST.allUpperEastSide;
  allUppeWest = C0NST.allUppeWest;
  allUpperManhattan = C0NST.allUpperManhattan;
  allBrooklyn = C0NST.allBrooklyn;
  // categories work
  allCategories = C0NST.allCategories;
  // market reports work
  allNbrsMrManhattan = C0NST.allNbrsMrManhattan;
  allNbrsMrBrk = C0NST.allNbrsMrBrk;
  abrt_chart_options = C0NST.abrt_chart_options;
  mrkrp_chart_options = C0NST.mrkrp_chart_options;
  // end of dropdown work

  // map work
  map: L.Map;
  geoJsonLayer = L.geoJSON();
  burrowJsonLayer = L.geoJSON();
  LAYER_OSM = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: 'Open Street Map'
  });
  options = {
    layers: [this.LAYER_OSM],
    zoom: 10,
    scrollWheelZoom: false,
    zoomControl: false,
    center: L.latLng(40.8076498, -73.9243189)
  };

  onHovorgeoJsonLayer = L.geoJSON();
  onHovorNbr: any;

  selectedMarker: any = null;
  selectedMarkers = L.layerGroup();
  selectedBtn: any;

  categories = [];
  resCategories: any;

  // show markers on map work
  marker: any = null;
  markers = L.layerGroup();
  markerIconDeselected: any = null;
  markerIconSelected: any = null;
  tempNeighborhood: any;

  // market report work
  datesOfAbsorptionData: any;
  theReturnMonths: any;
  selectedDate: any;
  selectedNbr: any;
  latestDate: any;
  marketReportsAptsData = [];
  marketReportsCondoData = [];
  marketReportsCoopData = [];
  theReturnAbsorption: any;
  absorptionChart: any;
  marketReportsChart: any;
  allNeighborhoodsAbRt: any;
  selectNeighborhoodAbRt: any;

  // auto completer work
  // auto completer work allDowntown
  searchAllDowntown: string;
  searchingAllDowntowns: CompleterData;
  searchedAllDowntown: string;
  selectedNeiBoolean: Boolean;
  autoCompleterAllDowntown(item: CompleterItem) {
    if (item === null) {
      this.selectedNeiBoolean = false;
    } else {
      this.searchedAllDowntown = item.originalObject;
      this.selectedNeiBoolean = true;
    }
  }

  // auto completer work allBrooklyn
  searchAllBrooklyn: string;
  searchingAllBrooklyn: CompleterData;
  searchedAllBrooklyn: string;
  selectedAllBrooklynBoolean: Boolean;
  autoCompleterAllBrooklyn(item: CompleterItem) {
    if (item === null) {
      this.selectedAllBrooklynBoolean = false;
    } else {
      this.searchedAllBrooklyn = item.originalObject;
      this.selectedAllBrooklynBoolean = true;
    }
  }

  @ViewChild('mapCountainer') mapCountainer: any;
  // end of map owrk

  constructor(
    config: NgbDropdownConfig,
    configs: NgbAccordionConfig,
    private dataService: DataService,
    private toastr: ToastrService,
    private completerService: CompleterService
  ) {
    // auto completer work
    this.searchingAllDowntowns = completerService.local(
      C0NST.allDowntown,
      'name',
      'name'
    );
    this.selectedNeiBoolean = false;

    this.searchingAllBrooklyn = completerService.local(
      C0NST.allBrooklyn,
      'name',
      'name'
    );
    this.selectedAllBrooklynBoolean = false;

    // customize default values of dropdowns used by this component tree
    config.autoClose = false;
    configs.closeOthers = true;
    configs.type = 'info';

    // for working dropdown toggling
    config.autoClose = true;
    this.selectedDataCategories = [
      {
        neighborhoods: []
      },
      {
        categories: []
      }
    ];

    this.markerIconSelected = L.icon({
      iconSize: [32, 48],
      iconAnchor: [13, 41],
      iconUrl: 'assets/images/marker-icon-green.png'
    });
  }

  ngOnInit() {
    this.map = L.map(this.mapCountainer.nativeElement.id, this.options);

    L.control
      .zoom({
        position: 'bottomright'
      })
      .addTo(this.map);

    this.NYBoroughs = ['Manhattan', 'Brooklyn'];
    // this.selectedNYBorough = "Select NY Boroughs";
    this.selectedNYBorough = this.NYBoroughs[0];
    this.selectNYBorough(0, this.selectedNYBorough);

    // market reports
    // get absorption data dates for dropdown
    this.getMonthsDropdown();
    // get all neighborhoods in absorption rates data
    this.getNeighborhoodsAbRt();

    // canvas work
    this.marketReportsChart = document.getElementById('market-reports-chart');
    this.marketReportsChart = this.marketReportsChart.getContext('2d');

    this.showNoDataMessageBoolean = false;

    // years dropdown
    this.years = this.makeYearsArray();
    // set default years range
    this.yearSelectection(2010, new Date().getFullYear());
  }

  makeYearsArray() {
    let startYear = new Date('2010-01-07').getFullYear();
    let endYear = new Date().getFullYear();
    var years = [];

    for (let i = startYear; i <= endYear; i++) {
      years.push(i);
    }
    return years;
  }
  // work for Discover More button click go to map section
  goToMapSection() {
    setTimeout(function() {
      var node = document.querySelector('#map_section');
      var headerHeight = 70;
      node.scrollIntoView(true);
      var scrolledY = window.scrollY;
      if (scrolledY) {
        window.scroll(0, scrolledY - headerHeight);
      }
    }, 400);
  }

  activeBrooklynId: any;
  // select any borough to the map
  selectNYBorough(event, borough) {
    this.selectedNYBorough = borough;
    if (borough === 'Manhattan') {
      this.map.setView([40.7831, -73.9712], 12);
    } else if (borough === 'Brooklyn') {
      this.activeBrooklynId = 'activeBrooklyn';
      console.log('this.activeBrooklynId', this.activeBrooklynId);
      this.map.setView([40.6453531, -74.0043942], 12);
    }
  }

  // neighborhoods dropdown work
  checkAllDowntown(e) {
    if (e.target.checked) {
      for (var i = 0; i < this.allDowntown.length; i++) {
        this.allDowntown[i].status = true;
      }
    } else {
      for (var i = 0; i < this.allDowntown.length; i++) {
        this.allDowntown[i].status = false;
      }
    }
    this.addNeighborhoods();
  }

  checkAllMidtown(e) {
    if (e.target.checked) {
      for (var i = 0; i < this.allMidtown.length; i++) {
        this.allMidtown[i].status = true;
      }
    } else {
      for (var i = 0; i < this.allMidtown.length; i++) {
        this.allMidtown[i].status = false;
      }
    }
    this.addNeighborhoods();
  }

  checkAllUpperEastSide(e) {
    if (e.target.checked) {
      for (var i = 0; i < this.allUpperEastSide.length; i++) {
        this.allUpperEastSide[i].status = true;
      }
    } else {
      for (var i = 0; i < this.allUpperEastSide.length; i++) {
        this.allUpperEastSide[i].status = false;
      }
    }
    this.addNeighborhoods();
  }

  checkAllUppeWest(e) {
    if (e.target.checked) {
      for (var i = 0; i < this.allUppeWest.length; i++) {
        this.allUppeWest[i].status = true;
      }
    } else {
      for (var i = 0; i < this.allUppeWest.length; i++) {
        this.allUppeWest[i].status = false;
      }
    }
    this.addNeighborhoods();
  }

  checkallApperManhattan(e) {
    if (e.target.checked) {
      for (var i = 0; i < this.allUpperManhattan.length; i++) {
        this.allUpperManhattan[i].status = true;
      }
    } else {
      for (var i = 0; i < this.allUpperManhattan.length; i++) {
        this.allUpperManhattan[i].status = false;
      }
    }
    this.addNeighborhoods();
  }

  checkAllBrooklyn(e) {
    if (e.target.checked) {
      for (var i = 0; i < this.allBrooklyn.length; i++) {
        this.allBrooklyn[i].status = true;
      }
    } else {
      for (var i = 0; i < this.allBrooklyn.length; i++) {
        this.allBrooklyn[i].status = false;
      }
    }
    this.addNeighborhoods();
  }

  addNeighborhoods() {
    this.selectedNeighborhoods = [];
    // allDowntown
    for (let i = 0; i < this.allDowntown.length; i++) {
      if (this.allDowntown[i].status) {
        this.selectedNeighborhoods.push(this.allDowntown[i]);
      } else {
        for (var j = 0; j < this.selectedNeighborhoods.length; j++) {
          if (
            this.selectedNeighborhoods[j].name === this.allDowntown[i].name &&
            this.selectedNeighborhoods[j].id > 0 &&
            this.selectedNeighborhoods[j].id < 100
          ) {
            this.selectedNeighborhoods.splice(j, 1);
          }
        }
      }
    }
    // allMidtown
    for (let i = 0; i < this.allMidtown.length; i++) {
      if (this.allMidtown[i].status) {
        this.selectedNeighborhoods.push(this.allMidtown[i]);
      } else {
        for (var j = 0; j < this.selectedNeighborhoods.length; j++) {
          if (
            this.selectedNeighborhoods[j].name === this.allMidtown[i].name &&
            this.selectedNeighborhoods[j].id > 100 &&
            this.selectedNeighborhoods[j].id < 200
          ) {
            this.selectedNeighborhoods.splice(j, 1);
          }
        }
      }
    }
    // allUpperEastSide
    for (let i = 0; i < this.allUpperEastSide.length; i++) {
      if (this.allUpperEastSide[i].status) {
        this.selectedNeighborhoods.push(this.allUpperEastSide[i]);
      } else {
        for (var j = 0; j < this.selectedNeighborhoods.length; j++) {
          if (
            this.selectedNeighborhoods[j].name ===
              this.allUpperEastSide[i].name &&
            this.selectedNeighborhoods[j].id > 200 &&
            this.selectedNeighborhoods[j].id < 300
          ) {
            this.selectedNeighborhoods.splice(j, 1);
          }
        }
      }
    }
    // allUppeWest
    for (let i = 0; i < this.allUppeWest.length; i++) {
      if (this.allUppeWest[i].status) {
        this.selectedNeighborhoods.push(this.allUppeWest[i]);
      } else {
        for (var j = 0; j < this.selectedNeighborhoods.length; j++) {
          if (
            this.selectedNeighborhoods[j].name === this.allUppeWest[i].name &&
            this.selectedNeighborhoods[j].id > 300 &&
            this.selectedNeighborhoods[j].id < 400
          ) {
            this.selectedNeighborhoods.splice(j, 1);
          }
        }
      }
    }
    // allUpperManhattan
    for (let i = 0; i < this.allUpperManhattan.length; i++) {
      if (this.allUpperManhattan[i].status) {
        this.selectedNeighborhoods.push(this.allUpperManhattan[i]);
      } else {
        for (var j = 0; j < this.selectedNeighborhoods.length; j++) {
          if (
            this.selectedNeighborhoods[j].name ===
              this.allUpperManhattan[i].name &&
            this.selectedNeighborhoods[j].id > 400 &&
            this.selectedNeighborhoods[j].id < 500
          ) {
            this.selectedNeighborhoods.splice(j, 1);
          }
        }
      }
    }
    // allBrooklyn
    for (let i = 0; i < this.allBrooklyn.length; i++) {
      if (this.allBrooklyn[i].status) {
        this.selectedNeighborhoods.push(this.allBrooklyn[i]);
      } else {
        for (var j = 0; j < this.selectedNeighborhoods.length; j++) {
          if (
            this.selectedNeighborhoods[j].name === this.allBrooklyn[i].name &&
            this.selectedNeighborhoods[j].id > 500 &&
            this.selectedNeighborhoods[j].id < 600
          ) {
            this.selectedNeighborhoods.splice(j, 1);
          }
        }
      }
    }
    // call server to fetch neighborhoods from db and place data on map.
    this.fetchNeighborhoodsShowOnMap(this.selectedNeighborhoods);
    this.addRemoveCategories('null', this.selectedNeighborhoods, 'null');
  }

  closeNeighborhoodsTags(e, index, neighborhood) {
    // unCheck the object in dropdown.
    neighborhood.status = false;
    // remove the object from selectedNeighborhoods
    this.selectedNeighborhoods.splice(index, 1);
    if (this.selectedNeighborhoods.length == 0) {
      this.map.setView([40.7831, -73.9712], 12);
    }
    // call server to fetch neighborhoods from db and place data on map.
    this.fetchNeighborhoodsShowOnMap(this.selectedNeighborhoods);
    this.addRemoveCategories('null', this.selectedNeighborhoods, 'null');
  }

  // // call server nd send this list of neighborhoods to backend and fetch the resuslt and show then on map.
  fetchNeighborhoodsShowOnMap(selectedNeighborhoods) {
    this.map.removeLayer(this.onHovorgeoJsonLayer);

    var neighborhoodsToSend = [];
    for (var i = 0; i < selectedNeighborhoods.length; i++) {
      neighborhoodsToSend[i] = selectedNeighborhoods[i].name;
    }

    this.dataService.fetchNeighborhoodsShowOnMap(neighborhoodsToSend).subscribe(
      res => {
        this.neighborhoods = res;
        // console.log("this.neighborhoods:", this.neighborhoods);

        // clear the previous layers
        this.map.removeLayer(this.geoJsonLayer);

        // add the neighborhoods to map.
        this.geoJsonLayer = L.geoJSON(this.neighborhoods, {
          style: function() {
            return { color: '#783E7B' };
          }
        });

        this.geoJsonLayer.addTo(this.map);

        var options = {
          maxZoom: 15
        };
        this.map.fitBounds(this.geoJsonLayer.getBounds(), options);
      },
      err => {
        console.log('Error occured', err);
      }
    );
  }

  // fetchNeighborOnHovor
  fetchNeighborOnHovor(nbr) {
    // console.log("fetchNeighborOnHovor called");
    // console.log("nbr:", nbr);

    var nbrObject = { name: nbr };
    var errorMessage = 'No DATA for ' + nbrObject.name + ' in DB yet.';

    this.dataService.fetchNeighborOnHovor(nbrObject).subscribe(
      res => {
        this.onHovorNbr = res;

        if (this.onHovorNbr.length === 0) {
          this.toastr.error(errorMessage);
        } else {
          // clear the previous layers
          this.map.removeLayer(this.onHovorgeoJsonLayer);
          // add the neighborhoods to map.
          this.onHovorgeoJsonLayer = L.geoJSON(this.onHovorNbr, {
            style: function() {
              return { color: '#22c2a6' };
            }
          });
          this.onHovorgeoJsonLayer.addTo(this.map);
          var options = {
            maxZoom: 15
          };

          this.map.fitBounds(this.onHovorgeoJsonLayer.getBounds(), options);
        }
      },
      err => {
        console.log('Error occured', err);
      }
    );
  }

  neighborMouseleave() {
    this.map.removeLayer(this.onHovorgeoJsonLayer);
  }

  // adding and removing the categories
  addRemoveCategories(e, neighborhoods, cat) {
    if (neighborhoods === null) {
      cat.selected = !cat.selected;

      if (cat.selected) {
        this.selectedDataCategories[1].categories.push(cat.name);
        this.selectedCategories.push(cat.name);
      } else {
        for (let i = 0; i < this.selectedCategories.length; i++) {
          if (this.selectedCategories[i] == cat.name) {
            this.selectedCategories.splice(i, 1);
          }
        }

        for (
          let i = 0;
          i < this.selectedDataCategories[1].categories.length;
          i++
        ) {
          if (this.selectedDataCategories[1].categories[i] == cat.name) {
            this.selectedDataCategories[1].categories.splice(i, 1);
          }
        }

        // also remove the selected cat markers from map
        if (this.selectedBtn === cat.name) {
          this.selectedMarkers.clearLayers();
          this.map.removeLayer(this.selectedMarkers);
        }
      }
    } else {
      var attachingNeighborhoods = [];
      for (var i = 0; i < neighborhoods.length; i++) {
        attachingNeighborhoods[i] = neighborhoods[i].name;
      }
      this.selectedDataCategories[0].neighborhoods = attachingNeighborhoods;
    }
    // call server to fetch data
    this.fetchCategoriesShowOnMap(this.selectedDataCategories);
  }

  // removing the categories from list
  removeCategories(e, index, category) {
    this.selectedCategories.splice(index, 1);
    // update the selectedDataCategories Object
    for (let i = 0; i < this.selectedDataCategories[1].categories.length; i++) {
      if (this.selectedDataCategories[1].categories[i] === category) {
        this.selectedDataCategories[1].categories.splice(i, 1);
      }
    }

    //remove the selected cat markers also from map
    if (this.selectedBtn === category) {
      this.selectedMarkers.clearLayers();
      this.map.removeLayer(this.selectedMarkers);
    }

    // unckeck the object in all categories.
    for (let j = 0; j < this.allCategories.length; j++) {
      if (this.allCategories[j].name === category) {
        this.allCategories[j].selected = false;
      }
    }

    // call server to fetch data
    this.fetchCategoriesShowOnMap(this.selectedDataCategories);
  }

  // Categories List on Map work selection and deSelection of Btns
  async selectBtnCatList(item) {
    this.loading = true;
    this.selectedBtn = item;

    this.selectedMarkers.clearLayers();
    this.map.removeLayer(this.selectedMarkers);

    // this.tempNeighborhood = undefined;

    // clear the markers and add to map again.
    for (let i = 0; i < this.categories.length; i++) {
      if (this.categories[i].location && this.categories[i].category === item) {
        this.selectedMarker = L.marker(
          [this.categories[i].location.lat, this.categories[i].location.lng],
          { icon: this.markerIconSelected }
        );
        this.selectedMarker.on(
          'mouseover',
          this.selectedMarker.bindPopup(
            '<h6><strong>' +
              this.categories[i].name +
              '</strong></h6>' +
              '<br>' +
              "</br> <div class='row'> <div class='col-md-8'>" +
              this.categories[i].address +
              '</br>' +
              this.categories[i].phone_number +
              "</br> <a href='" +
              this.categories[i].articleLink +
              "' target='_blank'>" +
              this.categories[i].articleLink +
              '</a></div>' +
              "<p class='popup-img col-md-3'><img src='assets/images/marker-popupColor.png' alt=''></p>  </div>"
          )
        );

        if (
          this.tempNeighborhood == undefined ||
          this.tempNeighborhood.features[0].properties.name !=
            this.categories[i].neighborhood
        ) {
          await this.fetchNeighborByName(this.categories[i].neighborhood).then(
            res => {
              // Success
              this.tempNeighborhood = res;
            }
          );
        }

        var isMarkerInside = this.isMarkerInsideNeighborhood(
          this.selectedMarker,
          this.tempNeighborhood
        );
        if (isMarkerInside) {
          this.selectedMarkers.addLayer(this.selectedMarker);
        }
      }
    }

    this.map.addLayer(this.selectedMarkers);
    this.loading = false;
  }

  isActive(item) {
    return this.selectedBtn === item;
  }

  // call server fetch the final data from server with categories and neighborhoods
  fetchCategoriesShowOnMap(selectedCategories) {
    let body = selectedCategories;
    this.loading = true;

    this.dataService.fetchCategoriesShowOnMap(body).subscribe(
      res => {
        this.resCategories = res;
        this.categories = [];

        for (let i = 0; i < this.resCategories.length; i++) {
          for (let j = 0; j < this.resCategories[i].length; j++) {
            this.categories.push(this.resCategories[i][j]);
          }
        }
        // show marker on map
        this.showMarkersOnMap(this.categories);
      },
      err => {
        console.log('Error occured while fetching categories', err);
        this.loading = false;
      }
    );
  }

  // show the markers on map.
  async showMarkersOnMap(dataShowOnMap) {
    this.markers.clearLayers();
    this.map.removeLayer(this.markers);

    // we should use group layers thats the best method
    for (let i = 0; i < dataShowOnMap.length; i++) {
      if (dataShowOnMap[i].location) {
        // create marker
        this.createMarkerIcon(dataShowOnMap[i].category);

        this.marker = L.marker(
          [dataShowOnMap[i].location.lat, dataShowOnMap[i].location.lng],
          { icon: this.markerIconDeselected }
        );

        this.marker.on(
          'mouseover',
          this.marker.bindPopup(
            '<h6><strong>' +
              dataShowOnMap[i].name +
              '</strong></h6>' +
              '</br></br>' +
              dataShowOnMap[i].address +
              '</br>' +
              dataShowOnMap[i].phone_number +
              "</br> <a href='" +
              dataShowOnMap[i].articleLink +
              "' target='_blank'>" +
              dataShowOnMap[i].articleLink +
              '</a>'
          )
        );

        if (
          this.tempNeighborhood == undefined ||
          this.tempNeighborhood.features[0].properties.name !=
            dataShowOnMap[i].neighborhood
        ) {
          await this.fetchNeighborByName(dataShowOnMap[i].neighborhood).then(
            res => {
              // Success
              if (res != undefined) {
                this.tempNeighborhood = res;
              } else {
                this.tempNeighborhood.features[0].properties.name =
                  dataShowOnMap[i].neighborhood;
              }
            }
          );
        }

        // check if the marker inside neighborhood else delete marker data
        var isMarkerInside = this.isMarkerInsideNeighborhood(
          this.marker,
          this.tempNeighborhood
        );
        if (isMarkerInside) {
          this.markers.addLayer(this.marker);
        }
        // else {
        // this.deleteCategory(dataShowOnMap[i]._id);
        // }
      }
    }

    this.map.addLayer(this.markers);
    this.loading = false;
  }

  createMarkerIcon(category) {
    if (category === 'Banks') {
      var markerIconPath = 'assets/images/catIconsPng/banks.png';
    } else if (category === 'Cafes') {
      var markerIconPath = 'assets/images/catIconsPng/cafes.png';
    } else if (category === 'Theatres') {
      var markerIconPath = 'assets/images/catIconsPng/theatres.png';
    } else if (category === 'Schools') {
      var markerIconPath = 'assets/images/catIconsPng/schools.png';
    } else if (category === 'Grocery') {
      var markerIconPath = 'assets/images/catIconsPng/grocery.png';
    } else if (category === 'Fitness') {
      var markerIconPath = 'assets/images/catIconsPng/fitness.png';
    } else if (category === 'Healthcare') {
      var markerIconPath = 'assets/images/catIconsPng/healthcare.png';
    } else if (category === 'Museum') {
      var markerIconPath = 'assets/images/catIconsPng/museum.png';
    } else if (category === 'Parks') {
      var markerIconPath = 'assets/images/catIconsPng/parks.png';
    } else if (category === 'Pharmacies') {
      var markerIconPath = 'assets/images/catIconsPng/pharmacies.png';
    } else if (category === 'Restaurants') {
      var markerIconPath = 'assets/images/catIconsPng/restaurants.png';
    } else if (category === 'Worship') {
      var markerIconPath = 'assets/images/catIconsPng/worship.png';
    } else if (category === 'Daycare') {
      var markerIconPath = 'assets/images/catIconsPng/daycare.png';
    } else if (category === 'New Developments') {
      var markerIconPath = 'assets/images/catIconsPng/newDevelopments.png';
    } else if (category === 'University') {
      var markerIconPath = 'assets/images/catIconsPng/university.png';
    } else if (category === 'NYPD') {
      var markerIconPath = 'assets/images/catIconsPng/nypd.png';
    }

    this.markerIconDeselected = L.icon({
      iconSize: [32, 48],
      iconAnchor: [13, 41],
      iconUrl: 'assets/images/marker-icon-black.png',
      shadowUrl: markerIconPath
    });
  }

  // return true if the marker is inside neighborhood
  isMarkerInsideNeighborhood(marker, neighborhoodGeoJson) {
    var inside = false;
    var point = L.latLng(marker.getLatLng());
    var myPolygon = L.geoJSON(neighborhoodGeoJson);

    var isMarkerInside = leafletPip.pointInLayer(point, myPolygon, true);
    isMarkerInside.length > 0 ? (inside = true) : (inside = false);
    return inside;
  }

  // fetch one neighborhood by its name
  fetchNeighborByName(nbr) {
    var nbrObject = { name: nbr };
    return new Promise((resolve, reject) => {
      this.dataService.fetchNeighborByName(nbrObject).subscribe(data => {
        resolve(data[0]);
      });
    });
  }

  // delete category
  deleteCategory(catId) {
    this.dataService.deleteCategory(catId).subscribe(
      res => {
        // console.log("Deleting category successfully.", res);
        var deletedx = res;
      },
      err => {
        console.log('Error occured while deleting category.', err);
      }
    );
  }

  removed = false;
  clicked(event) {
    this.removed = !this.removed;
  }

  onItemSelect(item: any) {
    console.log(item);
  }
  OnItemDeSelect(item: any) {
    console.log(item);
  }
  onSelectAll(items: any) {
    console.log(items);
  }
  onDeSelectAll(items: any) {
    console.log(items);
  }

  // Market Report Absorption Rates Work
  // get all dates for absorption dropdown
  getMonthsDropdown() {
    this.dataService.getMonthsDropdown().subscribe(
      res => {
        this.datesOfAbsorptionData = res;
        // show the latest date data on chart.
        var length = this.datesOfAbsorptionData.length;
        this.latestDate = new Date(this.datesOfAbsorptionData[length - 1]);
        // this.defaultDateNeighborhoodMethod(this.latestDate);
      },
      err => {
        console.log('Error occured while fetching months', err);
      }
    );
  }

  neighborhoodsNames: any;
  // get all the neighborhoods names for absorption dropdown
  getNeighborhoodsAbRt() {
    this.dataService.getNeighborhoodsAbRt().subscribe(
      res => {
        this.neighborhoodsNames = res;
        var tempArray = [];
        for (var i = 0; i < this.neighborhoodsNames.length; i++) {
          tempArray.push(this.neighborhoodsNames[i].neighborhoodName);
        }

        this.allNeighborhoodsAbRt = tempArray
          .map(s => s.toString())
          .filter((s, i, a) => a.indexOf(s) == i);

        // console.log("this.allNeighborhoodsAbRt:", this.allNeighborhoodsAbRt);

        this.allNeighborhoodsAbRt.splice(0, 0, 'All Neighborhoods');
      },
      err => {
        console.log('Error occured while fetching months', err);
      }
    );
  }

  selectedDateRange: any;
  // if date range != custom
  // and its like last year, last 2 years etc.
  selectDateRange(dr) {
    this.selectedDateRange = dr;
    console.log('selectDateRange dr:', dr);
    if (this.selectedDateRange != 'CustomDates') {
      var thisYear = new Date();
      thisYear.toISOString();
      if (this.selectedDateRange == 'LastYear') {
        var lastYear = new Date(thisYear);
        lastYear.setFullYear(lastYear.getFullYear() - 1);
        this.arSelectYear(lastYear);
        this.yearSelectection(lastYear.getFullYear(), thisYear.getFullYear());
      } else if (this.selectedDateRange == 'Last2Year') {
        var last2Year = new Date(thisYear);
        last2Year.setFullYear(last2Year.getFullYear() - 2);
        this.arSelectYear(last2Year);
        this.yearSelectection(last2Year.getFullYear(), thisYear.getFullYear());
      } else if (this.selectedDateRange == 'Last3Year') {
        var last3Year = new Date(thisYear);
        last3Year.setFullYear(last3Year.getFullYear() - 3);
        this.arSelectYear(last3Year);
        this.yearSelectection(last3Year.getFullYear(), thisYear.getFullYear());
      } else if (this.selectedDateRange == 'Last4Year') {
        var last4Year = new Date(thisYear);
        last4Year.setFullYear(last4Year.getFullYear() - 4);
        this.arSelectYear(last4Year);
        this.yearSelectection(last4Year.getFullYear(), thisYear.getFullYear());
      } else if (this.selectedDateRange == 'Last5Year') {
        var last5Year = new Date(thisYear);
        last5Year.setFullYear(last5Year.getFullYear() - 5);
        this.arSelectYear(last5Year);
        this.yearSelectection(last5Year.getFullYear(), thisYear.getFullYear());
      }
    }
  }

  // Select Neighborhood
  arSelectNeighborhood(nh) {
    console.log('arSelectNeighborhood nh:', nh);
    this.selectedNbr = nh;
  }
  // Select Year
  arSelectYear(d) {
    console.log('arSelectYear d:', d);
    d.type;
    this.selectedDate = d;
  }
  // fetching absorption rates data
  mrArFetchResults() {
    if (this.selectedNbr && this.selectedDate) {
      this.showDDSelectionError = '';
      if (this.selectedNbr === 'All Neighborhoods') {
        this.getAllNeighborhoodsAbRt();
      } else {
        this.getOneNeighborhoodAbRt();
      }
    } else {
      this.showDDSelectionError =
        'Please Select Dropdowns before Fetching the Data';
    }
  }

  abRtOfOneNeibhorhood: any;
  // get one neighborhood data from absorption rates based on specific date and neighborhood name
  getOneNeighborhoodAbRt() {
    this.dataService
      .getOneNeighborhoodAbRt({
        name: this.selectedNbr,
        date: this.selectedDate
      })
      .subscribe(
        res => {
          // destroy chart to delete the previous data from it otherwise it will also store the previous data.
          if (
            this.theReturnAbsorption !== undefined ||
            this.abRtOfOneNeibhorhood !== undefined ||
            this.theReturnMarketReports !== undefined ||
            this.theReturnMRBrooklyn !== undefined
          ) {
            // this.absorptionChart.destroy();
          }

          this.abRtOfOneNeibhorhood = res[0];
          this.showNoDataMessageBoolean =
            this.abRtOfOneNeibhorhood === undefined ? true : false;
          this.absorptionChart = new Chart(this.marketReportsChart, {
            type: 'bar',
            title: {
              text: 'Dynamic Data'
            },
            data: {
              labels: [this.abRtOfOneNeibhorhood.neighborhoodName],
              datasets: [
                {
                  label: 'Appartments',
                  backgroundColor: '#eae891',
                  hoverBackgroundColor: '#d7d569',
                  data: this.abRtOfOneNeibhorhood.APT
                },
                {
                  label: 'Condominiums',
                  backgroundColor: '#64bfc2',
                  hoverBackgroundColor: '#44abaf',
                  data: this.abRtOfOneNeibhorhood.CONDO
                },
                {
                  label: 'Cooperatives',
                  backgroundColor: '#9883cd',
                  hoverBackgroundColor: '#7c64b9',
                  data: this.abRtOfOneNeibhorhood.COOP
                }
              ]
            },
            options: this.abrt_chart_options
          });
        },
        err => {
          console.log('Error occured while fetching months', err);
        }
      );
  }

  // get all absorption rates data based on date e.g Jun 2018
  getAllNeighborhoodsAbRt() {
    this.dataService.getAllNeighborhoodsAbRt(this.selectedDate).subscribe(
      res => {
        // destroy chart to delete the previous data from it otherwise it will also store the previous data.
        if (
          this.theReturnAbsorption !== undefined ||
          this.abRtOfOneNeibhorhood !== undefined ||
          this.theReturnMarketReports !== undefined ||
          this.theReturnMRBrooklyn !== undefined
        ) {
          this.absorptionChart.destroy();
        }

        this.theReturnAbsorption = res;
        this.showNoDataMessageBoolean =
          this.theReturnAbsorption.length === 0 ? true : false;
        this.marketReportsAptsData = [];
        this.marketReportsCondoData = [];
        this.marketReportsCoopData = [];

        for (var i = 0; i < this.theReturnAbsorption.length; i++) {
          this.marketReportsAptsData.push(this.theReturnAbsorption[i].APT);
          this.marketReportsCondoData.push(this.theReturnAbsorption[i].CONDO);
          this.marketReportsCoopData.push(this.theReturnAbsorption[i].COOP);
        }

        this.absorptionChart = new Chart(this.marketReportsChart, {
          type: 'bar',
          title: {
            text: 'Dynamic Data'
          },
          data: {
            labels: [
              'All of Manhattan',
              'East Side',
              'West Side',
              'Midtown East',
              'Midtown West',
              'Downtown: South of 34th Street',
              'Upper Manhattan'
            ],
            datasets: [
              {
                label: 'Appartments',
                backgroundColor: '#eae891',
                hoverBackgroundColor: '#d7d569',
                data: this.marketReportsAptsData
              },
              {
                label: 'Condominiums',
                backgroundColor: '#64bfc2',
                hoverBackgroundColor: '#44abaf',
                data: this.marketReportsCondoData
              },
              {
                label: 'Cooperatives',
                backgroundColor: '#9883cd',
                hoverBackgroundColor: '#7c64b9',
                data: this.marketReportsCoopData
              }
            ]
          },
          options: this.abrt_chart_options
        });
      },
      err => {
        console.log('Error occured while fetching absorption data', err);
      }
    );
  }

  // Market Reports Average Prices Work
  selectedAbOrMr: any;
  selectedManhattanOrBrk: any;
  selectedMrRpNbr: any;

  theReturnMarketReports: any;
  marketReportsQuarter = [];
  marketReportsAvgPrice = [];
  marketReportsMedianPrice = [];
  theReturnMRBrooklyn: any;
  mRBrooklynQuarter = [];
  mRBrooklynAvgPrice = [];
  mRBrooklynMedianPrice = [];
  showNoDataMessage = 'Did not find the data for this selection.';
  showNoDataMessageBoolean: Boolean;

  hideArCustomDateDD = true;
  hideArAllNeighborhoodsDD = true;

  // Select Report Type
  selectAbOrMr(op) {
    this.selectedAbOrMr = op;
  }
  // Select Brough
  selectManhattanOrBrk(brough) {
    this.selectedManhattanOrBrk = brough;
  }
  // Select Neighborhood
  selectNeighborhoodAp(nh) {
    this.selectedMrRpNbr = nh;
  }
  // Select Price Type
  selectedavgOrMdnPrice: any;
  changePriceType(selectedavgOrMdnPrice) {
    this.selectedavgOrMdnPrice = selectedavgOrMdnPrice;
  }
  // date picker
  yearsSelected: any;
  startYearSelected: any;
  endYearSelected: any;
  years = [];
  yearSelectection(sYear, eYear) {
    if (sYear) this.startYearSelected = sYear;
    if (eYear) this.endYearSelected = eYear;

    this.yearsSelected = {
      startYear: this.startYearSelected,
      endYear: this.endYearSelected
    };
  }
  // end date picker

  showDDSelectionError: String = '';
  // Fetch Results
  // mr = Market Report, ap = Average Prices
  mrApFetchResults() {
    // console.log('this.selectedAbOrMr:', this.selectedAbOrMr);
    // console.log('this.selectedManhattanOrBrk:', this.selectedManhattanOrBrk);
    console.log('this.selectedMrRpNbr:', this.selectedMrRpNbr);
    // console.log('this.selectedavgOrMdnPrice:', this.selectedavgOrMdnPrice);
    console.log('this.yearsSelected:', this.yearsSelected);

    // destroy chart to delete the previous data from it otherwise it will also store the previous data.
    if (this.theReturnAbsorption !== undefined) {
      this.absorptionChart.destroy();
    }
    // For Fetching data and show on graph we need these two parameters.
    if (this.selectedMrRpNbr && this.yearsSelected) {
      this.showDDSelectionError = '';
      if (this.selectedManhattanOrBrk === 'Manhattan') {
        this.getAveragePricesDataForManhattan();
      } else if (this.selectedManhattanOrBrk === 'Brooklyn') {
        this.getAveragePricesDataForBroklyn();
      }
    } else {
      this.showDDSelectionError =
        'Please Select Dropdowns before Fetching the Data';
    }
  }

  // get one neighborhood market reports based on specific manhatan neighborhood name.
  getAveragePricesDataForManhattan() {
    // send neighborhood neighborhood name and yearsSelected
    this.dataService
      .getOneNeighborhoodMReport({
        name: this.selectedMrRpNbr,
        dateRange: this.yearsSelected
      })
      .subscribe(
        res => {
          // destroy chart to delete the previous data from it otherwise it will also store the previous data.
          if (
            this.theReturnAbsorption !== undefined ||
            this.abRtOfOneNeibhorhood !== undefined ||
            this.theReturnMarketReports !== undefined ||
            this.theReturnMRBrooklyn !== undefined
          ) {
            this.absorptionChart.destroy();
          }

          // is it req for med price or avg price
          this.theReturnMarketReports = res;
          this.showNoDataMessageBoolean =
            this.theReturnMarketReports.length === 0 ? true : false;

          this.marketReportsQuarter = [];
          this.marketReportsAvgPrice = [];
          this.marketReportsMedianPrice = [];

          for (var i = 0; i < this.theReturnMarketReports.length; i++) {
            var AveragePrice = this.theReturnMarketReports[
              i
            ].AveragePrice.replace(/[^0-9]+/g, '');
            var MedianPrice = this.theReturnMarketReports[
              i
            ].MedianPrice.replace(/[^0-9]+/g, '');
            this.marketReportsQuarter.push(
              this.theReturnMarketReports[i].Quarter
            );
            this.marketReportsAvgPrice.push(AveragePrice);
            this.marketReportsMedianPrice.push(MedianPrice);
          }

          if (this.selectedavgOrMdnPrice == 'Average Price') {
            this.absorptionChart = new Chart(this.marketReportsChart, {
              type: 'bar',
              title: {
                text: 'Dynamic Data'
              },
              data: {
                labels: this.marketReportsQuarter,
                datasets: [
                  {
                    label: 'Avg Price in $',
                    backgroundColor: '#62737B',
                    hoverBackgroundColor: '#62737B',
                    data: this.marketReportsAvgPrice
                  }
                ]
              },
              options: this.mrkrp_chart_options
            });
          } else if (this.selectedavgOrMdnPrice == 'Median Price') {
            this.absorptionChart = new Chart(this.marketReportsChart, {
              type: 'bar',
              title: {
                text: 'Dynamic Data'
              },
              data: {
                labels: this.marketReportsQuarter,
                datasets: [
                  {
                    label: 'Median Price in $',
                    backgroundColor: '#9fc151',
                    hoverBackgroundColor: '#9fc151',
                    data: this.marketReportsMedianPrice
                  }
                ]
              },
              options: this.mrkrp_chart_options
            });
          }
        },
        err => {
          console.log('Error occured while fetching months', err);
        }
      );
  }

  // get one neighborhood market reports based on specific brooklyne neighborhood name.
  getAveragePricesDataForBroklyn() {
    this.dataService
      .getOneNeighborhoodMRBrk({
        name: this.selectedMrRpNbr,
        dateRange: this.yearsSelected
      })
      .subscribe(
        res => {
          // destroy chart to delete the previous data from it otherwise it will also store the previous data.
          if (
            this.theReturnAbsorption !== undefined ||
            this.abRtOfOneNeibhorhood !== undefined ||
            this.theReturnMarketReports !== undefined ||
            this.theReturnMRBrooklyn !== undefined
          ) {
            this.absorptionChart.destroy();
          }

          this.theReturnMRBrooklyn = res;
          this.showNoDataMessageBoolean =
            this.theReturnMRBrooklyn.length === 0 ? true : false;

          this.mRBrooklynQuarter = [];
          this.mRBrooklynAvgPrice = [];
          this.mRBrooklynMedianPrice = [];

          for (var i = 0; i < this.theReturnMRBrooklyn.length; i++) {
            var AveragePrice = this.theReturnMRBrooklyn[i].AveragePrice.replace(
              /[^0-9]+/g,
              ''
            );
            var MedianPrice = this.theReturnMRBrooklyn[i].MedianPrice.replace(
              /[^0-9]+/g,
              ''
            );
            this.mRBrooklynQuarter.push(this.theReturnMRBrooklyn[i].Quarter);
            this.mRBrooklynAvgPrice.push(AveragePrice);
            this.mRBrooklynMedianPrice.push(MedianPrice);
          }

          if (this.selectedavgOrMdnPrice == 'Average Price') {
            this.absorptionChart = new Chart(this.marketReportsChart, {
              type: 'bar',
              title: {
                text: 'Dynamic Data'
              },
              data: {
                labels: this.mRBrooklynQuarter,
                datasets: [
                  {
                    label: 'Avg Price in $',
                    backgroundColor: '#62737B',
                    hoverBackgroundColor: '#62737B',
                    data: this.mRBrooklynAvgPrice
                  }
                ]
              },
              options: this.mrkrp_chart_options
            });
          } else if (this.selectedavgOrMdnPrice == 'Median Price') {
            this.absorptionChart = new Chart(this.marketReportsChart, {
              type: 'bar',
              title: {
                text: 'Dynamic Data'
              },
              data: {
                labels: this.mRBrooklynQuarter,
                datasets: [
                  {
                    label: 'Median Price in $',
                    backgroundColor: '#9fc151',
                    hoverBackgroundColor: '#9fc151',
                    data: this.mRBrooklynMedianPrice
                  }
                ]
              },
              options: this.mrkrp_chart_options
            });
          }
        },
        err => {
          console.log('Error occured while fetching months', err);
        }
      );
  }
}
