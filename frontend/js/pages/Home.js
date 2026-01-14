const Home = ({ apiKey, result, setResult }) => {
    const [url, setUrl] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [uploading, setUploading] = React.useState(false);
    const [isDragging, setIsDragging] = React.useState(false);
    const [error, setError] = React.useState(null);
    const fileInputRef = React.useRef(null);

    const handleAnalyze = async () => {
        if (!url) return;
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const backendUrl = '/analyze';
            const headers = { 'Content-Type': 'application/json' };
            if (apiKey) {
                headers['X-Gemini-API-Key'] = apiKey;
            }

            const response = await axios.post(backendUrl, { video_url: url }, { headers });
            setResult(response.data);
        } catch (err) {
            console.error(err);
            const detail = err.response?.data?.detail || err.message;
            setError(detail);

            // If it's a download error, suggest manual upload
            if (detail.includes("Unable to extract") || detail.includes("Internal Server Error")) {
                setError(
                    <div className="flex flex-col gap-2">
                        <p>TikTok blocked automated download. Please download the video manually and upload it below.</p>
                        <button
                            onClick={() => fileInputRef.current.click()}
                            className="text-blue-400 hover:text-blue-300 underline text-sm w-fit"
                        >
                            Upload Video File instead
                        </button>
                    </div>
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const processFile = async (file) => {
        if (!file || !file.type.startsWith('video/')) {
            setError('Please select a valid video file.');
            return;
        }

        setUploading(true);
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const backendUrl = '/analyze-upload';
            const formData = new FormData();
            formData.append('video', file);

            const headers = {};
            if (apiKey) {
                headers['X-Gemini-API-Key'] = apiKey;
            }

            const response = await axios.post(backendUrl, formData, {
                headers,
                timeout: 300000
            });
            setResult(response.data);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || err.message || 'Failed to upload and analyze video.');
        } finally {
            setLoading(false);
            setUploading(false);
        }
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        processFile(file);
        event.target.value = '';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        processFile(file);
    };

    return (
        <div className="flex flex-col items-center">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                TikTok Fact Checker
            </h1>

            <div className="w-full max-w-2xl bg-gray-800 p-2 rounded-2xl shadow-2xl flex items-center border border-gray-700 mb-6 transition-all focus-within:ring-2 focus-within:ring-blue-500">
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
                    {loading && !uploading ? 'Analyzing...' : <><window.Icon name="upload" size={20} /> Analyze</>}
                </button>
            </div>

            {/* Manual Upload Fallback UI */}
            <div className="w-full max-w-2xl flex items-center justify-between px-4 mb-10">
                <div className="h-px bg-gray-700 flex-1"></div>
                <span className="text-xs text-gray-500 px-4 uppercase tracking-widest font-bold">OR</span>
                <div className="h-px bg-gray-700 flex-1"></div>
            </div>

            <div className="w-full max-w-2xl mb-12">
                <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                />
                <button
                    onClick={() => fileInputRef.current.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    disabled={loading}
                    className={`w-full py-10 border-2 border-dashed rounded-2xl transition-all group flex flex-col items-center gap-3 disabled:opacity-50 ${isDragging
                        ? 'border-blue-400 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.15)] scale-[1.01]'
                        : 'border-gray-700 hover:border-blue-500/50 bg-gray-800/50 hover:bg-gray-800/80'
                        }`}
                >
                    <div className={`p-4 rounded-full transition-colors ${isDragging ? 'bg-blue-500/30' : 'bg-gray-700/50 group-hover:bg-blue-500/20'
                        }`}>
                        <window.Icon
                            name="upload"
                            size={28}
                            className={isDragging ? 'text-blue-400' : 'text-gray-400 group-hover:text-blue-400'}
                        />
                    </div>
                    <div className="text-center">
                        <p className={`font-semibold ${isDragging ? 'text-blue-400' : 'text-gray-300'}`}>
                            {uploading ? 'Uploading & Analyzing...' : (isDragging ? 'Drop video here' : 'Upload video file manually')}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">If the link is blocked, download and drop it here</p>
                    </div>
                </button>
            </div>

            {error && (
                <div className="w-full max-w-2xl bg-red-900/20 border border-red-500/50 text-red-200 p-4 rounded-xl mb-8 flex items-center gap-3">
                    <window.Icon name="alert" />
                    <div className="flex-1">{error}</div>
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
