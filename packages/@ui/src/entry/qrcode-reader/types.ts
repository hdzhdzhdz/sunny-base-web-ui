/** 二维码识别模式 */
export type QrcodeReaderMode = 'stream' | 'capture' | 'drop-zone';

/** 检测到的条形码信息 */
export interface DetectedBarcode {
  /** 边界框 */
  boundingBox: DOMRectReadOnly;
  /** 原始值 */
  rawValue: string;
  /** 条形码格式 */
  format: string;
  /** 四个角坐标 */
  cornerPoints: ReadonlyArray<Point>;
}

export interface Point {
  x: number;
  y: number;
}

export interface SunnyQrcodeReaderProps {
  /**
   * 识别模式
   * - `stream`: 摄像头实时扫描
   * - `capture`: 文件上传识别
   * - `drop-zone`: 拖拽图片识别
   * @default 'stream'
   */
  mode?: QrcodeReaderMode;
  /**
   * 是否暂停扫描（仅 stream 模式）
   * @default false
   */
  paused?: boolean;
  /**
   * 摄像头约束（仅 stream 模式）
   * @default { facingMode: 'environment' }
   */
  constraints?: MediaTrackConstraints;
  /**
   * 是否开启手电筒（仅 stream 模式，需设备支持）
   * @default false
   */
  torch?: boolean;
  /**
   * 要识别的条形码格式列表
   * @default ['qr_code']
   */
  formats?: string[];
  /**
   * 自定义追踪函数，用于在视频帧上绘制高亮（仅 stream 模式）
   */
  track?: ((barcodes: DetectedBarcode[], canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => void) | false;
}
