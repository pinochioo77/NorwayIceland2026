import { useMemo, useState, type ReactNode } from 'react';
import {
  AlertTriangle,
  CalendarDays,
  Car,
  CheckCircle2,
  CircleDollarSign,
  CloudSun,
  ExternalLink,
  FileCheck2,
  Fuel,
  Hotel,
  Info,
  Luggage,
  MapPinned,
  Navigation,
  Phone,
  ShieldAlert,
  Sparkles,
  TicketCheck,
  Utensils,
} from 'lucide-react';
import { drivingNotes, emergencyContacts, packingList, todos } from './data/checklists';
import { officialLinks, preTripReviewLinks } from './data/links';
import { ticketSummaries } from './data/tickets';
import { totalCost, tripDays } from './data/trip';
import type { MetricProps, SourceLink, TicketSummary, TripDay } from './types';

const tabs = ['每日行程', '票据与预订', '自驾与路况', '出发前清单', '费用与待办', '紧急联系'] as const;
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
            9/25-10/5，从上海到奥斯陆、挪威峡湾、卑尔根、冰岛南岸，再经赫尔辛基返程。
            这是给同行伙伴看的公开版，票据只保留脱敏摘要。
          </p>
        </div>
        <div className="status-grid" aria-label="旅行总览">
          <Metric icon={<CalendarDays />} label="日期" value="9/25 - 10/5" />
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

      {activeTab === '票据与预订' && <TicketsPanel />}
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
  const tickets = useMemo(() => ticketSummaries.filter((ticket) => ticket.date === day.date), [day.date]);
  const dayWarning = criticalDayWarnings[day.date];

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

      {tickets.length > 0 && (
        <section className="linked-tickets" aria-label="当天票据">
          <h3><TicketCheck aria-hidden /> 当天已预订</h3>
          <div className="ticket-row">
            {tickets.map((ticket) => (
              <MiniTicket ticket={ticket} key={ticket.id} />
            ))}
          </div>
        </section>
      )}

      <section className="timeline" aria-label="当天时间轴">
        {day.timeline.map((item, index) => (
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
              <p className="place"><MapPinned aria-hidden />{item.place}</p>
              {item.transport && <p className="muted"><Car aria-hidden />{item.transport}</p>}
              {item.note && <p className="note">{item.note}</p>}
            </div>
          </div>
        ))}
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

function TicketsPanel() {
  return (
    <main className="content-grid">
      <section className="panel wide">
        <h2><TicketCheck aria-hidden /> 票据与预订</h2>
        <p className="section-copy">
          这里是公开版票据摘要：只显示对旅行有用的时间、地点、供应商、金额和提醒；原始票据、二维码、订单号、票号、姓名、邮箱和电话不公开。
        </p>
        <div className="ticket-grid">
          {ticketSummaries.map((ticket) => (
            <TicketCard ticket={ticket} key={ticket.id} />
          ))}
        </div>
      </section>
      <PanelTitle icon={<FileCheck2 />} title="脱敏规则">
        <ul className="clean-list">
          <li>不发布原始 PDF / PNG，也不发布打码后的票据截图。</li>
          <li>金额、供应商、日期、时间、地点可公开；订单号和确认号不公开。</li>
          <li>后续新增票据先放入本地安全目录，再整理成摘要卡片。</li>
        </ul>
      </PanelTitle>
      <PanelTitle icon={<Sparkles />} title="待复核">
        <ul className="clean-list">
          <li>出发前重新核对活动开放时间、集合点和取消政策。</li>
          <li>机票值机后，把登机牌单独离线保存，不放到公开网页。</li>
        </ul>
      </PanelTitle>
    </main>
  );
}

function TicketCard({ ticket }: { ticket: TicketSummary }) {
  return (
    <article className="ticket-card">
      <div className="ticket-head">
        <span>{ticket.kind}</span>
        <strong>{ticket.status}</strong>
      </div>
      <h3>{ticket.title}</h3>
      <p className="ticket-vendor">{ticket.vendor}</p>
      <dl className="ticket-facts">
        <div><dt>日期</dt><dd>{ticket.dateRange ?? ticket.date}</dd></div>
        <div><dt>时间</dt><dd>{ticket.primaryTime}</dd></div>
        <div><dt>地点</dt><dd>{ticket.location}</dd></div>
        {ticket.amount && <div><dt>金额</dt><dd>{ticket.amount}</dd></div>}
      </dl>
      <ul className="clean-list compact-list">
        {ticket.facts.map((fact) => <li key={fact}>{fact}</li>)}
      </ul>
      {ticket.reminders.map((reminder) => <p className="note" key={reminder}>{reminder}</p>)}
      {ticket.links && (
        <div className="link-grid">
          {ticket.links.map((link) => <LinkButton key={link.url} link={link} />)}
        </div>
      )}
    </article>
  );
}

function MiniTicket({ ticket }: { ticket: TicketSummary }) {
  return (
    <div className="mini-ticket">
      <span>{ticket.kind}</span>
      <strong>{ticket.title}</strong>
      <small>{ticket.primaryTime} · {ticket.location}</small>
    </div>
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
