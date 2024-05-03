import { Observable, combineLatest, map, of, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Country, Region, SmallCountry } from '../interfaces/country';

@Injectable({
  providedIn: 'root'
})
export class CountriesService {

  private baseUrl: string = 'https://restcountries.com/v3.1';
  private _regions: Region[] = [Region.Africa, Region.Americas, Region.Antarctic, Region.Asia, Region.Europe, Region.Oceania];

  constructor(private http: HttpClient) { }

  public get regions(): Region[] {
    return [...this._regions];
  }

  getCountryByRegion( region: Region ): Observable<SmallCountry[]> {
    if ( !region ) return of([]);

    const url: string = this.baseUrl+"/region/"+region+"?fields=name,cca3,borders";

    //Transformamos la resp Country[] a SmallCountry[]
    return this.http.get<Country[]>(url)
      .pipe(
        map( countries => countries.map( country => ({
          name: country.name.common,
          cca3: country.cca3,
          borders: country.borders ?? [],
        })))
      );
  }

  getCountryByAlphaCode( cca3: string): Observable<SmallCountry> {
    const url: string = this.baseUrl+"/alpha/"+cca3+"?fields=name,cca3,borders";
    return this.http.get<Country>(url)
      .pipe(
        map( country => ({
          name: country.name.common,
          cca3: country.cca3,
          borders: country.borders ?? [],
        }))
      );

  }

  getCountriesBordersByCode( borders: string [] ): Observable<SmallCountry[]> {
    if( !borders || borders.length === 0 ) return of([]);

    const countriesRequests: Observable<SmallCountry>[] = [];
    borders.forEach( code => {
      const request = this.getCountryByAlphaCode( code );
      countriesRequests.push(request);
    });

    return combineLatest( countriesRequests );

  }
}
