export type TRequestStatusOption =
  | 'not_started'
  | 'pending'
  | 'fulfilled'
  | 'rejected'
  | 'cancelled';

export type TRequestState = {
  status: TRequestStatusOption;
  error?: Error | null;
};

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
