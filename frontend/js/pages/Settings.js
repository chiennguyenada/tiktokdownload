const Settings = ({ apiKey, setApiKey }) => {
    // We maintain local state for inputs, initializing from localStorage or props
    const [geminiKeyInput, setGeminiKeyInput] = React.useState(localStorage.getItem('GEMINI_API_KEY') || '');
    const [heygenKeyInput, setHeygenKeyInput] = React.useState(localStorage.getItem('HEYGEN_API_KEY') || '');
    const [saved, setSaved] = React.useState(false);

    React.useEffect(() => {
        // Sync state if localStorage changes externally (optional but good practice)
        setGeminiKeyInput(localStorage.getItem('GEMINI_API_KEY') || '');
        setHeygenKeyInput(localStorage.getItem('HEYGEN_API_KEY') || '');
    }, []);

    const handleSave = () => {
        // Save to localStorage
        if (geminiKeyInput) {
            localStorage.setItem('GEMINI_API_KEY', geminiKeyInput);
            setApiKey(geminiKeyInput); // Update global state if needed
        } else {
            localStorage.removeItem('GEMINI_API_KEY');
            setApiKey('');
        }

        if (heygenKeyInput) {
            localStorage.setItem('HEYGEN_API_KEY', heygenKeyInput);
        } else {
            localStorage.removeItem('HEYGEN_API_KEY');
        }

        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="max-w-2xl mx-auto w-full">
            <h2 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                Settings
            </h2>

            <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 space-y-8 animate-fade-in-up">

                {/* Gemini Setup */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <window.Icon name="cpu" className="text-blue-400" size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">Gemini API Configuration</h3>
                            <p className="text-sm text-gray-400">Required for analysis and rewriting.</p>
                        </div>
                    </div>

                    <div className="relative">
                        <input
                            type="password"
                            value={geminiKeyInput}
                            onChange={(e) => setGeminiKeyInput(e.target.value)}
                            placeholder="Enter Gemini API Key (starts with AIza...)"
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg pl-4 pr-10 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all placeholder-gray-600"
                        />
                        <div className="absolute right-3 top-3 text-gray-500 pointer-events-none">
                            <window.Icon name="key" size={16} />
                        </div>
                    </div>
                    <p className="text-xs text-gray-500">
                        Don't have one? <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-blue-400 hover:underline">Get a free key here</a>.
                    </p>
                </div>

                <hr className="border-gray-700" />

                {/* HeyGen Setup */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                            <window.Icon name="video" className="text-purple-400" size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">HeyGen Configuration</h3>
                            <p className="text-sm text-gray-400">Required for AI video generation (Future).</p>
                        </div>
                    </div>

                    <div className="relative">
                        <input
                            type="password"
                            value={heygenKeyInput}
                            onChange={(e) => setHeygenKeyInput(e.target.value)}
                            placeholder="Enter HeyGen API Key (Optional)"
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg pl-4 pr-10 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all placeholder-gray-600"
                        />
                        <div className="absolute right-3 top-3 text-gray-500 pointer-events-none">
                            <window.Icon name="key" size={16} />
                        </div>
                    </div>
                    <p className="text-xs text-gray-500">
                        Create videos from your rewritten scripts. <a href="https://app.heygen.com/settings?nav=api" target="_blank" className="text-purple-400 hover:underline">Get API Key</a>.
                    </p>
                </div>

                <div className="pt-4">
                    <button
                        onClick={handleSave}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/25 active:scale-[0.98]"
                    >
                        <window.Icon name="save" size={20} />
                        Save Credentials Locally
                    </button>
                    <p className="mt-4 text-center text-xs text-gray-600">
                        <window.Icon name="shield" size={12} className="inline mr-1" />
                        Your keys are stored securely in your browser's LocalStorage and never sent to our server.
                    </p>
                </div>

                {saved && (
                    <div className="flex items-center justify-center gap-2 text-green-400 animate-fade-in bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                        <window.Icon name="check-circle" size={18} />
                        <span>Settings saved successfully!</span>
                    </div>
                )}
            </div>
        </div>
    );
};

window.Settings = Settings;
