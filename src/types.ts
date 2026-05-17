import type { ReactNode } from 'react';

export type LinkKind = '官方' | '地图' | '天气' | '安全' | '交通' | '使馆';

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

export type TicketKind = '交通' | '住宿' | '活动' | '租车';

export type TicketSummary = {
  id: string;
  date: string;
  dateRange?: string;
  kind: TicketKind;
  title: string;
  vendor: string;
  primaryTime: string;
  location: string;
  amount?: string;
  status: string;
  facts: string[];
  reminders: string[];
  links?: SourceLink[];
};

export type MetricProps = {
  icon: ReactNode;
  label: string;
  value: string;
};
