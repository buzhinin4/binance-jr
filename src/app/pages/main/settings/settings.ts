import { Component, EventEmitter, inject, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IndicatorsActions } from '../../../store/indicators/indicators.actions';

@Component({
  selector: 'app-settings',
  imports: [ReactiveFormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {
  private store = inject(Store);
  private fb = inject(FormBuilder);

  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }

  form: FormGroup = this.fb.group({
    smaEnabled: [false],
    smaPeriod: [{ value: null, disabled: true }, [Validators.required, Validators.min(1)]],

    emaEnabled: [false],
    emaPeriod: [{ value: null, disabled: true }, [Validators.required, Validators.min(1)]],
  });

  constructor() {
    this.form.get('smaEnabled')!.valueChanges.subscribe((enabled) => {
      const ctrl = this.form.get('smaPeriod')!;
      enabled ? ctrl.enable() : ctrl.disable();
    });

    this.form.get('emaEnabled')!.valueChanges.subscribe((enabled) => {
      const ctrl = this.form.get('emaPeriod')!;
      enabled ? ctrl.enable() : ctrl.disable();
    });
  }

  submit() {
    const { smaEnabled, smaPeriod, emaEnabled, emaPeriod } = this.form.value;

    if (smaEnabled) {
      this.store.dispatch(IndicatorsActions.calculateSma({ period: +smaPeriod }));
    } else {
      this.store.dispatch(IndicatorsActions.smaClear());
    }

    if (emaEnabled) {
      this.store.dispatch(IndicatorsActions.calculateEma({ period: +emaPeriod }));
    } else {
      this.store.dispatch(IndicatorsActions.emaClear());
    }

    this.onClose();
  }
}
