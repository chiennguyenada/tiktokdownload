const Home = ({ apiKey, result, setResult }) => {
    const [url, setUrl] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    // Lifted state: result and setResult are now props
    // const [result, setResult] = React.useState(null);

    const [error, setError] = React.useState(null);

    const handleAnalyze = async () => {
        if (!url) return;
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            // Determine backend URL. Assuming localhost:8000 for local dev.
            const backendUrl = 'http://localhost:8000/analyze';

            const headers = { 'Content-Type': 'application/json' };
            if (apiKey) {
                headers['X-Gemini-API-Key'] = apiKey;
            }

            const response = await axios.post(backendUrl, { video_url: url }, { headers });
            setResult(response.data);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || err.message || 'An error occurred during analysis.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                TikTok Fact Checker
            </h1>

            <div className="w-full max-w-2xl bg-gray-800 p-2 rounded-2xl shadow-2xl flex items-center border border-gray-700 mb-10 transition-all focus-within:ring-2 focus-within:ring-blue-500">
                <input
                    type="text"
                    placeholder="Paste TikTok URL here..."
                    className="flex-1 bg-transparent border-none text-white px-4 py-3 focus:outline-none text-lg placeholder-gray-500"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                />
                <button
                    onClick={handleAnalyze}
                    disabled={loading || !url}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2"
                >
                    {loading ? 'Analyzing...' : <><window.Icon name="upload" size={20} /> Analyze</>}
                </button>
            </div>

            {error && (
                <div className="w-full max-w-2xl bg-red-900/20 border border-red-500/50 text-red-200 p-4 rounded-xl mb-8 flex items-center gap-3">
                    <window.Icon name="alert" />
                    {error}
                </div>
            )}

            {loading && <window.Loader />}

            {result && (
                <window.ErrorBoundary>
                    {window.AnalysisResult ? (
                        <window.AnalysisResult
                            data={result}
                            onUpdate={(updates) => setResult(prev => ({ ...prev, ...updates }))}
                        />
                    ) : (
                        <div className="text-red-400 p-4 border border-red-500 rounded bg-red-900/10">
                            Error: AnalysisResult component not loaded. Please refresh the page.
                        </div>
                    )}
                </window.ErrorBoundary>
            )}
        </div>
    );
};

window.Home = Home;
