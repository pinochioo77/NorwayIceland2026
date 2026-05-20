import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  AlertTriangle,
  CalendarDays,
  Car,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  CloudSun,
  ExternalLink,
  Fuel,
  Hotel,
  Info,
  Luggage,
  MapPinned,
  Navigation,
  ParkingCircle,
  Phone,
  Route,
  ShieldAlert,
  Utensils,
  WalletCards,
} from 'lucide-react';
import { drivingNotes, emergencyContacts, fuelMarketStops, packingList, todos, weatherDecisionRules } from './data/checklists';
import { bookings } from './data/generated/bookings';
import { lodgings } from './data/generated/lodgings';
import { places } from './data/generated/places';
import { officialLinks } from './data/links';
import { totalCost, tripDays } from './data/trip';
import type { BookingSummary, ChecklistItem, LodgingSummary, MetricProps, PlaceInfo, SourceLink, TripDay } from './types';

const tabs = ['每日行程', '自驾与路况', '出发前清单', '费用与待办', '紧急联系'] as const;
type Tab = (typeof tabs)[number];

type TripClockState = {
  phase: 'before' | 'during' | 'after';
  label: string;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

type DayVisual = {
  src: string;
  alt: string;
};

const tripStart = new Date('2026-09-25T20:50:00+08:00');
const tripEnd = new Date('2026-10-06T18:25:00+08:00');
const maskedCost = '*** RMB';

const weatherReviewLinks = [officialLinks.road, officialLinks.safetravel, officialLinks.vedur];

const dayCoverImages: Record<string, string[]> = {
  '9/25': ['./assets/places/pudong-airport-t2.jpg'],
  '9/26': ['./assets/places/royal-palace-oslo.jpg'],
  '9/27': ['./assets/places/flam-fjord.jpg'],
  '9/28': ['./assets/places/bryggen.jpg'],
  '9/29': ['./assets/places/keflavik-airport.jpg'],
  '10/2': ['./assets/places/seljalandsfoss.jpg'],
  '10/3': ['./assets/places/jokulsarlon.jpg'],
  '10/6': ['./assets/places/pudong-airport-t2.jpg'],
};

const weatherPoints: Record<string, { label: string; latitude: number; longitude: number }> = {
  '9/25': { label: 'Helsinki / Oslo', latitude: 60.1699, longitude: 24.9384 },
  '9/26': { label: 'Oslo', latitude: 59.9139, longitude: 10.7522 },
  '9/27': { label: 'Voss', latitude: 60.6287, longitude: 6.4147 },
  '9/28': { label: 'Bergen', latitude: 60.3913, longitude: 5.3221 },
  '9/29': { label: 'Reykjavik', latitude: 64.1466, longitude: -21.9426 },
  '9/30': { label: 'Reykjanes', latitude: 63.9998, longitude: -22.5583 },
  '10/1': { label: 'Hella', latitude: 63.8356, longitude: -20.4006 },
  '10/2': { label: 'Vik / Hali', latitude: 63.4186, longitude: -19.006 },
  '10/3': { label: 'Jokulsarlon / Hofn', latitude: 64.0477, longitude: -16.179 },
  '10/4': { label: 'Keflavik / Gardur', latitude: 63.9998, longitude: -22.5583 },
  '10/5': { label: 'Helsinki', latitude: 60.1699, longitude: 24.9384 },
  '10/6': { label: 'Shanghai', latitude: 31.2304, longitude: 121.4737 },
};

const tabIcons: Record<Tab, ReactNode> = {
  每日行程: <Route aria-hidden />,
  自驾与路况: <Car aria-hidden />,
  出发前清单: <CheckCircle2 aria-hidden />,
  费用与待办: <WalletCards aria-hidden />,
  紧急联系: <Phone aria-hidden />,
};

const fallbackDayImages: Record<string, string[]> = {
  '9/25': ['./assets/places/pudong-airport-t2.jpg'],
  '9/26': ['./assets/places/oslo-opera-house.jpg', './assets/places/royal-palace-oslo.jpg', './assets/places/aker-brygge.jpg'],
  '9/27': ['./assets/places/flam-railway.jpg', './assets/places/naeroyfjord.jpg', './assets/places/flam-fjord.jpg'],
  '9/28': ['./assets/places/vangsvatnet-voss.jpg', './assets/places/bryggen.jpg', './assets/places/mount-fl-yen.jpg'],
  '9/29': ['./assets/places/seltun-reykjanes.jpg'],
  '10/5': ['./assets/places/helsinki-cathedral.jpg'],
  '10/6': ['./assets/places/pudong-airport-t2.jpg'],
};

const placeImageRules: Array<[string, string]> = [
  ['reynisfjara', './assets/places/reynisfjara-black-sand-beach.jpg'],
  ['black sand', './assets/places/reynisfjara-black-sand-beach.jpg'],
  ['diamond beach', './assets/places/diamond-beach.jpg'],
  ['keflavik airport', './assets/places/keflavik-airport.jpg'],
  ['keflavik / kef', './assets/places/keflavik-airport.jpg'],
  ['bergen airport', './assets/places/keflavik-airport.jpg'],
  ['pudong', './assets/places/pudong-airport-t2.jpg'],
  ['shanghai', './assets/places/pudong-airport-t2.jpg'],
  ['oslo-opera-house', './assets/places/oslo-opera-house.jpg'],
  ['opera house', './assets/places/oslo-opera-house.jpg'],
  ['royal-palace-oslo', './assets/places/royal-palace-oslo.jpg'],
  ['royal palace', './assets/places/royal-palace-oslo.jpg'],
  ['aker-brygge', './assets/places/aker-brygge.jpg'],
  ['flam-railway', './assets/places/flam-railway.jpg'],
  ['flåm railway', './assets/places/flam-railway.jpg'],
  ['myrdal', './assets/places/flam-railway.jpg'],
  ['naeroyfjord', './assets/places/naeroyfjord.jpg'],
  ['nærøyfjord', './assets/places/naeroyfjord.jpg'],
  ['gudvangen', './assets/places/naeroyfjord.jpg'],
  ['flåm', './assets/places/flam-fjord.jpg'],
  ['flam', './assets/places/flam-fjord.jpg'],
  ['voss-gondol', './assets/places/vangsvatnet-voss.jpg'],
  ['vangsvatnet', './assets/places/vangsvatnet-voss.jpg'],
  ['voss', './assets/places/vangsvatnet-voss.jpg'],
];

const placeNameRules: Array<[string, string]> = [
  ['Shanghai Pudong T2', '上海浦东 T2'],
  ['Shanghai Pudong International Airport', '上海浦东机场'],
  ['Helsinki-Vantaa', '赫尔辛基万塔机场'],
  ['Helsinki Airport', '赫尔辛基机场'],
  ['Helsinki city centre', '赫尔辛基市中心'],
  ['Helsinki City Centre', '赫尔辛基市中心'],
  ['Helsinki citywalk', '赫尔辛基城市步行'],
  ['Helsinki Cathedral', '赫尔辛基大教堂 Helsinki Cathedral'],
  ['Oslo Airport', '奥斯陆机场 Oslo Airport'],
  ['Oslo Opera House', '奥斯陆歌剧院 Oslo Opera House'],
  ['Karl Johans gate', '卡尔约翰大道 Karl Johans gate'],
  ['The Royal Palace', '奥斯陆王宫 The Royal Palace'],
  ['Aker Brygge', '阿克尔码头 Aker Brygge'],
  ['Oslo S', '奥斯陆中央车站 Oslo S'],
  ['Flåm', '弗洛姆 Flåm'],
  ['Myrdal', '米达尔 Myrdal'],
  ['Gudvangen', '居德旺恩 Gudvangen'],
  ['Voss', '沃斯 Voss'],
  ['Vangsvatnet', '旺斯湖 Vangsvatnet'],
  ['Voss Gondol', '沃斯缆车 Voss Gondol'],
  ['Hangurstoppen', '汉古尔山顶 Hangurstoppen'],
  ['Bergen Airport', '卑尔根机场 Bergen Airport'],
  ['Bergen', '卑尔根 Bergen'],
  ['Bryggen', '布吕根 Bryggen'],
  ['Mount Fløyen', '弗洛伊恩山 Mount Fløyen'],
  ['Keflavik Airport', '凯夫拉维克机场 KEF'],
  ['Keflavik', '凯夫拉维克 Keflavik'],
  ['KEF', '凯夫拉维克机场 KEF'],
  ['Reykjavik', '雷克雅未克 Reykjavik'],
  ['Hallgrimskirkja', '哈尔格林姆教堂 Hallgrimskirkja'],
  ['Reykjanes Peninsula', '雷克雅内斯半岛 Reykjanes Peninsula'],
  ['Seltún', '塞尔屯地热区 Seltún'],
  ['Gunnuhver', '贡努凯尔地热区 Gunnuhver'],
  ['Reykjanesviti', '雷克雅内斯灯塔 Reykjanesviti'],
  ['Sky Lagoon', '天空温泉 Sky Lagoon'],
  ['Thingvellir National Park', '辛格维利尔国家公园 Thingvellir'],
  ['Thingvellir', '辛格维利尔 Thingvellir'],
  ['Geysir Geothermal Area', '盖锡尔地热区 Geysir'],
  ['Geysir', '盖锡尔 Geysir'],
  ['Gullfoss Waterfall', '黄金瀑布 Gullfoss'],
  ['Gullfoss', '黄金瀑布 Gullfoss'],
  ['Kerid Crater', '凯瑞斯火山口湖 Kerið'],
  ['Kerid', '凯瑞斯火山口湖 Kerið'],
  ['Kerið', '凯瑞斯火山口湖 Kerið'],
  ['Hella', '海拉 Hella'],
  ['Seljalandsfoss', '塞里雅兰瀑布 Seljalandsfoss'],
  ['Gljufrabui', '秘密瀑布 Gljúfrabúi'],
  ['Skogafoss', '斯科加瀑布 Skógafoss'],
  ['Kvernufoss', '克维努瀑布 Kvernufoss'],
  ['Dyrholaey', '迪霍拉里海岬 Dyrhólaey'],
  ['Reynisfjara Black Sand Beach', '雷尼斯黑沙滩 Reynisfjara'],
  ['Reynisfjara', '雷尼斯黑沙滩 Reynisfjara'],
  ['Vik', '维克 Vík'],
  ['Hali', '哈利 Hali'],
  ['Skyrhúsið Guesthouse', 'Skyrhúsið 旅馆'],
  ['Glacier Adventure Base Camp', 'Glacier Adventure 集合基地'],
  ['Vatnajökull Glacier', '瓦特纳冰川 Vatnajökull Glacier'],
  ['Fjallsarlon', 'Fjallsárlón 冰河湖'],
  ['Jökulsárlón Glacier Lagoon', '杰古沙龙冰河湖 Jökulsárlón'],
  ['Jökulsárlón', '杰古沙龙冰河湖 Jökulsárlón'],
  ['Diamond Beach', '钻石沙滩 Diamond Beach'],
  ['Höfn', '赫本 Höfn'],
  ['Fjaðrárgljúfur Canyon', '羽毛峡谷 Fjaðrárgljúfur'],
  ['Fjaðrárgljúfur', '羽毛峡谷 Fjaðrárgljúfur'],
  ['South Coast', '冰岛南岸 South Coast'],
  ['Lighthouse-Inn', 'Lighthouse-Inn 机场住宿'],
];

export function App() {
  const [activeDay, setActiveDay] = useState(tripDays[0].date);
  const [activeTab, setActiveTab] = useState<Tab>('每日行程');
  const tripClock = useTripClock();
  const currentDay = tripDays.find((day) => day.date === activeDay) ?? tripDays[0];

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand-lockup" href="#top" aria-label="Escape 66 North">
          <img className="brand-logo" src="./assets/brand/logo-small.png" alt="" aria-hidden />
          <span>Escape</span>
          <strong>66°N</strong>
        </a>
        <nav className="top-nav" aria-label="页面栏目">
          {tabs.map((tab) => (
            <button key={tab} className={tab === activeTab ? 'active' : ''} onClick={() => setActiveTab(tab)}>
              {tabIcons[tab]}
              <span>{tab}</span>
            </button>
          ))}
        </nav>
      </header>

      <main id="top">
        <section className="home-hero" aria-label="旅行手册总览">
          <div className="hero-copy">
            <p className="eyebrow">Norway · Iceland · Helsinki</p>
            <h1>Escape:66°N</h1>
            <p className="hero-subtitle">挪威冰岛同行旅行手册</p>
          </div>

          <div className="hero-side">
            <TripCountdown clock={tripClock} />
            <div className="status-grid" aria-label="旅行总览">
              <Metric icon={<CalendarDays />} label="日期" value="2026.09.25 - 10.06" />
              <Metric icon={<Navigation />} label="主线" value="Oslo · Bergen · South Iceland" />
              <Metric icon={<CircleDollarSign />} label="预算" value={maskMoney(totalCost)} />
              <WeatherWidget day={currentDay} />
            </div>
          </div>
        </section>

        <section className="review-strip section-shell" aria-label="天气路况复查">
          <div>
            <p className="eyebrow">Live checks</p>
            <h2>天气 / 路况复查</h2>
          </div>
          <div className="review-links">
            {weatherReviewLinks.map((link) => (
              <LinkButton key={link.url} link={link} compact />
            ))}
          </div>
        </section>

        {activeTab === '每日行程' && (
          <section className="itinerary-layout section-shell" aria-label="每日行程">
            <aside className="day-nav" aria-label="日期导航">
              {tripDays.map((day, index) => (
                <button key={day.date} className={day.date === activeDay ? 'selected' : ''} onClick={() => setActiveDay(day.date)}>
                  <span>{day.date}</span>
                  <small>{String(index + 1).padStart(2, '0')} · {day.area}</small>
                </button>
              ))}
            </aside>
            <DayDetail day={currentDay} />
          </section>
        )}

        {activeTab === '自驾与路况' && <DrivingPanel />}
        {activeTab === '出发前清单' && <ChecklistPanel />}
        {activeTab === '费用与待办' && <CostsPanel />}
        {activeTab === '紧急联系' && <EmergencyPanel />}
      </main>
    </div>
  );
}

