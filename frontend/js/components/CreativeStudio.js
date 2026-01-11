const CreativeStudio = ({ originalScript }) => {
    const [similarity, setSimilarity] = React.useState(90);
    const [rewrittenScript, setRewrittenScript] = React.useState('');
    const [isRewriting, setIsRewriting] = React.useState(false);
    const [metrics, setMetrics] = React.useState(null);

    const handleRewrite = async () => {
        setIsRewriting(true);
        try {
            const apiKey = localStorage.getItem('GEMINI_API_KEY');
            if (!apiKey) {
                alert('Please enter your Gemini API Key in Settings first.');
                setIsRewriting(false);
                return;
            }

            const promptText = `
            You are a professional content editor. Your task is to rewrite the following video script.
            
            ORIGINAL SCRIPT:
            "${originalScript}"
            
            CONSTRAINTS:
            1. Similarity: The rewritten script should be approximately ${similarity}% similar to the original in terms of meaning and structure.
               - If 90-100%: Only fix spelling, grammar, and minor flow issues. Be very conservative.
               - If < 90%: You can rephrase sentences, improve vocabulary, and make it more engaging, but you MUST preserve the core information and facts.
            2. Fact-Checking: Ensure all factual claims in the rewritten version are accurate based on the original context. Correct any obvious hallucinations.
            3. Formatting: Return the result as a raw JSON object.
            
            Return JSON structure:
            {
                "rewritten_script": "The new script text...",
                "changes_made": "Brief summary of what was changed (e.g., 'Fixed typos', 'Rephrased intro')",
                "similarity_score": ${similarity}
            }
            `;

            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: promptText }]
                    }],
                    generationConfig: {
                        responseMimeType: "application/json"
                    }
                })
            });

            if (!response.ok) throw new Error('Rewrite failed: ' + response.statusText);

            const data = await response.json();
            const result = JSON.parse(data.candidates[0].content.parts[0].text);

            setRewrittenScript(result.rewritten_script);
        } catch (error) {
            console.error(error);
            alert('Failed to rewrite script: ' + error.message);
        } finally {
            setIsRewriting(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(rewrittenScript);
        alert('Copied to clipboard!');
    };

    return (
        <div className="bg-gray-900/80 rounded-xl border border-blue-500/30 overflow-hidden mt-8">
            {/* Header / Toolbar */}
            <div className="bg-gray-800/80 p-4 border-b border-gray-700 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">✨</span>
                    <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                        Creative Studio
                    </h3>
                </div>

                <div className="flex items-center gap-4 bg-gray-900/50 px-4 py-2 rounded-lg border border-gray-700">
                    <label className="text-sm text-gray-400">Độ giống (Similarity):</label>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={similarity}
                        onChange={(e) => setSimilarity(e.target.value)}
                        className="w-32 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <span className="text-blue-400 font-mono font-bold w-12">{similarity}%</span>
                </div>

                <button
                    onClick={handleRewrite}
                    disabled={isRewriting}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-2 rounded-lg font-semibold transition-all disabled:opacity-50"
                >
                    {isRewriting ? <window.Icon name="loader" className="animate-spin" /> : <window.Icon name="sparkles" />}
                    {isRewriting ? 'Rewriting...' : 'Rewrite Script'}
                </button>
            </div>

            {/* Split View */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-700">
                {/* Original Column */}
                <div className="p-6 bg-gray-900/30">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Original Script</h4>
                    </div>
                    <div className="text-gray-400 text-sm leading-relaxed h-[400px] overflow-y-auto pr-2 custom-scrollbar whitespace-pre-wrap">
                        {originalScript}
                    </div>
                </div>

                {/* Rewritten Column */}
                <div className="p-6 bg-gray-900/50">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Rewritten Script</h4>
                        {rewrittenScript && (
                            <button onClick={handleCopy} className="text-gray-400 hover:text-white transition-colors" title="Copy">
                                <window.Icon name="copy" size={16} />
                            </button>
                        )}
                    </div>
                    {rewrittenScript ? (
                        <textarea
                            className="w-full h-[400px] bg-transparent text-gray-200 text-sm leading-relaxed focus:outline-none resize-none custom-scrollbar"
                            value={rewrittenScript}
                            onChange={(e) => setRewrittenScript(e.target.value)}
                        />
                    ) : (
                        <div className="h-[400px] flex items-center justify-center text-gray-600 italic">
                            Video script will appear here after rewriting...
                        </div>
                    )}

                    {/* HeyGen Button */}
                    {rewrittenScript && (
                        <div className="mt-4 pt-4 border-t border-gray-700/50 flex justify-end">
                            <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-colors opacity-75 hover:opacity-100">
                                <span className="text-xl">🎥</span>
                                Create Video with HeyGen (Coming Soon)
                            </button>
                        </div>
                    )}
                </div>
            </div>
            {/* Key Popup Modal */}
            {showKeyPopup && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in p-4">
                    <div className="bg-gray-800 border border-gray-700 p-6 rounded-xl w-full max-w-md shadow-2xl scale-100 transform transition-all">
                        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                            <window.Icon name="key" className="text-yellow-400" />
                            Enter Gemini API Key
                        </h3>
                        <p className="text-gray-400 text-sm mb-4">
                            To use the Rewrite feature, you need to provide your own Google Gemini API Key. It will be stored securely in your browser.
                        </p>

                        <input
                            type="password"
                            placeholder="Paste your key here (AIza...)"
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 mb-4"
                            value={tempKey}
                            onChange={(e) => setTempKey(e.target.value)}
                        />

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowKeyPopup(false)}
                                className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveKeyAndContinue}
                                disabled={!tempKey}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Save & Continue
                            </button>
                        </div>

                        <p className="mt-4 text-center text-xs text-gray-500">
                            <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-blue-400 hover:underline">Get a free key here</a>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

window.CreativeStudio = CreativeStudio;
