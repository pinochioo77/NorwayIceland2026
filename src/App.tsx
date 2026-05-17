import { useState, type ReactNode } from 'react';
import {
  AlertTriangle,
  CalendarDays,
  Car,
  ChevronDown,
  CheckCircle2,
  CircleDollarSign,
  CloudSun,
  ExternalLink,
  Fuel,
  Hotel,
  ImageIcon,
  Info,
  Luggage,
  MapPinned,
  Navigation,
  ParkingCircle,
  Phone,
  ShieldAlert,
  Sparkles,
  TicketCheck,
  Utensils,
} from 'lucide-react';
import { drivingNotes, emergencyContacts, packingList, todos } from './data/checklists';
import { bookings } from './data/generated/bookings';
import { places } from './data/generated/places';
import { officialLinks, preTripReviewLinks } from './data/links';
import { totalCost, tripDays } from './data/trip';
import type { BookingSummary, MetricProps, PlaceInfo, SourceLink, TripDay, TimelineItem } from './types';

const tabs = ['每日行程', '自驾与路况', '出发前清单', '费用与待办', '紧急联系'] as const;
type Tab = (typeof tabs)[number];

export function App() {
  const [activeDay, setActiveDay] = useState(tripDays[0].date);
  const [activeTab, setActiveTab] = useState<Tab>('每日行程');
  const currentDay = tripDays.find((day) => day.date === activeDay) ?? tripDays[0];

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Norway / Iceland / Helsinki</p>
          <h1>挪威冰岛同行行程</h1>
          <p className="intro">
            9/25-10/6，从上海到奥斯陆、挪威峡湾、卑尔根、冰岛南岸，再经赫尔辛基返程。
            这是给同行伙伴看的公开版，票据只保留脱敏摘要。
          </p>
        </div>
        <div className="status-grid" aria-label="旅行总览">
          <Metric icon={<CalendarDays />} label="日期" value="9/25 - 10/6" />
          <Metric icon={<Navigation />} label="主线" value="Oslo → Bergen → Iceland" />
          <Metric icon={<CircleDollarSign />} label="预算" value={totalCost} />
          <Metric icon={<ShieldAlert />} label="重点风险" value="10/2-10/4 冰岛长线" />
        </div>
      </header>

      <section className="review-strip" aria-label="出发前复查">
        <div>
          <p className="eyebrow">Pre-trip review</p>
          <h2>出发前复查入口</h2>
        </div>
        <div className="review-links">
          {preTripReviewLinks.map((link) => (
            <LinkButton key={link.url} link={link} compact />
          ))}
        </div>
      </section>

      <nav className="tabbar" aria-label="页面栏目">
        {tabs.map((tab) => (
          <button key={tab} className={tab === activeTab ? 'active' : ''} onClick={() => setActiveTab(tab)}>
            {tab}
          </button>
        ))}
      </nav>

      {activeTab === '每日行程' && (
        <main className="trip-layout">
          <aside className="day-nav" aria-label="日期导航">
            {tripDays.map((day) => (
              <button key={day.date} className={day.date === activeDay ? 'selected' : ''} onClick={() => setActiveDay(day.date)}>
                <span>{day.date}</span>
                <small>{day.area}</small>
              </button>
            ))}
          </aside>
          <DayDetail day={currentDay} />
        </main>
      )}

      {activeTab === '自驾与路况' && <DrivingPanel />}
      {activeTab === '出发前清单' && <ChecklistPanel />}
      {activeTab === '费用与待办' && <CostsPanel />}
      {activeTab === '紧急联系' && <EmergencyPanel />}
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

function DayDetail({ day }: { day: TripDay }) {
  const dayWarning = criticalDayWarnings[day.date];
  const dayBookings = bookings.filter((booking) => booking.date === day.date);
  const dayPlaces = places.filter((place) => place.date === day.date);

  return (
    <article className="day-detail">
      <section className={`day-hero ${day.heroImage ? '' : 'no-image'}`}>
        <div className="hero-copy">
          <p className="eyebrow">{day.route}</p>
          <h2>{day.date} · {day.area}</h2>
          <p>{day.summary}</p>
          <div className="tag-row">
            {day.riskTags.map((tag) => (
              <span key={tag} className="risk-tag">{tag}</span>
            ))}
          </div>
        </div>
        {day.heroImage && <img src={day.heroImage} alt={`${day.area} 行程图片`} />}
      </section>

      {day.galleryImages && day.galleryImages.length > 1 && (
        <section className="photo-strip" aria-label="Excel 行程图片">
          {day.galleryImages.map((image, index) => (
            <img src={image} alt={`${day.area} 参考图 ${index + 1}`} key={image} />
          ))}
        </section>
      )}

      <section className="quick-facts" aria-label="当天摘要">
        <Fact icon={<Hotel />} label="住宿" value={day.stay} />
        <Fact icon={<Utensils />} label="吃饭" value={day.meal} />
        <Fact icon={<CircleDollarSign />} label="费用" value={day.cost ?? '未单列'} />
        <Fact icon={<Car />} label="驾驶" value={day.drive ?? '非自驾主日'} />
        <Fact icon={<Fuel />} label="加油" value={day.fuel ?? '按当天状态'} />
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
          const itemPlaces = dayPlaces.filter((place) => place.attachTime === item.time);
          const hasStayBooking = itemBookings.some((booking) => booking.kind === '住宿');
          const showStaySlot = isStayNode(item) && !hasStayBooking;

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
                    {itemBookings.length > 0 && <span className="booked"><TicketCheck aria-hidden />已预订</span>}
                    {item.required && <span className="required">必做</span>}
                    {item.optional && <span className="optional">可选</span>}
                  </div>
                </div>
                <p className="place"><MapPinned aria-hidden />{item.place}</p>
                {item.transport && <p className="muted"><Car aria-hidden />{item.transport}</p>}
                {item.note && <p className="note">{item.note}</p>}
                {itemPlaces.length > 0 && <NodeTools places={itemPlaces} />}
                {itemBookings.map((booking) => (
                  <BookingInline booking={booking} key={booking.id} />
                ))}
                {showStaySlot && <StayBookingSlot stay={day.stay} />}
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

function isStayNode(item: TimelineItem) {
  return /入住|住宿|酒店|Guesthouse|Scandic|B47|Citybox|Lighthouse/i.test(`${item.title} ${item.place}`);
}

const criticalDayWarnings: Record<string, { title: string; message: string }> = {
  '10/2': {
    title: '南岸长距离日',
    message: '17:30 不是当天结束，Vík 补给后还要继续开到 Hali / Skyrhúsið，才能赶上 10/3 上午 09:30 冰川活动集合。',
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
        <span className="booking-status">{booking.status}</span>
        <ChevronDown aria-hidden />
      </summary>
      <div className="booking-body">
        <dl className="booking-facts">
          <div><dt>时间</dt><dd>{booking.displayTime}</dd></div>
          <div><dt>地点</dt><dd>{booking.location}</dd></div>
          {booking.amount && <div><dt>金额</dt><dd>{booking.amount}</dd></div>}
        </dl>
        <ul className="booking-list">
          {booking.facts.map((fact) => <li key={fact}>{fact}</li>)}
        </ul>
        {booking.reminder && <p className="note">{booking.reminder}</p>}
        {booking.links && (
          <div className="link-grid">
            {booking.links.map((link) => <LinkButton key={link.url} link={link} />)}
          </div>
        )}
      </div>
    </details>
  );
}

function StayBookingSlot({ stay }: { stay: string }) {
  return (
    <details className="booking-inline stay-slot">
      <summary>
        <span className="booking-kind">住宿</span>
        <span className="booking-summary-main">
          <strong>住宿预订窗口</strong>
          <small>{stay}</small>
        </span>
        <span className="booking-status muted-status">待整理</span>
        <ChevronDown aria-hidden />
      </summary>
      <div className="booking-body">
        <p className="note">后续住宿票据整理后，先写入 Excel 的公开摘要，再自动同步到这里。</p>
      </div>
    </details>
  );
}

function NodeTools({ places: placeInfos }: { places: PlaceInfo[] }) {
  return (
    <div className="node-tools">
      {placeInfos.map((place) => (
        <div className="node-tool" key={place.id}>
          {place.localImage && (
            <a className="node-image" href={place.localImage} target="_blank" rel="noreferrer" aria-label={`${place.title} 图片`}>
              <img src={place.localImage} alt={`${place.place} 参考图`} loading="lazy" />
            </a>
          )}
          <div className="node-tool-main">
            <div className="node-tool-title">
              <strong>{place.place}</strong>
              <small>{place.title}</small>
            </div>
            <div className="node-link-row">
              {place.introUrl && <TinyLink href={place.introUrl} label="介绍" icon={<Info aria-hidden />} />}
              {place.localImage && <TinyLink href={place.localImage} label="图片" icon={<ImageIcon aria-hidden />} />}
              {place.mapUrl && <TinyLink href={place.mapUrl} label="地图" icon={<MapPinned aria-hidden />} />}
              {place.parkingUrl && <TinyLink href={place.parkingUrl} label="停车" icon={<ParkingCircle aria-hidden />} />}
              {place.imageSourceUrl && <TinyLink href={place.imageSourceUrl} label="图源" icon={<ExternalLink aria-hidden />} />}
            </div>
            {place.parkingNote && <p className="parking-note">{place.parkingNote}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

function TinyLink({ href, label, icon }: { href: string; label: string; icon: ReactNode }) {
  return (
    <a className="tiny-link" href={href} target="_blank" rel="noreferrer">
      {icon}
      {label}
    </a>
  );
}

function DrivingPanel() {
  return (
    <main className="content-grid">
      <section className="panel wide">
        <h2><Car aria-hidden /> 自驾与路况</h2>
        <p className="section-copy">
          冰岛段以天气和路况为最高优先级。10/2 必须到 Hali，10/4 是最长驾驶日，所有补漏景点都让位给安全返程。
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
      <PanelTitle icon={<CloudSun />} title="出发前复查">
        <div className="link-grid">
          {[officialLinks.road, officialLinks.safetravel, officialLinks.vedur].map((link) => <LinkButton key={link.url} link={link} />)}
        </div>
      </PanelTitle>
      <PanelTitle icon={<Fuel />} title="关键加油点">
        <ul className="clean-list">
          <li>9/29：落地补给即可。</li>
          <li>10/1：Selfoss，离开首都圈前加油。</li>
          <li>10/2：Hella 满油出发，Vík 补给。</li>
          <li>10/4：Vík / Hvolsvöllur 是返程关键补给点。</li>
        </ul>
      </PanelTitle>
    </main>
  );
}

function ChecklistPanel() {
  return (
    <main className="content-grid">
      <section className="panel wide">
        <h2><Luggage aria-hidden /> 出发前清单</h2>
        <div className="check-grid">
          {packingList.map((item) => (
            <label className="check-item" key={`${item.group}-${item.label}`}>
              <input type="checkbox" />
              <span>
                <strong>{item.label}</strong>
                <small>{item.group}{item.detail ? ` · ${item.detail}` : ''}</small>
              </span>
            </label>
          ))}
        </div>
      </section>
      <PanelTitle icon={<CheckCircle2 />} title="行前软件">
        <ul className="clean-list">
          <li>Google Maps + Maps.me 离线地图。</li>
          <li>Parka / EasyPark 停车。</li>
          <li>umferdin.is、Safetravel、Vedur 收藏到浏览器首页。</li>
        </ul>
      </PanelTitle>
      <PanelTitle icon={<Sparkles />} title="特殊装备">
        <ul className="clean-list">
          <li>冰川活动：手套、防水外层、水、能量棒。</li>
          <li>Sky Lagoon：泳衣、毛巾、拖鞋。</li>
          <li>自驾：驾照翻译、信用卡、离线地图。</li>
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
    <main className="content-grid">
      <section className="panel">
        <h2><CircleDollarSign aria-hidden /> 费用</h2>
        <div className="cost-list">
          {costs.map(([label, value]) => (
            <div key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </section>
      <section className="panel wide">
        <h2><CheckCircle2 aria-hidden /> 待办</h2>
        <div className="check-grid">
          {todos.map((item) => (
            <label className="check-item" key={item.label}>
              <input type="checkbox" />
              <span>
                <strong>{item.label}</strong>
                <small>{item.group}</small>
              </span>
            </label>
          ))}
        </div>
      </section>
    </main>
  );
}

function EmergencyPanel() {
  return (
    <main className="content-grid">
      <section className="panel wide">
        <h2><Phone aria-hidden /> 紧急联系</h2>
        <div className="emergency-list">
          {emergencyContacts.map((contact) => (
            <div className="emergency-card" key={contact.name}>
              <span>{contact.country}</span>
              <strong>{contact.name}</strong>
              <p>{contact.detail}</p>
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

function PanelTitle({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <section className="panel">
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
