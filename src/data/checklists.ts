import type { ChecklistItem } from '../types';

export const packingList: ChecklistItem[] = [
  { label: '防水鞋子', group: '寄存行李' },
  { label: '雨衣', group: '寄存行李' },
  { label: '防水裤', group: '寄存行李' },
  { label: '眼镜', group: '背包', detail: '开车用' },
  { label: 'Pocket 4', group: '背包' },
  { label: '餐具', group: '装备' },
  { label: '保温杯', group: '装备' },
  { label: '锅 / 烧水壶', group: '装备' },
  { label: '常用药', group: '背包' },
  { label: '墨镜', group: '背包' },
  { label: '泳衣', group: '温泉' },
  { label: '毛巾、拖鞋、牙刷', group: '温泉' },
  { label: '咖啡块、冻干饭、泡面', group: '食物' },
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
];
