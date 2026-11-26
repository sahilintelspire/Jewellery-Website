import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[AURA JEWELS UI Error]:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full rounded-3xl bg-white border border-[#E5DFD6] p-8 shadow-lg space-y-4">
            <h1 className="font-serif text-2xl font-bold text-[#2C2724]">
              Atelier Display Interrupted
            </h1>
            <p className="text-xs text-[#6E6259] break-words">
              {this.state.error?.message || 'An unexpected rendering issue occurred.'}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 rounded-full bg-[#2C2724] text-white text-xs font-semibold"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
