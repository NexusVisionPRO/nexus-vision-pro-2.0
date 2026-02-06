import React from 'react';

interface Props {
  children: React.ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  info: React.ErrorInfo | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error } as Partial<State>;
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught', error, info);
    this.setState({ error, info });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, info: null });
    if (this.props.onReset) this.props.onReset();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-900/80 text-white rounded">
          <h3 className="font-bold mb-2">Ocorreu um erro ao renderizar a interface</h3>
          <pre className="text-xs max-h-60 overflow-auto mb-3">{String(this.state.error?.message)}
{this.state.info?.componentStack}</pre>
          <div className="flex gap-2">
            <button onClick={this.handleReset} className="px-3 py-1 bg-white/10 rounded">Tentar limpar</button>
            <button onClick={() => window.location.reload()} className="px-3 py-1 bg-white/10 rounded">Recarregar</button>
          </div>
        </div>
      );
    }

    return this.props.children as React.ReactElement;
  }
}
