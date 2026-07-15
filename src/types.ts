export interface ImageAsset {
  id: string;
  name: string;
  url: string;
  width?: number;
  height?: number;
  mimeType?: string;
  size: number | string;
  collection?: string;
  date?: string;
  isMock?: boolean;
}

export interface Collection {
  id: string;
  name: string;
  imageCount: number;
}
