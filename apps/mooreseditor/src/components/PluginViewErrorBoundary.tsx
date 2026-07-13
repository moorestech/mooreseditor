import type { ReactNode } from "react";
import React from "react";

interface PluginViewErrorBoundaryProps {
  pluginId: string;
  pluginName?: string;
  children: ReactNode;
}

interface PluginViewErrorBoundaryState {
  error: Error | null;
}

export class PluginViewErrorBoundary extends React.Component<
  PluginViewErrorBoundaryProps,
  PluginViewErrorBoundaryState
> {
  state: PluginViewErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): PluginViewErrorBoundaryState {
    return { error };
  }

  componentDidUpdate(prevProps: PluginViewErrorBoundaryProps) {
    if (
      this.state.error &&
      prevProps.pluginId !== this.props.pluginId
    ) {
      this.setState({ error: null });
    }
  }

  handleRetry = () => {
    this.setState({ error: null });
  };

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <div
        role="alert"
        style={{
          padding: 24,
          color: "#3d2b1f",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Plugin view failed</h2>
        <p>
          <strong>Plugin:</strong>{" "}
          {this.props.pluginName ?? this.props.pluginId} ({this.props.pluginId})
        </p>
        <p>
          <strong>Error:</strong> {this.state.error.message}
        </p>
        <button type="button" onClick={this.handleRetry}>
          Retry
        </button>
      </div>
    );
  }
}

export function PluginViewContent({
  renderView,
}: {
  renderView: () => ReactNode;
}) {
  return <>{renderView()}</>;
}