function useTripClock(): TripClockState {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1_000);
    return () => window.clearInterval(timer);
  }, []);

  if (now < tripStart) {
    return { phase: 'before', label: '距离出发', ...durationParts(tripStart.getTime() - now.getTime()) };
  }

  if (now <= tripEnd) {
    return { phase: 'during', label: '已出发', ...durationParts(now.getTime() - tripStart.getTime()) };
  }

  return { phase: 'after', label: '已过去', ...durationParts(now.getTime() - tripEnd.getTime()) };
}

function durationParts(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const totalMinutes = Math.floor(totalSeconds / 60);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

function maskMoney(value?: string) {
  if (!value) return maskedCost;
  const masked = value.replace(/[0-9][0-9,]*(?:\.[0-9]+)?/g, '***');
  return masked === value ? maskedCost : masked;
}

function TripCountdown({ clock }: { clock: TripClockState }) {
  return (
    <div className={`countdown-card ${clock.phase}`}>
      <span className="countdown-label">{clock.label}</span>
      <div className="countdown-value">
        <strong>{clock.days}</strong><span>天</span>
        <strong>{clock.hours}</strong><span>小时</span>
        <strong>{clock.minutes}</strong><span>分钟</span>
        <strong>{clock.seconds}</strong><span>秒</span>
      </div>
      <p className="countdown-note">按北京时间 / 浏览器本地时间动态计算</p>
    </div>
  );
}

function Metric({ icon, label, value }: MetricProps) {
  return (
    <div className="metric">
      <span className="metric-icon">{icon}</span>
      <span>
        <small>{label}</small>
        <strong>{value}</strong>
      </span>
    </div>
  );
}

type WeatherState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | {
      status: 'ready';
      temperature: number;
      wind: number;
      code: number;
      high?: number;
      low?: number;
      precipitation?: number;
      updatedAt: string;
    };

function WeatherWidget({ day }: { day: TripDay }) {
  const point = weatherPoints[day.date] ?? weatherPoints['9/29'];
  const [weather, setWeather] = useState<WeatherState>({ status: 'loading' });

  useEffect(() => {
    const controller = new AbortController();
    setWeather({ status: 'loading' });
    const params = new URLSearchParams({
      latitude: String(point.latitude),
      longitude: String(point.longitude),
      current: 'temperature_2m,weather_code,wind_speed_10m',
      daily: 'temperature_2m_max,temperature_2m_min,precipitation_probability_max',
      timezone: 'auto',
      forecast_days: '3',
    });

    fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Weather ${response.status}`);
        return response.json();
      })
      .then((data) => {
        setWeather({
          status: 'ready',
          temperature: Math.round(data.current?.temperature_2m),
          wind: Math.round(data.current?.wind_speed_10m),
          code: Number(data.current?.weather_code ?? 0),
          high: Math.round(data.daily?.temperature_2m_max?.[0]),
          low: Math.round(data.daily?.temperature_2m_min?.[0]),
          precipitation: Math.round(data.daily?.precipitation_probability_max?.[0]),
          updatedAt: data.current?.time ?? '',
        });
      })
      .catch((error: unknown) => {
        if ((error as Error).name !== 'AbortError') {
          setWeather({ status: 'error', message: '天气暂不可用' });
        }
      });

    return () => controller.abort();
  }, [point.latitude, point.longitude]);

  return (
    <div className="weather-card" aria-live="polite">
      <span className="metric-icon"><CloudSun aria-hidden /></span>
      <div className="weather-main">
        <small>目的地天气 · {point.label}</small>
        {weather.status === 'ready' ? (
          <>
            <strong>{weather.temperature}°C · {weatherCodeText(weather.code)}</strong>
            <span>{weather.low}°/{weather.high}° · 风 {weather.wind} km/h · 降水 {weather.precipitation ?? 0}%</span>
          </>
        ) : (
          <>
            <strong>{weather.status === 'loading' ? '读取中' : weather.message}</strong>
            <span>短期预报，出发前仍以官方天气为准</span>
          </>
        )}
      </div>
    </div>
  );
}

function weatherCodeText(code: number) {
  if (code === 0) return '晴';
  if ([1, 2, 3].includes(code)) return '多云';
  if ([45, 48].includes(code)) return '雾';
  if ([51, 53, 55, 56, 57].includes(code)) return '毛毛雨';
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return '雨';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return '雪';
  if ([95, 96, 99].includes(code)) return '雷暴';
  return '天气变化';
}

function DayDetail({ day }: { day: TripDay }) {
  const dayWarning = criticalDayWarnings[day.date];
  const dayBookings = bookings.filter((booking) => booking.date === day.date);
  const dayLodgings = lodgings.filter((lodging) => lodging.date === day.date);
  const dayPlaces = places.filter((place) => place.date === day.date);
  const dayVisuals = useMemo(() => getDayVisuals(day, dayPlaces, dayLodgings), [day, dayPlaces, dayLodgings]);
  const placeImages = useMemo(() => buildPlaceImageAssignments(dayPlaces, dayVisuals), [dayPlaces, dayVisuals]);
  const dayIndex = tripDays.findIndex((item) => item.date === day.date) + 1;
  const showDrive = Boolean(day.drive && !day.drive.includes('非自驾'));
  const showFuel = Boolean(showDrive && day.fuel && !day.fuel.includes('按当天状态'));

  return (
    <article className="day-detail">
      <section className="day-cover">
        <div className="cover-carousel" aria-label={`${day.area} 图片轮播`}>
          {dayVisuals.map((visual, index) => (
            <figure className="cover-slide" key={`${visual.src}-${index}`}>
              <img src={visual.src} alt={visual.alt} loading={index === 0 ? 'eager' : 'lazy'} />
            </figure>
          ))}
        </div>
        {dayVisuals.length > 1 && (
          <div className="cover-dots" aria-hidden>
            {dayVisuals.map((visual) => <span key={visual.src} />)}
          </div>
        )}
        <div className="cover-content">
          <p className="eyebrow">Day {String(dayIndex).padStart(2, '0')} · {day.route}</p>
          <h2>{day.date} · {day.area}</h2>
          <p>{day.summary}</p>
          <div className="tag-row">
            {day.riskTags.map((tag) => (
              <span key={tag} className="risk-tag">{tag}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="quick-facts" aria-label="当天摘要">
        <Fact icon={<Hotel />} label="住宿" value={day.stay} />
        <Fact icon={<Utensils />} label="吃饭" value={day.meal} />
        <Fact icon={<CircleDollarSign />} label="费用" value={maskMoney(day.cost)} />
        {showDrive && <Fact icon={<Car />} label="驾驶" value={day.drive as string} />}
        {showFuel && <Fact icon={<Fuel />} label="加油" value={day.fuel as string} />}
      </section>

      {dayWarning && (
        <section className="alert-strip day-alert" aria-label="当天风险提示">
          <AlertTriangle aria-hidden />
          <div>
            <strong>{dayWarning.title}：</strong>
            {dayWarning.message}
          </div>
        </section>
      )}

      <section className="timeline" aria-label="当天时间轴">
        {day.timeline.map((item, index) => {
          const itemBookings = dayBookings.filter((booking) => booking.attachTime === item.time);
          const itemLodgings = dayLodgings.filter((lodging) => lodging.attachTime === item.time);
          const itemPlaces = dayPlaces.filter((place) => place.attachTime === item.time);

          return (
            <div className="timeline-row" key={`${item.time}-${item.title}`}>
              <div className="time">
                <span>{item.time}</span>
                <small>{index + 1}</small>
              </div>
              <div className="timeline-card">
                <div className="timeline-title">
                  <h3>{item.title}</h3>
                  <div className="item-flags">
                    {item.required && <span className="required">必做</span>}
                    {item.optional && <span className="optional">可选</span>}
                  </div>
                </div>
                <p className="place"><MapPinned aria-hidden />{compactPlaceLabel(displayPlaceName(item.place, item.title), item.title)}</p>
                {item.transport && <p className="muted"><Car aria-hidden />{item.transport}</p>}
                {item.note && <p className="note">{item.note}</p>}
                {itemPlaces.length > 0 && <NodeTools places={itemPlaces} contextTitle={item.title} contextPlace={item.place} imageByPlaceId={placeImages} />}
                {itemBookings.map((booking) => (
                  <BookingInline booking={booking} key={booking.id} />
                ))}
                {itemLodgings.map((lodging) => (
                  <LodgingInline lodging={lodging} key={lodging.id} />
                ))}
              </div>
            </div>
          );
        })}
      </section>

      <section className="split-panels">
        <PanelTitle icon={<Info />} title="当天提醒">
          <ul className="clean-list">
            {day.reminders.map((reminder) => <li key={reminder}>{reminder}</li>)}
          </ul>
        </PanelTitle>
        <PanelTitle icon={<ExternalLink />} title="外链">
          <div className="link-grid">
            {day.links.map((link) => <LinkButton key={link.url} link={link} />)}
          </div>
        </PanelTitle>
      </section>
    </article>
  );
}

function getDayVisuals(day: TripDay, dayPlaces: PlaceInfo[], dayLodgings: LodgingSummary[]): DayVisual[] {
  const controlledCovers = dayCoverImages[day.date];
  const publicTripSources = controlledCovers ?? [
    day.heroImage,
    ...(day.galleryImages ?? []),
    ...dayPlaces.map((place) => place.localImage ?? getPlaceImage(place)),
    ...(fallbackDayImages[day.date] ?? []),
    './assets/trip/excel-image1.jpeg',
  ].filter(Boolean) as string[];
  const lodgingBackup = dayLodgings.flatMap((lodging) => lodging.images);
  const sources = publicTripSources.length > 0 ? publicTripSources : lodgingBackup;

  return Array.from(new Set(sources)).slice(0, 6).map((src, index) => ({
    src,
    alt: `${day.area} 行程图 ${index + 1}`,
  }));
}

function getPlaceImage(place: PlaceInfo) {
  return getPlaceImageCandidates(place)[0];
}

function getPlaceImageCandidates(place: PlaceInfo) {
  const haystack = `${place.id} ${place.place} ${place.title}`.toLowerCase();
  const matches = placeImageRules
    .filter(([keyword]) => haystack.includes(keyword.toLowerCase()))
    .map(([, image]) => image);
  return Array.from(new Set([place.localImage, ...matches].filter(Boolean) as string[]));
}

function buildPlaceImageAssignments(dayPlaces: PlaceInfo[], dayVisuals: DayVisual[]) {
  const used = new Set(dayVisuals.map((visual) => visual.src));
  return dayPlaces.reduce<Record<string, string>>((acc, place) => {
    const image = getPlaceImageCandidates(place).find((candidate) => !used.has(candidate));
    if (image) {
      acc[place.id] = image;
      used.add(image);
    }
    return acc;
  }, {});
}

const criticalDayWarnings: Record<string, { title: string; message: string }> = {
  '10/2': {
    title: '南岸长距离日',
    message: '17:30 后不再补景点，按住宿方向收口并避免疲劳驾驶。',
  },
  '10/3': {
    title: '冰川活动集合',
    message: 'Glacier Adventure 是上午 09:30 集合，建议至少提前 20 分钟到达 Hali Base Camp。',
  },
  '10/4': {
    title: '最长驾驶日',
    message: '安全返程优先；天气或路况不好就取消补漏景点，直奔机场附近住宿。',
  },
};

function Fact({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="fact">
      <span>{icon}</span>
      <small>{label}</small>
      <strong>{value}</strong>
    </div>
  );
}

function BookingInline({ booking }: { booking: BookingSummary }) {
  return (
    <details className="booking-inline">
      <summary>
        <span className="booking-kind">{booking.kind}</span>
        <span className="booking-summary-main">
          <strong>{booking.title}</strong>
          <small>{booking.vendor} · {booking.displayTime}</small>
        </span>
        <ChevronDown aria-hidden />
      </summary>
      <div className="booking-body">
        <dl className="booking-facts">
          <div><dt>时间</dt><dd>{booking.displayTime}</dd></div>
          <div><dt>地点</dt><dd>{displayPlaceName(booking.location, booking.title)}</dd></div>
          {booking.amount && <div><dt>金额</dt><dd>{maskMoney(booking.amount)}</dd></div>}
        </dl>
        <ul className="booking-list">
          {booking.facts.map((fact) => <li key={fact}>{maskMoney(fact)}</li>)}
        </ul>
        {booking.reminder && <p className="note">{maskMoney(booking.reminder)}</p>}
        {booking.links && (
          <div className="link-grid">
            {booking.links.map((link) => <LinkButton key={link.url} link={link} />)}
          </div>
        )}
      </div>
    </details>
  );
}

function LodgingInline({ lodging }: { lodging: LodgingSummary }) {
  return (
    <details className="booking-inline lodging-inline">
      <summary>
        <span className="booking-kind">住宿</span>
        <span className="booking-summary-main">
          <strong>{lodging.name}</strong>
          <small>{displayPlaceName(lodging.city)} · {lodging.checkInTime || '入住时间见详情'}</small>
        </span>
        <ChevronDown aria-hidden />
      </summary>
      <div className="booking-body lodging-body">
        {lodging.images.length > 0 && (
          <div className="lodging-gallery" aria-label={`${lodging.name} 图片`}>
            {lodging.images.map((image) => (
              <img src={image} alt={`${lodging.name} 外观参考`} loading="lazy" key={image} />
            ))}
          </div>
        )}
        <div className="lodging-info">
        <dl className="booking-facts lodging-facts">
          <div><dt>入住 / 退房</dt><dd>{lodging.checkIn} {lodging.checkInTime || ''} → {lodging.checkOut} {lodging.checkOutTime || ''}</dd></div>
          {lodging.address && <div><dt>地址</dt><dd>{lodging.address}</dd></div>}
          {lodging.phone && <div><dt>电话</dt><dd>{lodging.phone}</dd></div>}
          {lodging.room && <div><dt>房型</dt><dd>{lodging.room}</dd></div>}
          {lodging.bed && <div><dt>床型</dt><dd>{lodging.bed}</dd></div>}
          {lodging.area && <div><dt>面积</dt><dd>{lodging.area}</dd></div>}
          {lodging.amount && <div><dt>金额</dt><dd>{maskMoney(lodging.amount)}</dd></div>}
          {lodging.platform && <div><dt>平台</dt><dd>{lodging.platform}</dd></div>}
        </dl>
        {lodging.facilities.length > 0 && (
          <ul className="booking-list lodging-facilities">
            {lodging.facilities.map((facility, index) => <li key={`${facility}-${index}`}>{facility}</li>)}
          </ul>
        )}
        {lodging.cancelPolicy && <p className="note">取消政策：{lodging.cancelPolicy}</p>}
        {lodging.note && <p className="note">{lodging.note}</p>}
        </div>
      </div>
    </details>
  );
}

function NodeTools({
  places: placeInfos,
  contextTitle,
  contextPlace,
  imageByPlaceId,
}: {
  places: PlaceInfo[];
  contextTitle?: string;
  contextPlace?: string;
  imageByPlaceId?: Record<string, string>;
}) {
  return (
    <div className="node-tools">
      {placeInfos.map((place) => {
        const title = displayPlaceName(place.place, place.title);
        const hideRepeatedTitle = isRepeatedPlaceTitle(title, place.title, contextTitle, contextPlace);
        const description = compactPlaceDescription(place.description, contextTitle, contextPlace);
        const image = imageByPlaceId ? imageByPlaceId[place.id] : getPlaceImage(place);

        return (
          <div className={`node-tool ${hideRepeatedTitle ? 'is-compact' : ''}`} key={place.id}>
          {image && (
            <div className="node-image" aria-label={`${place.title} 图片`}>
              <img src={image} alt={`${title} 参考图`} loading="lazy" />
            </div>
          )}
          <div className="node-tool-main">
            {!hideRepeatedTitle && (
              <div className="node-tool-title">
                <strong>{title}</strong>
                {normalizeForCompare(place.title) !== normalizeForCompare(title) && <small>{place.title}</small>}
              </div>
            )}
            {description && <p className="node-description">{description}</p>}
            <div className="node-link-row">
              {place.mapUrl && <TinyLink href={place.mapUrl} label="地图" icon={<MapPinned aria-hidden />} />}
              {place.parkingUrl && <TinyLink href={place.parkingUrl} label="停车" icon={<ParkingCircle aria-hidden />} />}
              {place.introUrl && <TinyLink href={place.introUrl} label="介绍" icon={<Info aria-hidden />} />}
            </div>
            {place.parkingNote && <p className="parking-note">{place.parkingNote}</p>}
          </div>
          </div>
        );
      })}
    </div>
  );
}

function isRepeatedPlaceTitle(title: string, rawTitle: string, contextTitle?: string, contextPlace?: string) {
  const candidates = [title, rawTitle].map(normalizeForCompare).filter((value) => value.length >= 4);
  const contexts = [contextTitle, contextPlace].map(normalizeForCompare).filter((value) => value.length >= 4);
  return candidates.some((candidate) => contexts.some((context) => context.includes(candidate) || candidate.includes(context)));
}

function compactPlaceDescription(description?: string, contextTitle?: string, contextPlace?: string) {
  if (!description) return '';
  const normalizedDescription = normalizeForCompare(description);
  const repeatedContext = [contextTitle, contextPlace]
    .map(normalizeForCompare)
    .some((context) => context.length >= 6 && (normalizedDescription.includes(context) || context.includes(normalizedDescription)));
  return repeatedContext ? '' : description;
}

function normalizeForCompare(value?: string) {
  return (value ?? '')
    .toLowerCase()
    .replace(/[\s,.;:：，。；、·/\\|()（）[\]【】"'’‘“”\-+→]+/g, '');
}

function displayPlaceName(raw: string, title?: string): string {
  if (!raw) return title ?? '';
  const segments = raw.split('→').map((segment) => displayPlaceSegment(segment.trim(), title));
  return segments.join(' → ');
}

function compactPlaceLabel(label: string, title?: string) {
  if (!title) return label;
  const prefixes = [`${title} · `, `${title} 路 `, `${title}: `, `${title}：`];
  return prefixes.reduce((current, prefix) => (current.startsWith(prefix) ? current.slice(prefix.length) : current), label);
}

function displayPlaceSegment(raw: string, title?: string): string {
  const hit = placeNameRules.find(([key]) => raw.includes(key));
  if (hit) return raw.replace(hit[0], hit[1]);
  if (hasChinese(raw)) return raw;
  if (title && hasChinese(title)) return `${title.replace(/^驾驶：|^游览：/, '')} · ${raw}`;
  return raw;
}

function hasChinese(value: string) {
  return /[\u4e00-\u9fff]/.test(value);
}

function TinyLink({ href, label, icon }: { href: string; label: string; icon: ReactNode }) {
  return (
    <a className="tiny-link" href={href} target="_blank" rel="noreferrer">
      {icon}
      {label}
    </a>
  );
}

function PersistentChecklist({ items, storageKey, grouped = false }: { items: ChecklistItem[]; storageKey: string; grouped?: boolean }) {
  const [checked, setChecked] = useState<Record<string, boolean>>(() => readStoredChecks(storageKey));

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(checked));
  }, [checked, storageKey]);

  const toggle = (key: string) => {
    setChecked((current) => ({ ...current, [key]: !current[key] }));
  };

  if (!grouped) {
    return (
      <div className="check-grid">
        {items.map((item) => (
          <CheckRow key={checkKey(item)} item={item} checked={Boolean(checked[checkKey(item)])} onToggle={() => toggle(checkKey(item))} />
        ))}
      </div>
    );
  }

  const groups = items.reduce<Record<string, ChecklistItem[]>>((acc, item) => {
    acc[item.group] = [...(acc[item.group] ?? []), item];
    return acc;
  }, {});

  return (
    <div className="check-groups">
      {Object.entries(groups).map(([group, groupItems]) => (
        <section className="check-group" key={group}>
          <h4>{group}</h4>
          <div className="check-grid">
            {groupItems.map((item) => (
              <CheckRow key={checkKey(item)} item={item} checked={Boolean(checked[checkKey(item)])} onToggle={() => toggle(checkKey(item))} hideGroup />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function CheckRow({ item, checked, onToggle, hideGroup = false }: { item: ChecklistItem; checked: boolean; onToggle: () => void; hideGroup?: boolean }) {
  return (
    <label className={`check-item ${checked ? 'checked' : ''}`}>
      <input type="checkbox" checked={checked} onChange={onToggle} />
      <span>
        <strong>{item.label}</strong>
        <small>{hideGroup ? item.detail : [item.group, item.detail].filter(Boolean).join(' · ')}</small>
      </span>
    </label>
  );
}

function readStoredChecks(storageKey: string) {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(window.localStorage.getItem(storageKey) ?? '{}') as Record<string, boolean>;
  } catch {
    return {};
  }
}

function checkKey(item: ChecklistItem) {
  return `${item.group}::${item.label}`;
}

function DrivingPanel() {
  return (
    <main className="content-grid section-shell">
      <section className="panel wide focus-panel">
        <h2><Car aria-hidden /> 自驾与路况</h2>
        <p className="section-copy">
          冰岛段以天气和路况为最高优先级。长距离日先保证住宿和航班衔接，所有补漏景点都让位给安全返程。
        </p>
        <div className="driving-grid">
          {drivingNotes.map((note) => (
            <div className="driving-note" key={note.label}>
              <strong>{note.label}</strong>
              <p>{note.value}</p>
            </div>
          ))}
        </div>
      </section>
      <PanelTitle icon={<ShieldAlert />} title="天气 / 路况决策规则">
        <div className="decision-table" role="table" aria-label="天气路况决策规则">
          <div className="decision-row heading" role="row">
            <span role="columnheader">情况</span>
            <span role="columnheader">处理</span>
          </div>
          {weatherDecisionRules.map((rule) => (
            <div className="decision-row" role="row" key={rule.condition}>
              <span role="cell">{rule.condition}</span>
              <strong role="cell">{rule.action}</strong>
            </div>
          ))}
        </div>
      </PanelTitle>
      <PanelTitle icon={<Fuel />} title="加油 / 超市地图">
        <div className="map-stop-grid">
          {fuelMarketStops.map((stop) => (
            <div className="map-stop-card" key={`${stop.date}-${stop.label}`}>
              <strong>{stop.date} · {stop.label}</strong>
              <p>{stop.detail}</p>
              <div className="node-link-row">
                <TinyLink href={stop.fuelUrl} label="加油地图" icon={<Fuel aria-hidden />} />
                <TinyLink href={stop.marketUrl} label="超市地图" icon={<MapPinned aria-hidden />} />
              </div>
            </div>
          ))}
        </div>
      </PanelTitle>
      <PanelTitle icon={<CloudSun />} title="出发前复查">
        <div className="link-grid">
          {weatherReviewLinks.map((link) => <LinkButton key={link.url} link={link} />)}
        </div>
      </PanelTitle>
    </main>
  );
}

function ChecklistPanel() {
  return (
    <main className="content-grid section-shell">
      <section className="panel wide">
        <h2><Luggage aria-hidden /> 出发前清单</h2>
        <PersistentChecklist items={packingList} storageKey="norway-iceland-packing-v2" grouped />
      </section>
      <PanelTitle icon={<CheckCircle2 />} title="行前软件">
        <ul className="clean-list">
          <li>Google Maps + Maps.me 离线地图。</li>
          <li>Parka / EasyPark 停车。</li>
          <li>umferdin.is、Safetravel、Vedur 收藏到浏览器首页。</li>
        </ul>
      </PanelTitle>
      <PanelTitle icon={<Clock3 />} title="手机勾选">
        <ul className="clean-list">
          <li>清单状态会保存在本机浏览器里，刷新页面后仍然保留。</li>
          <li>换手机或清理浏览器数据后需要重新勾选。</li>
        </ul>
      </PanelTitle>
    </main>
  );
}

function CostsPanel() {
  const costs = [
    ['旅行总预算', totalCost],
    ['租车', '5,815 RMB'],
    ['油费 + 税费', '2,000 RMB'],
    ['停车费', '800 RMB'],
    ['旅游保险', '500 RMB'],
    ['上厕所', '100 RMB'],
    ['租相机', '315 RMB'],
    ['签证', '2,600 RMB'],
    ['电话卡', '300 RMB'],
    ['驾驶证翻译', '18 RMB'],
  ];

  return (
    <main className="content-grid section-shell">
      <section className="panel focus-panel">
        <h2><CircleDollarSign aria-hidden /> 费用</h2>
        <div className="cost-list">
          {costs.map(([label, value]) => (
            <div key={label}>
              <span>{label}</span>
              <strong>{maskMoney(value)}</strong>
            </div>
          ))}
        </div>
      </section>
      <section className="panel wide">
        <h2><CheckCircle2 aria-hidden /> 待办</h2>
        <PersistentChecklist items={todos} storageKey="norway-iceland-todos-v1" />
      </section>
    </main>
  );
}

function EmergencyPanel() {
  return (
    <main className="content-grid section-shell">
      <section className="panel wide focus-panel">
        <h2><Phone aria-hidden /> 紧急联系</h2>
        <div className="emergency-list">
          {emergencyContacts.map((contact) => (
            <div className="emergency-card" key={contact.name}>
              <span>{contact.country}</span>
              <strong>{contact.name}</strong>
              <div className="emergency-lines">
                {splitContactDetail(contact.detail).map((line) => <p key={line}>{line}</p>)}
              </div>
            </div>
          ))}
        </div>
      </section>
      <PanelTitle icon={<ExternalLink />} title="官方入口">
        <div className="link-grid">
          {[officialLinks.chinaNorway, officialLinks.chinaIceland].map((link) => <LinkButton key={link.url} link={link} />)}
        </div>
      </PanelTitle>
      <PanelTitle icon={<ShieldAlert />} title="现场原则">
        <ul className="clean-list">
          <li>先保证人身安全，再处理票务或行程损失。</li>
          <li>冰岛恶劣天气下，不为补景点冒险开车。</li>
          <li>重要文件拍照并离线保存。</li>
        </ul>
      </PanelTitle>
    </main>
  );
}

function splitContactDetail(detail: string) {
  return detail.split(/[;；]/).map((part) => part.trim()).filter(Boolean);
}

function PanelTitle({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <section className="panel panel-title">
      <h3>{icon}{title}</h3>
      {children}
    </section>
  );
}

function LinkButton({ link, compact = false }: { link: SourceLink; compact?: boolean }) {
  return (
    <a href={link.url} target="_blank" rel="noreferrer" className={`link-button ${compact ? 'compact' : ''}`}>
      <span>{link.kind}</span>
      {link.label}
      <ExternalLink aria-hidden />
    </a>
  );
}
