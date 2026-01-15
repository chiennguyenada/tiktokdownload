const App = () => {
    const [page, setPage] = React.useState('home');
    const [apiKey, setApiKey] = React.useState(() => localStorage.getItem('GEMINI_API_KEY') || '');
    // Lifted state to persist results across navigation
    const [analysisResult, setAnalysisResult] = React.useState(null);

    React.useEffect(() => {
        if (apiKey) {
            localStorage.setItem('GEMINI_API_KEY', apiKey);
        } else {
            localStorage.removeItem('GEMINI_API_KEY');
        }
    }, [apiKey]);

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div
                        className="font-bold text-xl cursor-pointer hover:text-blue-400 transition-colors flex items-center gap-2"
                        onClick={() => setPage('home')}
                    >
                        <span className="text-2xl">🕵️‍♂️</span> FactCheck
                    </div>
                    <button
                        onClick={() => setPage(page === 'home' ? 'settings' : 'home')}
                        className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white"
                        title={page === 'home' ? 'Settings' : 'Back to Home'}
                    >
                        {page === 'home' ? <window.Icon name="settings" /> : <window.Icon name="arrowLeft" />}
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-4 py-8 relative">
                <div className="absolute inset-0 bg-blue-500/5 blur-[100px] -z-10 pointer-events-none rounded-full transform translate-y-20"></div>

                {page === 'home' ? (
                    <window.Home
                        apiKey={apiKey}
                        result={analysisResult}
                        setResult={setAnalysisResult}
                    />
                ) : (
                    <window.Settings apiKey={apiKey} setApiKey={setApiKey} />
                )}
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-800 py-6 text-center text-gray-600 text-sm">
                <p>&copy; 2026 TikTok Fact Checker. Powered by Gemini 2.5 Flash.</p>
            </footer>
        </div>
    );
};

window.App = App;
