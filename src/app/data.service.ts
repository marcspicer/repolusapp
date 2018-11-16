import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

const url = environment.baseUrl;

@Injectable()
export class DataService {
  baseUrl: any;

  constructor(private http: HttpClient) {
    this.baseUrl = url;
  }

  // neighborhoods map work apis
  fetchNeighborhoodsShowOnMap(neighborhoodsToSend) {
    return this.http.post(
      this.baseUrl + '/api/getNeighborhoodsCoordinates',
      neighborhoodsToSend
    );
  }

  fetchNeighborOnHovor(nbrObject) {
    return this.http.post(
      this.baseUrl + '/api/getNeighborhoodCoordinates',
      nbrObject
    );
  }

  fetchCategoriesShowOnMap(body) {
    return this.http.post(this.baseUrl + '/api/getCategoriesCoordinates', body);
  }

  fetchNeighborByName(nbrObject) {
    return this.http.post(
      this.baseUrl + '/api/getNeighborhoodCoordinates',
      nbrObject
    );
  }

  deleteCategory(catId) {
    return this.http.delete(this.baseUrl + '/api/deleteCategory/' + catId);
  }

  // market report apis
  getMonthsDropdown() {
    return this.http.get(this.baseUrl + '/api/getMonthsAbsorption');
  }

  // get all neighborhoods name from abrates data for dropdown
  getNeighborhoodsAbRt() {
    return this.http.get(this.baseUrl + '/api/getNeighborhoodsAbRt');
  }

  // get one neighborhood data form abrates data based on specific date.
  getOneNeighborhoodAbRt(nbPlusDate) {
    return this.http.post(
      this.baseUrl + '/api/getOneNeighborhoodAbRt',
      nbPlusDate
    );
  }

  getAllNeighborhoodsAbRt(nmYr) {
    return this.http.get(this.baseUrl + '/api/getAllNeighborhoodsAbRt/' + nmYr);
  }

  // get one neighborhood market reports of manhattan based on specific neighborhood name.
  getOneNeighborhoodMReport(mrObject) {
    return this.http.post(
      this.baseUrl + '/api/getOneNeighborhoodMReport',
      mrObject
    );
  }

  // get one neighborhood market reports of brooklyn based on specific neighborhood name.
  getOneNeighborhoodMRBrk(mrObject) {
    return this.http.post(
      this.baseUrl + '/api/getOneNeighborhoodMRBrooklyn',
      mrObject
    );
  }

  // send email api
  sendEmail(recData) {
    return this.http.post(this.baseUrl + '/api/sendEmail', recData);
  }
}
