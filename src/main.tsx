import { StrictMode } from 'react';
import { useState, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  AlertTriangle,
  CalendarDays,
  Car,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  CloudSun,
  ExternalLink,
  Fuel,
  Hotel,
  Info,
  Luggage,
  MapPinned,
  Navigation,
  Phone,
  ShieldAlert,
  Sparkles,
  Utensils,
} from 'lucide-react';
import './styles.css';

type TimelineItem = {
  time: string;
  place: string;
  title: string;
  transport?: string;
  note?: string;
  required?: boolean;
  optional?: boolean;
};

type SourceLink = {
  label: string;
  url: string;
  kind: '官方' | '地图' | '天气' | '安全' | '交通' | '使馆';
};

type TripDay = {
  date: string;
  weekdayHint?: string;
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

type ChecklistItem = {
  label: string;
  group: string;
  detail?: string;
};

const officialLinks: SourceLink[] = [
  { label: 'Sky Lagoon 官方站', url: 'https://www.skylagoon.com/', kind: '官方' },
  { label: 'Visit Reykjavík - Sky Lagoon', url: 'https://visitreykjavik.is/service/sky-lagoon', kind: '官方' },
  { label: 'Glacier Adventure', url: 'https://glacieradventure.is/', kind: '官方' },
  { label: 'Glacier Adventure Summer Tour', url: 'https://glacieradventure.is/tour/glacier-adventure-summer-tour/', kind: '官方' },
  { label: '冰岛实时路况 umferdin.is', url: 'https://umferdin.is/en', kind: '天气' },
  { label: 'Safetravel Iceland', url: 'https://safetravel.is/', kind: '安全' },
  { label: 'Vedur 天气预报', url: 'https://en.vedur.is/weather/forecasts/areas/', kind: '天气' },
  { label: 'Nærøyfjord Cruise', url: 'https://www.norwaysbest.com/en/flam/things-to-do/fjord-cruise-naeroyfjord', kind: '交通' },
  { label: 'Flytoget 机场快线', url: 'https://flytoget.no/en/', kind: '交通' },
  { label: 'HSL 赫尔辛基机场火车', url: 'https://www.hsl.fi/en/travelling/visitors/airport-train', kind: '交通' },
  { label: '中国驻挪威大使馆', url: 'http://no.china-embassy.gov.cn/', kind: '使馆' },
  { label: '中国驻冰岛大使馆', url: 'http://is.china-embassy.gov.cn/', kind: '使馆' },
];

const tripDays: TripDay[] = [
  {
    date: '9/25',
    area: '上海出发',
    stay: '夜宿飞机',
    summary: '国际航班出发，行李和文件最后检查。',
    meal: '飞机餐',
    cost: '27782 RMB',
    route: 'Shanghai → Oslo',
    riskTags: ['长途飞行', '文件检查'],
    timeline: [
      { time: '晚上', place: '上海 / Shanghai', title: '上海出发', transport: '国际航班', note: '护照、签证、保险、酒店和租车材料放在随身包。', required: true },
    ],
    reminders: ['确认托运行李和随身液体限制。', '手机离线地图、保险单、酒店订单离线保存。'],
    links: [{ label: '上海到奥斯陆路线', url: 'https://www.google.com/maps/search/Shanghai+to+Oslo', kind: '地图' }],
  },
  {
    date: '9/26',
    area: '奥斯陆 Oslo',
    stay: 'Oslo / Scandic Grensen',
    summary: '抵达后轻量 citywalk，重点是缓冲时差，不把第一天塞满。',
    meal: 'tgtg 盲盒',
    cost: '1640 RMB',
    route: 'Oslo Airport → Oslo city center',
    heroImage: './assets/trip/excel-image1.jpeg',
    galleryImages: [
      './assets/trip/excel-image1.jpeg',
      './assets/trip/excel-image2.jpeg',
      './assets/trip/excel-image3.jpeg',
      './assets/trip/excel-image4.jpeg',
    ],
    riskTags: ['入境取行李', '早睡'],
    timeline: [
      { time: '07:50-09:20', place: 'Oslo Airport / Oslo Lufthavn', title: '抵达、入境、取行李、寄存大件行李', transport: '机场', note: '按原表的行李寄存处理。', required: true },
      { time: '09:20-10:10', place: '机场 → 奥斯陆市区', title: '机场快线/地铁进城', transport: 'Flytoget / 地铁', note: 'Flytoget 标称约 19 分钟，实际按 40-50 分钟预留。' },
      { time: '10:10-10:50', place: 'Scandic Grensen 附近', title: '放小包、休整、咖啡', note: '不强行安排景点。' },
      { time: '11:00-12:00', place: 'Oslo Opera House', title: '歌剧院外观、屋顶步道、海边拍照', required: true },
      { time: '12:00-13:20', place: 'Karl Johans gate', title: '主街步行 + 午餐' },
      { time: '13:20-14:20', place: 'The Royal Palace', title: '王宫外观、广场、花园' },
      { time: '14:40-16:30', place: 'Aker Brygge', title: '码头散步、海边休息' },
      { time: '16:30 以后', place: 'Scandic Grensen', title: '入住、晚餐、休息', note: '第二天 06:23 出发，今晚不要太晚睡。', required: true },
    ],
    reminders: ['第一天不赶景点，优先恢复体力。', '次日早班车，睡前整理好行李。'],
    links: [
      { label: '当天地图', url: 'https://www.google.com/maps/dir/Oslo+Airport/Scandic+Grensen/Oslo+Opera+House/Karl+Johans+gate/The+Royal+Palace/Aker+Brygge', kind: '地图' },
      officialLinks[8],
    ],
  },
  {
    date: '9/27',
    area: '挪威缩影 / Voss',
    stay: 'Voss / Scandic Voss',
    summary: 'Oslo 到 Flåm，再坐峡湾邮轮到 Gudvangen，最后巴士到 Voss。',
    meal: '剩饭',
    cost: '4030 RMB',
    route: 'Oslo → Myrdal → Flåm → Gudvangen → Voss',
    riskTags: ['早班车', '多段换乘'],
    timeline: [
      { time: '05:20-06:05', place: 'Scandic Grensen → Oslo S', title: '退房、前往火车站', note: '不要压点。', required: true },
      { time: '06:23-14:01', place: 'Oslo → Myrdal → Flåm', title: '火车 + Flåm Railway / Flåmsbana', transport: '火车', required: true },
      { time: '14:01-15:00', place: 'Flåm', title: '午餐、咖啡、码头拍照', note: '只有约 1 小时，不安排额外活动。' },
      { time: '15:00-17:00', place: 'Flåm → Gudvangen', title: 'Nærøyfjord 峡湾邮轮', transport: '船', required: true },
      { time: '17:00-17:15', place: 'Gudvangen', title: '下船换乘巴士' },
      { time: '17:15-18:20', place: 'Gudvangen → Voss', title: '巴士到 Voss', transport: '巴士', required: true },
      { time: '18:20-19:00', place: 'Scandic Voss', title: '到站、入住、吃饭休息' },
    ],
    reminders: ['所有票据提前离线保存。', 'Flåm 停留短，别追加活动。'],
    links: [
      { label: '当天地图', url: 'https://www.google.com/maps/dir/Oslo+S/Myrdal/Fl%C3%A5m/Gudvangen/Voss', kind: '地图' },
      officialLinks[7],
    ],
  },
  {
    date: '9/28',
    area: 'Voss / 卑尔根',
    stay: 'Bergen / Citybox Danmarksplass',
    summary: '上午 Voss 湖区和可选缆车，下午到卑尔根看布吕根、港口和弗洛伊恩山。',
    meal: 'tgtg 盲盒',
    cost: '1050 RMB',
    route: 'Voss → Bergen',
    riskTags: ['天气决策', '火车衔接'],
    timeline: [
      { time: '08:30-09:40', place: 'Voss / Vangsvatnet', title: 'Voss 湖区散步' },
      { time: '09:50-11:40', place: 'Voss Gondol / Hangurstoppen', title: '缆车可选', note: '天气好就上；天气差就直接多留给卑尔根。', optional: true },
      { time: '11:40-12:40', place: 'Voss', title: '午餐、取行李' },
      { time: '13:00-14:30 左右', place: 'Voss → Bergen', title: '火车去卑尔根', transport: '火车', note: '具体班次以车票为准。' },
      { time: '14:30-15:20', place: 'Citybox Danmarksplass', title: '到酒店寄存/入住' },
      { time: '15:50-17:10', place: 'Bryggen', title: '布吕根老码头街区游览', required: true },
      { time: '17:10-18:00', place: 'Vågen Harbour', title: '港口散步、晚餐前休息' },
      { time: '18:00-20:00', place: 'Mount Fløyen', title: '缆车上山、看城市景', note: '若天气差，改成市区晚餐。', optional: true },
    ],
    reminders: ['Voss 缆车是天气触发项，不为它影响卑尔根主线。'],
    links: [{ label: '当天地图', url: 'https://www.google.com/maps/dir/Voss/Vangsvatnet/Voss+Gondol/Bergen/Bryggen/Mount+Fl%C3%B8yen', kind: '地图' }],
  },
  {
    date: '9/29',
    area: '卑尔根 / 冰岛',
    stay: 'Reykjavík / B47',
    summary: '这天只处理飞行、入境、取车和补给，不安排景点。',
    meal: '泡面',
    cost: '2414 RMB',
    drive: '45min',
    fuel: '落地补给即可',
    route: 'Bergen → Oslo → Keflavík → Reykjavík',
    riskTags: ['航班日', '取车', '补给'],
    timeline: [
      { time: '08:30-09:30', place: 'Citybox Danmarksplass', title: '退房、早餐、整理行李' },
      { time: '09:30-10:20', place: '酒店 → Bergen Airport', title: '去机场', transport: '公共交通 / 打车' },
      { time: '10:20-12:00', place: 'Bergen Airport', title: '候机' },
      { time: '12:00-18:30', place: 'Bergen → Oslo → Iceland', title: '卑尔根飞奥斯陆转冰岛', transport: '飞机', required: true },
      { time: '18:30-19:45', place: 'Keflavík / KEF', title: '入境、取行李、取租车', required: true },
      { time: '19:45-20:30', place: '机场/雷市路上', title: '简单补给：水、零食、早餐、加油确认' },
      { time: '20:30-21:15', place: 'Reykjavík / B47', title: '开到雷市 B47，入住休整' },
    ],
    reminders: ['租车取车时确认保险、碎石险、还车油量和紧急电话。', '当天不加景点，给航班延误留空间。'],
    links: [
      { label: '当天地图', url: 'https://www.google.com/maps/dir/Keflav%C3%ADk+International+Airport/Reykjav%C3%ADk+B47', kind: '地图' },
      officialLinks[4],
      officialLinks[5],
    ],
  },
  {
    date: '9/30',
    area: '雷克雅未克 / 雷克雅内斯',
    stay: 'Reykjavík / B47',
    summary: '上午轻量雷市 + 雷克雅内斯半岛，下午 Sky Lagoon，不去 Blue Lagoon。',
    meal: '小猪商店 + 泡面',
    cost: '2000 RMB',
    route: 'Reykjavík → Reykjanes Peninsula → Sky Lagoon → Reykjavík',
    riskTags: ['温泉预约', '半岛别塞满'],
    timeline: [
      { time: '08:30-09:20', place: 'Hallgrímskirkja', title: '教堂附近拍照、简单 city walk' },
      { time: '09:20-10:00', place: 'B47', title: '回酒店整理、上车出发' },
      { time: '10:00-11:00', place: 'Reykjavík → Reykjanes Peninsula', title: '自驾到雷克雅内斯半岛', transport: '自驾' },
      { time: '11:00-12:30', place: 'Reykjanes Peninsula', title: 'Seltún / Krýsuvík、Gunnuhver、Reykjanesviti 中选 1-2 个', optional: true },
      { time: '12:30-13:40', place: '半岛 → Kópavogur', title: '午餐/返回 Sky Lagoon 方向' },
      { time: '14:00-17:00', place: 'Sky Lagoon', title: '泡温泉、休息', note: '最终入场时间以官方开放时间为准。', required: true },
      { time: '17:00-18:00', place: 'Sky Lagoon → B47', title: '回雷市、晚餐' },
    ],
    reminders: ['提前订 Sky Lagoon 下午场。', '半岛景点不要全塞满，避免压缩温泉时间。'],
    links: [
      { label: '当天地图', url: 'https://www.google.com/maps/dir/B47+Reykjavik/Hallgr%C3%ADmskirkja/Selt%C3%BAn/Sky+Lagoon/B47+Reykjavik', kind: '地图' },
      officialLinks[0],
      officialLinks[1],
    ],
  },
  {
    date: '10/1',
    area: '黄金圈 / Hella',
    stay: 'Hella / Ugla Guesthouse',
    summary: '离开雷市，走黄金圈：辛格维利尔、间歇泉、黄金瀑布，Kerið 视状态可删。',
    meal: '泡面',
    cost: '1063 RMB',
    drive: '3-4h',
    fuel: 'Selfoss / 离开首都圈前加油',
    route: 'Reykjavík → Þingvellir → Geysir → Gullfoss → Kerið → Hella',
    heroImage: './assets/trip/excel-image5.jpeg',
    galleryImages: [
      './assets/trip/excel-image5.jpeg',
      './assets/trip/excel-image6.jpeg',
      './assets/trip/excel-image7.jpeg',
      './assets/trip/excel-image8.jpeg',
    ],
    riskTags: ['离开雷市', 'Kerið 可删'],
    timeline: [
      { time: '07:30-08:00', place: 'Reykjavík / B47', title: '退房、装车' },
      { time: '08:00-09:00', place: 'Reykjavík → Þingvellir', title: '开往辛格维利尔', transport: '自驾' },
      { time: '09:00-10:40', place: 'Þingvellir National Park', title: '裂谷、观景步道', required: true },
      { time: '10:40-11:35', place: 'Þingvellir → Geysir', title: '自驾' },
      { time: '11:35-12:35', place: 'Geysir Geothermal Area', title: '看 Strokkur 喷发、简单午餐', required: true },
      { time: '12:35-13:15', place: 'Geysir → Gullfoss', title: '自驾' },
      { time: '13:15-14:30', place: 'Gullfoss Waterfall', title: '主观景台 + 步道', required: true },
      { time: '14:30-15:35', place: 'Gullfoss → Kerið', title: '自驾' },
      { time: '15:35-16:10', place: 'Kerið / Kerid Crater', title: '火山口湖快速游览', note: '天气差或人累则删除。', optional: true },
      { time: '16:10-17:20', place: 'Selfoss → Hella', title: '加油补给后去 Hella' },
      { time: '17:20 以后', place: 'Ugla Guesthouse', title: '入住、晚餐、休息' },
    ],
    reminders: ['这天的 08:00-16:00 是黄金圈游览段，不含到住宿。', '第二天南岸景点多，早点休息。'],
    links: [{ label: '当天地图', url: 'https://www.google.com/maps/dir/Reykjav%C3%ADk/%C3%9Eingvellir/Geysir/Gullfoss/Keri%C3%B0/Hella', kind: '地图' }],
  },
  {
    date: '10/2',
    area: '南岸 / Vík / Hali',
    stay: 'Hali / Skyrhúsið Guesthouse',
    summary: '关键修正日：17:30 只是 Vík 一带游览节点，之后必须继续开到 Hali 附近住宿。',
    meal: '泡面',
    cost: '1030 RMB',
    drive: '3-4h 原表低估；含 Vík → Hali 为长距离日',
    fuel: 'Hella 满油出发，Vík 再补给',
    route: 'Hella → Seljalandsfoss → Skógafoss → Vík → Hali',
    heroImage: './assets/trip/excel-image9.jpeg',
    galleryImages: [
      './assets/trip/excel-image9.jpeg',
      './assets/trip/excel-image10.jpeg',
      './assets/trip/excel-image11.jpeg',
      './assets/trip/excel-image12.jpeg',
      './assets/trip/excel-image13.jpeg',
      './assets/trip/excel-image14.jpeg',
    ],
    riskTags: ['必须继续到 Hali', '疯狗浪', '长距离夜间段'],
    timeline: [
      { time: '08:00-08:30', place: 'Hella / Ugla Guesthouse', title: '退房、装车', required: true },
      { time: '08:30-09:25', place: 'Hella → Seljalandsfoss', title: '进入南岸', transport: '自驾' },
      { time: '09:25-10:45', place: 'Seljalandsfoss + Gljúfrabúi', title: '两个瀑布一起玩', required: true },
      { time: '10:45-11:15', place: 'Seljalandsfoss → Skógafoss', title: '自驾' },
      { time: '11:15-12:15', place: 'Skógafoss', title: '瀑布、观景平台视体力选择' },
      { time: '12:15-12:35', place: 'Skógafoss → Kvernufoss', title: '自驾' },
      { time: '12:35-13:20', place: 'Kvernufoss', title: '小众瀑布', note: '雨大或体力差则删除。', optional: true },
      { time: '13:20-14:00', place: '去 Dyrhólaey 路上', title: '简单午餐/车上补给' },
      { time: '14:00-15:00', place: 'Dyrhólaey', title: '海岬、拱门、黑沙滩远景' },
      { time: '15:15-16:15', place: 'Reynisfjara Black Sand Beach', title: '黑沙滩游览', note: '注意疯狗浪，不靠近浪线。', required: true },
      { time: '16:15-17:00', place: 'Vík', title: '加油、厕所、补给、休息', required: true },
      { time: '17:00-20:15', place: 'Vík → Hali / Skyrhúsið Guesthouse', title: '长距离开往冰河湖附近住宿', note: '这段必须保留，否则赶不上 10/3 上午 09:30 集合。', required: true },
      { time: '20:15 以后', place: 'Skyrhúsið Guesthouse', title: '入住、简单晚餐、整理徒步装备' },
    ],
    reminders: ['不要把 17:30 当作当天结束。', '出发前查 road.is、Safetravel、Vedur。', '黑沙滩不背对海浪，不靠近湿沙浪线。'],
    links: [
      { label: '当天地图', url: 'https://www.google.com/maps/dir/Hella/Seljalandsfoss/Sk%C3%B3gafoss/Kvernufoss/Dyrh%C3%B3laey/Reynisfjara/V%C3%ADk/Skyrh%C3%BAsi%C3%B0+Guesthouse', kind: '地图' },
      officialLinks[4],
      officialLinks[5],
      officialLinks[6],
    ],
  },
  {
    date: '10/3',
    area: '冰川 / 冰河湖 / Höfn',
    stay: 'Höfn / Sauðanes Guesthouse',
    summary: '上午 09:30 冰川徒步集合，不是下午；下午冰河湖和钻石沙滩，体力差就删 Fjallsárlón。',
    meal: '泡面',
    cost: '4813 RMB',
    drive: '4-5h',
    fuel: 'Hali / Höfn 方向留意补给',
    route: 'Hali → Glacier Hike → Fjallsárlón → Jökulsárlón → Diamond Beach → Höfn',
    heroImage: './assets/trip/excel-image15.jpeg',
    galleryImages: [
      './assets/trip/excel-image15.jpeg',
      './assets/trip/excel-image16.jpeg',
    ],
    riskTags: ['09:30 集合', '冰川装备', '体力消耗大'],
    timeline: [
      { time: '07:30-08:30', place: 'Skyrhúsið Guesthouse', title: '早餐、退房、换徒步衣物、装车', required: true },
      { time: '08:45-09:10', place: 'Skyrhúsið → Hali 集合点', title: '开车到冰川徒步集合点', note: '计划按约 10 分钟车程，多留缓冲。', required: true },
      { time: '09:10-09:30', place: 'Hali area', title: '报到、装备、听安全说明', required: true },
      { time: '09:30-15:30', place: 'Vatnajökull Glacier Hike', title: '6h 冰川徒步', note: '按已预订活动执行。', required: true },
      { time: '15:30-15:55', place: '集合点', title: '换衣服、吃东西、休息' },
      { time: '15:55-16:25', place: 'Hali → Fjallsárlón', title: '自驾' },
      { time: '16:25-17:10', place: 'Fjallsárlón', title: '冰湖游览', note: '很累就删。', optional: true },
      { time: '17:20-18:10', place: 'Jökulsárlón', title: '冰河湖主景区', required: true },
      { time: '18:10-18:40', place: 'Diamond Beach', title: '看冰块、拍照', required: true },
      { time: '18:40-19:50', place: 'Jökulsárlón → Höfn', title: '自驾到住宿', note: '路上有单车道桥，不按极限时间开。' },
      { time: '19:50 以后', place: 'Sauðanes Guesthouse', title: '入住、晚餐、休息' },
    ],
    reminders: ['带水、能量棒、手套、防水外层。', '冰川后优先保留 Jökulsárlón + Diamond Beach。'],
    links: [
      { label: '当天地图', url: 'https://www.google.com/maps/dir/Skyrh%C3%BAsi%C3%B0+Guesthouse/Glacier+Adventure+Base+Camp/Fjalls%C3%A1rl%C3%B3n/J%C3%B6kuls%C3%A1rl%C3%B3n/Diamond+Beach/H%C3%B6fn', kind: '地图' },
      officialLinks[2],
      officialLinks[3],
      officialLinks[4],
    ],
  },
  {
    date: '10/4',
    area: 'Höfn → 机场附近',
    stay: '机场附近 / Lighthouse-Inn',
    summary: '全程最长驾驶日。核心是安全返程，天气差就取消补漏，直奔机场附近。',
    meal: '泡面',
    cost: '1000 RMB',
    drive: '6-7h',
    fuel: 'Vík / Hvolsvöllur',
    route: 'Höfn → Fjaðrárgljúfur → South Coast → Keflavík / Garður',
    heroImage: './assets/trip/excel-image17.jpeg',
    galleryImages: [
      './assets/trip/excel-image17.jpeg',
      './assets/trip/excel-image18.jpeg',
      './assets/trip/excel-image19.jpeg',
    ],
    riskTags: ['最长驾驶日', '天气优先', '早班机前夜'],
    timeline: [
      { time: '07:30-08:00', place: 'Sauðanes Guesthouse', title: '退房、装车', required: true },
      { time: '08:00-11:30', place: 'Höfn → Fjaðrárgljúfur', title: '长距离返程', note: '中途只做厕所/咖啡短停。', required: true },
      { time: '11:30-12:30', place: 'Fjaðrárgljúfur Canyon', title: '羽毛峡谷步道、观景台' },
      { time: '12:30-13:15', place: 'Kirkjubæjarklaustur 附近', title: '午餐、加油、厕所' },
      { time: '13:15-15:20', place: '往 Vík / Hvolsvöllur 方向返程', title: '进入沿途补漏/补拍区间' },
      { time: '15:20-16:20', place: '补漏点 1 个', title: 'Reynisfjara / Skógafoss / Kvernufoss / Vík 小镇只选一个', note: '不能全补。天气差则取消。', optional: true },
      { time: '16:20-19:30', place: '南岸 → Keflavík / Garður', title: '开往机场附近 Lighthouse-Inn', required: true },
      { time: '19:30 以后', place: 'Lighthouse-Inn', title: '入住、整理行李、确认还车流程', note: '10/5 08:30 飞机，今晚确认油和还车路线。' },
    ],
    reminders: ['当天早上和中午都查 Road.is 与 Safetravel。', '如果天气差，取消补漏直奔酒店。', '睡前确认加油、还车点和出发时间。'],
    links: [
      { label: '当天地图', url: 'https://www.google.com/maps/dir/H%C3%B6fn/Fja%C3%B0r%C3%A1rglj%C3%BAfur/Keflav%C3%ADk+International+Airport/Lighthouse-Inn+Gar%C3%B0ur', kind: '地图' },
      officialLinks[4],
      officialLinks[5],
      officialLinks[6],
    ],
  },
  {
    date: '10/5',
    area: '返程 / 赫尔辛基转机',
    stay: '返程',
    summary: '早班机离开冰岛，赫尔辛基 10h 转机可做 citywalk，但至少提前 2.5-3h 回机场。',
    meal: '外带早餐',
    route: 'Keflavík → Helsinki → citywalk',
    riskTags: ['早班机', '还车', '转机缓冲'],
    timeline: [
      { time: '05:30-05:45', place: 'Lighthouse-Inn', title: '出发去机场/还车点', required: true },
      { time: '05:45-06:20', place: 'Keflavík Airport / KEF', title: '还车、接驳到航站楼', required: true },
      { time: '06:20-08:00', place: 'KEF 航站楼', title: '值机、安检、早餐' },
      { time: '08:30', place: 'KEF → Helsinki / HEL', title: '飞赫尔辛基', transport: '飞机', required: true },
      { time: '抵达后约 1-1.5h', place: 'Helsinki Airport → City Centre', title: '机场火车进市区', transport: '火车' },
      { time: '中转可用时间内', place: 'Helsinki citywalk', title: '中央车站、大教堂、元老院广场、集市广场、Esplanadi', optional: true },
    ],
    reminders: ['至少提前 2.5-3 小时回到机场。', '如果入境、行李或天气不顺，直接留在机场。'],
    links: [
      { label: '赫尔辛基 citywalk 地图', url: 'https://www.google.com/maps/dir/Helsinki+Central+Station/Helsinki+Cathedral/Senate+Square/Market+Square,+Helsinki/Esplanadi', kind: '地图' },
      officialLinks[9],
    ],
  },
];

const packingList: ChecklistItem[] = [
  { label: '防水鞋子', group: '寄存行李' },
  { label: '雨衣', group: '寄存行李' },
  { label: '防水裤', group: '寄存行李' },
  { label: '眼镜（开车用）', group: '背包' },
  { label: 'Pocket 4', group: '背包' },
  { label: '餐具', group: '装备' },
  { label: '保温杯', group: '装备' },
  { label: '锅 / 烧水壶', group: '装备' },
  { label: '药', group: '背包' },
  { label: '墨镜', group: '背包' },
  { label: '泳衣', group: '温泉' },
  { label: '毛巾、拖鞋、牙刷', group: '温泉' },
  { label: '咖喱块、冬阴功、面', group: '食物' },
];

const todos: ChecklistItem[] = [
  { label: '签证准备：在职、流水证明', group: '8.15 前' },
  { label: '签证准备：驾照翻译', group: '8.15 前' },
  { label: '签证准备：行程表', group: '8.15 前' },
  { label: '签证办理', group: '8.15 前' },
  { label: '预约租车', group: '8.15 前' },
  { label: '9.30 日行程规划', group: '8.15 前' },
  { label: '门票购买', group: '8.15 前' },
  { label: '中途火车/轮船购买', group: '8.15 前' },
  { label: '租 Pocket 4', group: '8.15 前' },
  { label: '电话卡', group: '8.15 前' },
  { label: '兑外币', group: '8.15 前' },
  { label: 'Visa 信用卡确定', group: '8.15 前' },
  { label: '保险', group: '出发前' },
];

const drivingNotes = [
  { label: '市区限速', value: '50 km/h，住宅区有时为 30 km/h' },
  { label: '沥青公路', value: '80-90 km/h，注意羊群和风' },
  { label: '小碎石路 / F-road', value: '一般建议 50-60 km/h，普通车辆不要误入 F-road' },
  { label: '加油', value: '多数无人值守，准备可用信用卡；10/2 Vík、10/4 Vík/Hvolsvöllur 是关键补给点' },
  { label: '停车', value: '下载 Parka / EasyPark，住宿有免费停车优先' },
  { label: '罚单高发', value: '超速、错误停车、碎石路不减速、不系安全带、开车打电话' },
];

const emergencyContacts = [
  { country: '挪威', name: '中华人民共和国驻挪威王国大使馆', detail: '总机 / 业务咨询：+47-22492052；签证/领事业务咨询：+47-94069628；紧急领事保护：+47-93066621' },
  { country: '冰岛', name: '中华人民共和国驻冰岛大使馆', detail: '领事业务/咨询：+354 527 6688（周一/三/五 09:00-11:30）；紧急领事保护：+354 416 0128' },
  { country: '全球', name: '外交部全球领保热线', detail: '+86 10 12308 / +86 10 65612308' },
];

const tabs = ['每日行程', '自驾与路况', '出发前清单', '费用与待办', '紧急联系'] as const;
type Tab = (typeof tabs)[number];

function App() {
  const [activeDay, setActiveDay] = useState(tripDays[0].date);
  const [activeTab, setActiveTab] = useState<Tab>('每日行程');
  const currentDay = tripDays.find((day) => day.date === activeDay) ?? tripDays[0];
  const totalCost = '59270 RMB';

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Norway / Iceland / Helsinki</p>
          <h1>挪威冰岛同行行程</h1>
          <p className="intro">9/25-10/5，从上海到奥斯陆、挪威峡湾、卑尔根、冰岛南岸，再经赫尔辛基返程。</p>
        </div>
        <div className="status-grid" aria-label="旅行概览">
          <Metric icon={<CalendarDays />} label="日期" value="9/25 - 10/5" />
          <Metric icon={<Navigation />} label="主线" value="Oslo → Bergen → Iceland" />
          <Metric icon={<CircleDollarSign />} label="预估总费用" value={totalCost} />
          <Metric icon={<ShieldAlert />} label="重点风险" value="10/2-10/4 冰岛长线" />
        </div>
      </header>

      <section className="alert-strip" aria-label="关键提醒">
        <AlertTriangle aria-hidden />
        <div>
          <strong>核心校准：</strong>
          10/2 的 17:30 不是当天结束，必须从 Vík 继续开到 Hali / Skyrhúsið，才能赶上 10/3 上午 09:30 冰川徒步集合。
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
      {activeTab === '费用与待办' && <CostsPanel totalCost={totalCost} />}
      {activeTab === '紧急联系' && <EmergencyPanel />}
    </div>
  );
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
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
        <div className="panel">
          <h3><Info aria-hidden /> 当天提醒</h3>
          <ul className="clean-list">
            {day.reminders.map((reminder) => <li key={reminder}>{reminder}</li>)}
          </ul>
        </div>
        <div className="panel">
          <h3><ExternalLink aria-hidden /> 外链</h3>
          <div className="link-grid">
            {day.links.map((link) => <LinkButton key={link.url} link={link} />)}
          </div>
        </div>
      </section>
    </article>
  );
}

