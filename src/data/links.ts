import type { SourceLink } from '../types';

export const officialLinks = {
  skyLagoon: { label: 'Sky Lagoon 官方站', url: 'https://www.skylagoon.com/', kind: '官方' },
  visitSkyLagoon: { label: 'Visit Reykjavik - Sky Lagoon', url: 'https://visitreykjavik.is/service/sky-lagoon', kind: '官方' },
  glacierAdventure: { label: 'Glacier Adventure 官方站', url: 'https://glacieradventure.is/', kind: '官方' },
  glacierSummer: { label: 'Glacier Adventure Summer Tour', url: 'https://glacieradventure.is/tour/glacier-adventure-summer-tour/', kind: '官方' },
  road: { label: '冰岛实时路况 umferdin.is', url: 'https://umferdin.is/en', kind: '安全' },
  safetravel: { label: 'Safetravel Iceland', url: 'https://safetravel.is/', kind: '安全' },
  vedur: { label: 'Vedur 天气预报', url: 'https://en.vedur.is/weather/forecasts/areas/', kind: '天气' },
  norwayBest: { label: 'Norway’s Best Nærøyfjord Cruise', url: 'https://www.norwaysbest.com/en/flam/things-to-do/fjord-cruise-naeroyfjord', kind: '交通' },
  flytoget: { label: 'Flytoget 机场快线', url: 'https://flytoget.no/en/', kind: '交通' },
  hsl: { label: 'HSL Helsinki Airport Train', url: 'https://www.hsl.fi/en/travelling/visitors/airport-train', kind: '交通' },
  chinaNorway: { label: '中国驻挪威大使馆', url: 'http://no.china-embassy.gov.cn/', kind: '使馆' },
  chinaIceland: { label: '中国驻冰岛大使馆', url: 'http://is.china-embassy.gov.cn/', kind: '使馆' },
} satisfies Record<string, SourceLink>;

export const preTripReviewLinks: SourceLink[] = [
  officialLinks.road,
  officialLinks.safetravel,
  officialLinks.vedur,
  officialLinks.glacierAdventure,
  officialLinks.skyLagoon,
  officialLinks.norwayBest,
];
