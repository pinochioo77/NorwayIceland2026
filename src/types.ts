import type { ReactNode } from 'react';

export type LinkKind = '官方' | '地图' | '天气' | '安全' | '交通' | '使馆' | '介绍' | '图片' | '停车';

export type SourceLink = {
  label: string;
  url: string;
  kind: LinkKind;
};

export type TimelineItem = {
  time: string;
  place: string;
  title: string;
  transport?: string;
  note?: string;
  required?: boolean;
  optional?: boolean;
};

export type PlaceInfo = {
  id: string;
  date: string;
  attachTime: string;
  place: string;
  title: string;
  description?: string;
  introUrl?: string;
  imageSourceUrl?: string;
  localImage?: string;
  mapUrl?: string;
  parkingUrl?: string;
  parkingNote?: string;
  sortOrder: number;
};

export type LodgingSummary = {
  id: string;
  date: string;
  attachTime: string;
  name: string;
  city: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  checkInTime?: string;
  checkOutTime?: string;
  room?: string;
  area?: string;
  bed?: string;
  facilities: string[];
  address?: string;
  phone?: string;
  platform?: string;
  amount?: string;
  cancelPolicy?: string;
  note?: string;
  images: string[];
  sortOrder: number;
};

export type TripDay = {
  date: string;
  area: string;
  stay: string;
  summary: string;
  meal: string;
  cost?: string;
  drive?: string;
  fuel?: string;
  riskTags: string[];
  route: string;
  heroImage?: string;
  galleryImages?: string[];
  timeline: TimelineItem[];
  reminders: string[];
  links: SourceLink[];
};

export type ChecklistItem = {
  label: string;
  group: string;
  detail?: string;
};

export type MapStop = {
  date: string;
  label: string;
  detail: string;
  fuelUrl: string;
  marketUrl: string;
};

export type DecisionRule = {
  condition: string;
  action: string;
};

export type BookingKind = '交通' | '住宿' | '活动' | '租车';

export type BookingSummary = {
  id: string;
  date: string;
  attachTime: string;
  kind: BookingKind;
  title: string;
  vendor: string;
  location: string;
  displayTime: string;
  amount?: string;
  status: string;
  facts: string[];
  reminder?: string;
  links?: SourceLink[];
  sortOrder: number;
};

export type MetricProps = {
  icon: ReactNode;
  label: string;
  value: string;
};
