import { ReactNode } from 'react';

export type TMuiSize = 'small' | 'medium' | 'large';

export type TMuiColor =
  | 'warning'
  | 'default'
  | 'error'
  | 'info'
  | 'primary'
  | 'secondary'
  | 'success'
  | undefined;

export interface IModal {
  modalId: string;
  modalComponent?: ReactNode;
}

export interface IModalState {
  [modalId: string]: {
    open: boolean;
    modalComponent: ReactNode;
  };
}

export interface ITabItem {
  key: string;
  label: string;
  component: ReactNode;
  typeTab?: string;
}

export interface IPagination<T> {
  totalData: number;
  data: T[];
}
export interface IErrorsDetail {
  [x: string]: { id: string; message: string }[];
}

export interface IErrors {
  id: string;
  message: string;
  statusCode: number;
  errors: IErrorsDetail;
  detail?: string;
}
