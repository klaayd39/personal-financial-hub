import React, { Component } from 'react';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  webGlSupported: boolean;
}

/**
 * Checks if WebGL context creation is supported in the browser.
 */
function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

export class CanvasErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      webGlSupported: isWebGLAvailable(),
    };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true, webGlSupported: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn('R3F Canvas Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError || !this.state.webGlSupported) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}
