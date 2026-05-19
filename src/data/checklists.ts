import type { ChecklistItem, DecisionRule, MapStop } from '../types';

export const packingList: ChecklistItem[] = [
  { label: '护照 / 签证 / 保险单离线版', group: '随身证件包' },
  { label: '信用卡 / 少量现金 / 驾照翻译件', group: '随身证件包' },
  { label: '机票、住宿、租车、活动确认单离线保存', group: '随身证件包' },
  { label: '眼镜', group: '自驾包', detail: '开车用' },
  { label: '车充 / 充电线 / 手机支架', group: '自驾包' },
  { label: 'Google Maps + Maps.me 离线地图', group: '自驾包' },
  { label: '防水鞋子', group: '冰川活动包' },
  { label: '雨衣', group: '冰川活动包' },
  { label: '防水裤', group: '冰川活动包' },
  { label: '手套 / 保暖层 / 能量棒', group: '冰川活动包' },
  { label: '泳衣', group: '温泉包' },
  { label: '毛巾、拖鞋、牙刷', group: '温泉包' },
  { label: '餐具', group: '做饭/泡面包' },
  { label: '保温杯', group: '做饭/泡面包' },
  { label: '锅 / 烧水壶', group: '做饭/泡面包' },
  { label: '咖啡块、冻干饭、泡面', group: '做饭/泡面包' },
  { label: '常用药', group: '做饭/泡面包' },
  { label: 'Pocket 4', group: '摄影设备包' },
  { label: '相机 / 存储卡 / 充电器', group: '摄影设备包' },
  { label: '墨镜', group: '摄影设备包' },
  { label: '护照、钱包、手机、充电器检查', group: '退房前检查' },
  { label: '冰箱 / 厨房 / 浴室 / 插座检查', group: '退房前检查' },
  { label: '车钥匙、停车缴费、油量确认', group: '退房前检查' },
];

export const todos: ChecklistItem[] = [
  { label: '签证材料：在职、流水证明', group: '8.15 前' },
  { label: '签证材料：驾照翻译', group: '8.15 前' },
  { label: '签证材料：行程表', group: '8.15 前' },
  { label: '签证办理', group: '8.15 前' },
  { label: '预约租车', group: '8.15 前' },
  { label: '9.30 日行程规划', group: '8.15 前' },
  { label: '门票购买', group: '8.15 前' },
  { label: '中途火车 / 轮船购买', group: '8.15 前' },
  { label: '租 Pocket 4', group: '8.15 前' },
  { label: '电话卡', group: '8.15 前' },
  { label: '换外币', group: '8.15 前' },
  { label: 'Visa 信用卡确认', group: '8.15 前' },
  { label: '保险', group: '出发前' },
];

export const drivingNotes = [
  { label: '市区限速', value: '50 km/h，住宅区有时 30 km/h。' },
  { label: '沥青公路', value: '80-90 km/h，注意羊群、横风和桥梁窄路。' },
  { label: '小碎石路 / F-road', value: '普通车辆不要误入 F-road；碎石路减速并拉开跟车距离。' },
  { label: '加油', value: '多数无人值守，准备可用信用卡；10/2 Vík、10/4 Vík/Hvolsvöllur 是关键补给点。' },
  { label: '停车', value: '提前准备 Parka / EasyPark；住宿有免费停车时优先。' },
  { label: '罚单高发', value: '超速、错误停车、碎石路不减速、不系安全带、开车使用手机。' },
];

export const fuelMarketStops: MapStop[] = [
  {
    date: '9/29',
    label: 'KEF / Reykjavík 落地补给',
    detail: '取车后只做顺路补给，航班日不绕远。',
    fuelUrl: 'https://www.google.com/maps/search/gas+station+near+Keflavik+International+Airport',
    marketUrl: 'https://www.google.com/maps/search/supermarket+between+Keflavik+Airport+and+Reykjavik',
  },
  {
    date: '10/1',
    label: 'Selfoss / 首都圈出发前',
    detail: '离开首都圈前确认油量，黄金圈途中不靠临时找油站。',
    fuelUrl: 'https://www.google.com/maps/search/gas+station+Selfoss+Iceland',
    marketUrl: 'https://www.google.com/maps/search/supermarket+Selfoss+Iceland',
  },
  {
    date: '10/2',
    label: 'Hella / Vík',
    detail: 'Hella 满油出发，Vík 作为南岸关键厕所、加油、补给点。',
    fuelUrl: 'https://www.google.com/maps/search/gas+station+Vik+Iceland',
    marketUrl: 'https://www.google.com/maps/search/supermarket+Vik+Iceland',
  },
  {
    date: '10/3',
    label: 'Höfn',
    detail: '冰川活动后到 Höfn 方向留意补给，避免 10/4 早上空油出发。',
    fuelUrl: 'https://www.google.com/maps/search/gas+station+Hofn+Iceland',
    marketUrl: 'https://www.google.com/maps/search/supermarket+Hofn+Iceland',
  },
  {
    date: '10/4',
    label: 'Vík / Hvolsvöllur',
    detail: '最长返程日关键补给带，天气差时只短停。',
    fuelUrl: 'https://www.google.com/maps/search/gas+station+Hvolsvollur+Iceland',
    marketUrl: 'https://www.google.com/maps/search/supermarket+Hvolsvollur+Iceland',
  },
  {
    date: '10/4-10/5',
    label: 'Keflavík / Garður',
    detail: '早班机前夜确认还车油量和机场附近补给。',
    fuelUrl: 'https://www.google.com/maps/search/gas+station+near+Gar%C3%B0ur+Iceland',
    marketUrl: 'https://www.google.com/maps/search/supermarket+near+Keflavik+Iceland',
  },
];

export const weatherDecisionRules: DecisionRule[] = [
  { condition: 'Road.is 显示 closed / impassable', action: '不出发，删除当天远途，改为就近住宿或等待。' },
  { condition: 'Vedur 风速持续 > 15 m/s 或有 storm warning', action: '取消补漏景点，直奔住宿，避免海边和高地暴露点。' },
  { condition: '10/4 早上天气差', action: '取消景点，直接回机场附近，优先还车和早班机。' },
  { condition: '10/2 17:30 仍在 Vík', action: '不再补任何景点，按住宿方向行驶并控制疲劳驾驶。' },
];

export const emergencyContacts = [
  {
    country: '挪威',
    name: '中华人民共和国驻挪威王国大使馆',
    detail: '总机 / 业务咨询：+47-22492052；签证 / 领事业务咨询：+47-94069628；紧急领事保护：+47-93066621',
  },
  {
    country: '冰岛',
    name: '中华人民共和国驻冰岛大使馆',
    detail: '领事业务 / 咨询：+354 527 6688；紧急领事保护：+354 416 0128',
  },
  {
    country: '全球',
    name: '外交部全球领保热线',
    detail: '+86 10 12308 / +86 10 65612308',
  },
  {
    country: '保险',
    name: '旅游保险救援电话',
    detail: '+86 21 5230 0806',
  },
];
