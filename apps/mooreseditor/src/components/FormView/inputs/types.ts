import { ReactElement } from 'react';

export interface FormInputProps<T = any> {
  value: T;
  onChange: (value: T) => void;
  schema: any;
}

export interface FormInputComponent<T = any> {
  (props: FormInputProps<T>): ReactElement;
}