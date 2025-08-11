import { ReactElement } from 'react';
import type { Column } from '../../../hooks/useJson';

export interface FormInputProps<T = any> {
  value: T;
  onChange: (value: T) => void;
  schema: any;
  jsonData?: Column[];
  schemaId?: string;
  baseTPath?: string;
}

export interface FormInputComponent<T = any> {
  (props: FormInputProps<T>): ReactElement;
}