function Fact({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="fact">
      <span>{icon}</span>
      <small>{label}</small>
      <strong>{value}</strong>
    </div>
  );
}

function LinkButton({ link }: { link: SourceLink }) {
  return (
    <a href={link.url} target="_blank" rel="noreferrer" className="link-button">
      <span>{link.kind}</span>
      {link.label}
      <ExternalLink aria-hidden />
    </a>
  );
}

function DrivingPanel() {
  return (
    <main className="content-grid">
      <section className="panel wide">
        <h2><Car aria-hidden /> 自驾与路况</h2>
        <p className="section-copy">冰岛段以天气和路况为最高优先级。10/2 必须到 Hali，10/4 是最长驾驶日，所有补漏景点都让位给安全返程。</p>
        <div className="driving-grid">
          {drivingNotes.map((note) => (
            <div className="driving-note" key={note.label}>
              <strong>{note.label}</strong>
              <p>{note.value}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="panel">
        <h3><CloudSun aria-hidden /> 出发前复查</h3>
        <div className="link-grid">
          {officialLinks.filter((link) => ['天气', '安全'].includes(link.kind)).map((link) => <LinkButton key={link.url} link={link} />)}
        </div>
      </section>
      <section className="panel">
        <h3><Fuel aria-hidden /> 自驾段加油点</h3>
        <ul className="clean-list">
          <li>9/29：落地补给即可。</li>
          <li>10/1：Selfoss，离开首都圈前加油。</li>
          <li>10/2：Hella 满油出发，Vík 补给。</li>
          <li>10/3：Hali / Höfn 方向留意油量。</li>
          <li>10/4：Vík / Hvolsvöllur 是关键返程补给点。</li>
        </ul>
      </section>
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
                <small>{item.group}</small>
              </span>
            </label>
          ))}
        </div>
      </section>
      <section className="panel">
        <h3><CheckCircle2 aria-hidden /> 行前软件</h3>
        <ul className="clean-list">
          <li>Google Maps + Maps.me 离线地图。</li>
          <li>Parka / EasyPark 停车。</li>
          <li>Road.is、Safetravel、Vedur 收藏到浏览器首页。</li>
        </ul>
      </section>
      <section className="panel">
        <h3><Sparkles aria-hidden /> 特别装备</h3>
        <ul className="clean-list">
          <li>冰川徒步：手套、防水外层、水、能量棒。</li>
          <li>Sky Lagoon：泳衣、毛巾、拖鞋。</li>
          <li>自驾：驾驶眼镜、信用卡、驾照翻译。</li>
        </ul>
      </section>
    </main>
  );
}

function CostsPanel({ totalCost }: { totalCost: string }) {
  const costs = [
    ['旅行总预算', totalCost],
    ['租车', '5815 RMB'],
    ['油费 + 税费', '2000 RMB'],
    ['停车费', '800 RMB'],
    ['旅游保险', '500 RMB'],
    ['上厕所', '100 RMB'],
    ['租相机', '315 RMB'],
    ['签证', '2600 RMB'],
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
      <section className="panel">
        <h3><ExternalLink aria-hidden /> 官方入口</h3>
        <div className="link-grid">
          {officialLinks.filter((link) => link.kind === '使馆').map((link) => <LinkButton key={link.url} link={link} />)}
        </div>
      </section>
      <section className="panel">
        <h3><ShieldAlert aria-hidden /> 现场原则</h3>
        <ul className="clean-list">
          <li>先保证人身安全，再处理票务或行程损失。</li>
          <li>冰岛恶劣天气下，不为补景点冒险开车。</li>
          <li>重要文件拍照并离线保存。</li>
        </ul>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
