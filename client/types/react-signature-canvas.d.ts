declare module 'react-signature-canvas' {
  import { Component } from 'react';

  interface SignatureCanvasProps {
    penColor?: string;
    canvasProps?: React.CanvasHTMLAttributes<HTMLCanvasElement>;
    onEnd?: () => void;
    onBegin?: () => void;
    velocityFilterWeight?: number;
    minWidth?: number;
    maxWidth?: number;
    throttle?: number;
    backgroundColor?: string;
    dotSize?: number | (() => number);
    minWidthDistance?: number;
    velocityMinPressure?: number;
  }

  export default class SignatureCanvas extends Component<SignatureCanvasProps> {
    clear: () => void;
    isEmpty: () => boolean;
    toDataURL: (type?: string, quality?: number) => string;
    fromDataURL: (dataUrl: string) => void;
    getSignaturePad: () => any;
    getCanvas: () => HTMLCanvasElement;
    getTrimmedCanvas: () => HTMLCanvasElement;
  }
}
