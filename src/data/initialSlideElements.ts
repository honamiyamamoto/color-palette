import type { SlideElement } from '../types/slide'

export const INITIAL_SLIDE_ELEMENTS: SlideElement[] = [
  {
    id: 'text-1',
    type: 'text',
    label: 'テキストボックス',
    text: '売上ハイライト',
    x: 70,
    y: 70,
    width: 260,
    height: 90,
    style: {
      textColor: '#1F2A44',
      fillColor: '#FFFFFF',
      strokeColor: '#3C86D9',
    },
  },
  {
    id: 'rect-1',
    type: 'rectangle',
    label: '長方形',
    x: 410,
    y: 90,
    width: 210,
    height: 120,
    style: {
      textColor: '#1F2A44',
      fillColor: '#DEEAF9',
      strokeColor: '#1E5CA8',
    },
  },
  {
    id: 'circle-1',
    type: 'circle',
    label: '円',
    x: 130,
    y: 270,
    width: 130,
    height: 130,
    style: {
      textColor: '#1F2A44',
      fillColor: '#D8F1E0',
      strokeColor: '#2E8C59',
    },
  },
  {
    id: 'arrow-1',
    type: 'arrow',
    label: '矢印',
    text: '重点',
    x: 355,
    y: 290,
    width: 310,
    height: 95,
    style: {
      textColor: '#1F2A44',
      fillColor: '#F9E6CF',
      strokeColor: '#BF6A1D',
    },
  },
]
