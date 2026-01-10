const Settings = ({ apiKey, setApiKey }) => {
    const [keyInput, setKeyInput] = React.useState(apiKey || '');
    const [saved, setSaved] = React.useState(false);

    const handleSave = () => {
        setApiKey(keyInput);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="max-w-2xl mx-auto w-full">
            <h2 className="text-3xl font-bold mb-8">Settings</h2>

            <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Gemini API Key</label>
                    <input
                        type="password"
                        value={keyInput}
                        onChange={(e) => setKeyInput(e.target.value)}
                        placeholder="Leave empty to use server default"
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    />
                    <p className="mt-2 text-xs text-gray-500">
                        Enter your personal API Key to override the default. Keys are stored locally in your browser.
                    </p>
                </div>

                <button
                    onClick={handleSave}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                    <window.Icon name="check" size={20} />
                    Save Settings
                </button>

                {saved && (
                    <div className="text-center text-green-400 animate-fade-in">
                        Settings saved successfully!
                    </div>
                )}
            </div>
        </div>
    );
};

window.Settings = Settings;
