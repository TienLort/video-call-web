export interface IProvince {
  code: string;
  name: string;
}

export interface IDistrict {
  code: string;
  name: string;
  province: string;
}

export interface ICommune {
  code: string;
  name: string;
  district: string;
}
