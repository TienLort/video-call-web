export enum EIndicatorThresholdTypes {
  NO_THRESHOLD = 'NO_THRESHOLD',
  THRESHOLD_BY_EVERY_TIME = 'THRESHOLD_BY_EVERY_TIME',
  THRESHOLD_BY_EACH_HOUR = 'THRESHOLD_BY_EACH_HOUR',
  THRESHOLD_BY_EACH_EIGHT_HOUR = 'THRESHOLD_BY_EACH_EIGHT_HOUR',
  THRESHOLD_BY_EACH_DAY = 'THRESHOLD_BY_EACH_DAY',
  THRESHOLD_BY_RANGE = 'THRESHOLD_BY_RANGE',
}

export enum ESortOptions {
  NAME = 'name',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  DELETED_AT = 'deletedAt',
}

export enum ECameraAction {
  CREATE = 'CREATE',
  SHARE_LINK = 'SHARE_LINK',
  UPDATE = 'UPDATE',
  CLOSE = 'CLOSE',
}

export enum ECameraStatus {
  NORMAL = 'normal',
  ERROR = 'error',
  WARNING = 'warning',
  OFFLINE = 'offline',
}

export const TypeThresholdOptions = [
  {
    value: EIndicatorThresholdTypes.NO_THRESHOLD,
    label: 'Không có ngưỡng chỉ số',
  },
  {
    value: EIndicatorThresholdTypes.THRESHOLD_BY_EVERY_TIME,
    label: 'Ngưỡng chỉ số theo mỗi lần gửi',
  },
  {
    value: EIndicatorThresholdTypes.THRESHOLD_BY_EACH_HOUR,
    label: 'Ngưỡng chỉ số theo giờ',
  },
  {
    value: EIndicatorThresholdTypes.THRESHOLD_BY_EACH_EIGHT_HOUR,
    label: 'Ngưỡng chỉ số theo 8 giờ',
  },
  {
    value: EIndicatorThresholdTypes.THRESHOLD_BY_EACH_DAY,
    label: 'Ngưỡng chỉ số theo ngày',
  },
  {
    value: EIndicatorThresholdTypes.THRESHOLD_BY_RANGE,
    label: 'Ngưỡng chỉ số theo khoảng',
  },
];

export enum EGender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export const GenderOptions = [
  {
    value: EGender.MALE,
    label: 'Nam',
  },
  {
    value: EGender.FEMALE,
    label: 'Nữ',
  },
];

export enum EHostUnitTypes {
  GOVERNMENT = 'government',
  INDIVIDUAL = 'individual',
  ENTERPRISE = 'enterprise',
}
export const HostUnitOptions = [
  {
    value: EHostUnitTypes.GOVERNMENT,
    label: 'Nhà nước',
  },
  {
    value: EHostUnitTypes.INDIVIDUAL,
    label: 'Cá nhân',
  },
  {
    value: EHostUnitTypes.ENTERPRISE,
    label: 'Doanh nghiệp',
  },
];

export enum EMethodTypes {
  FTP = 'FTP',
  HTTP = 'HTTP',
  MQTT = 'MQTT',
}

export enum ERoleLevel {
  SUPER_ADMIN = 0,
  SYSTEM_ADMIN = 1,
  SYSTEM_USER = 2,
}
