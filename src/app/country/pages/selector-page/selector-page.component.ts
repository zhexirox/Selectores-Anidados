import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CountriesService } from '../../services/countries.service';
import { Region, SmallCountry } from '../../interfaces/country';
import { filter, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-selector-page',
  templateUrl: './selector-page.component.html',
  styles: ``
})
export class SelectorPageComponent implements OnInit {

  public countriesByRegion: SmallCountry[] = [];
  public borders: SmallCountry[] = [];

  public myForm: FormGroup = this.fb.group({
    region: ['', Validators.required],
    country: ['', Validators.required],
    border: ['', Validators.required],
  });

  constructor (
    private fb: FormBuilder,
    private countryService: CountriesService
  ) {}

  ngOnInit(): void {
    this.onRegionChanged();
    this.onCountryChange();

  }

  get regions(): Region[] {
    return this.countryService.regions;
  }

  onRegionChanged(): void {

    this.myForm.get('region')!.valueChanges
      .pipe(
        //Al cambiar de region, el country lo ponemos valor por defecto
        //Despues mandamos regions y nos devuelve smallcountry[]
        tap( () => this.myForm.get('country')?.setValue('') ),
        tap( () => this.borders = [] ),
        switchMap( region => this.countryService.getCountryByRegion(region) )
      )
      .subscribe( countries => {
        this.countriesByRegion = countries;
        this.countriesByRegion.sort( (a,b) => a.name > b.name ? 1 : -1);
      });

  }

  onCountryChange(): void {

    this.myForm.get('country')!.valueChanges
      .pipe(
        tap( () => this.myForm.get('border')?.setValue('') ),
        filter( (value: string) => value.length > 0),
        switchMap( cca3 => this.countryService.getCountryByAlphaCode(cca3) ),
        switchMap( country => this.countryService.getCountriesBordersByCode(country.borders))
      )
      .subscribe( countries => {
        //console.log({borders: country.borders});
        this.borders = countries;
        // this.countriesByRegion = borders;
        // this.countriesByRegion.sort( (a,b) => a.name > b.name ? 1 : -1);
      });

  }


}
