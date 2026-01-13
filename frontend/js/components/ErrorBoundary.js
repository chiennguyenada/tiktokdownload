class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-6 bg-red-900/30 border border-red-500 rounded-xl text-white">
                    <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                        <window.Icon name="alert-triangle" className="text-red-400" />
                        Something went wrong.
                    </h2>
                    <p className="text-gray-300 mb-4">The application encountered an error while rendering this component.</p>
                    <details className="bg-black/30 p-4 rounded text-xs font-mono text-red-300 overflow-auto whitespace-pre-wrap">
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </details>
                    <button
                        onClick={() => this.setState({ hasError: false })}
                        className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition"
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

window.ErrorBoundary = ErrorBoundary;
