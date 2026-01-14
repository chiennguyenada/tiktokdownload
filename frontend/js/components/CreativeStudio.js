const CreativeStudio = ({ originalScript, initialRewrittenScript, initialCustomPrompt, onUpdate }) => {
    // State initialization from props (for persistence)
    const [similarity, setSimilarity] = React.useState(85);
    const [rewrittenScript, setRewrittenScript] = React.useState(initialRewrittenScript || '');
    const [customPrompt, setCustomPrompt] = React.useState(initialCustomPrompt || '');
    const [model, setModel] = React.useState('gemini-2.0-flash-exp'); // Default to "3.0" (newest)

    // UI States
    const [isRewriting, setIsRewriting] = React.useState(false);
    const [showKeyPopup, setShowKeyPopup] = React.useState(false);
    const [tempKey, setTempKey] = React.useState('');

    // Refs for synchronized scrolling
    const originalRef = React.useRef(null);
    const rewrittenRef = React.useRef(null);
    const isScrolling = React.useRef(false);

    // Auto-save effect: Notify parent (App.js) whenever important state changes
    React.useEffect(() => {
        if (onUpdate) {
            onUpdate({
                rewritten_script: rewrittenScript,
                custom_prompt: customPrompt
            });
        }
    }, [rewrittenScript, customPrompt]);

    // Helper: Calculate properties
    const getWordCount = (text) => text ? text.trim().split(/\s+/).length : 0;
    const originalWordCount = React.useMemo(() => getWordCount(originalScript), [originalScript]);
    const rewrittenWordCount = React.useMemo(() => getWordCount(rewrittenScript), [rewrittenScript]);

    // Synchronized Scrolling Logic
    const handleScroll = (sourceRef, targetRef) => {
        if (isScrolling.current) return;
        if (!sourceRef.current || !targetRef.current) return;

        isScrolling.current = true;

        // Sync scrollTop percentage to handle different text lengths
        const percentage = sourceRef.current.scrollTop / (sourceRef.current.scrollHeight - sourceRef.current.clientHeight);
        const targetScrollTop = percentage * (targetRef.current.scrollHeight - targetRef.current.clientHeight);

        targetRef.current.scrollTop = targetScrollTop;

        // Debounce reset to avoid loop
        setTimeout(() => {
            isScrolling.current = false;
        }, 50);
    };

    const executeRewrite = async (apiKey, promptOverride) => {
        setIsRewriting(true);
        try {
            // Default styling if user provides none
            const defaultStyle = "hãy viết lại voice script trên với độ khác 15%, giữ lại 85% ý nghĩa của toàn bộ script. nhân xưng là ông nếu có, viết cho người xa lạ nhưng đầy cảm xúc, đúng phong cách và kiến thức tử vi";
            const instruction = customPrompt.trim() || defaultStyle;

            // Updated Prompt Logic for Content Preservation
            const finalPrompt = `
            You are a professional content editor.Your task is to rewrite the video script below.

            ORIGINAL SCRIPT:
"${originalScript}"

            USER INSTRUCTIONS(Priority):
"${instruction}"

            CRITICAL CONSTRAINTS:
1. ** Content Preservation(MANDATORY) **: You must preserve 100 % of the key ideas and facts.If the original has 5 main points, the rewrite MUST have the same 5 points.Do NOT summarize or cut content.
            2. ** Similarity Setting(${similarity} %) **: This controls the * style * and * phrasing * deviation, not the content.
               - 100 %: Identical phrasing.Only fix typos.
               - 80 %: Slight rephrasing for flow.
               - 0 %: Completely new vocabulary and sentence structure, but SAME meaning and facts.
            3. ** Formatting **: Return raw JSON.

            Return JSON structure:
{
    "rewritten_script": "The new script text...",
        "changes_made": "Brief summary of stylistic changes",
            "similarity_score": ${similarity}
}
`;

            // Model Selection Logic
            // "Gemini 3.0" -> gemini-2.0-flash-exp (Latest experimental)
            // "Gemini 2.5" -> gemini-1.5-pro (Stable high-intellect)
            const modelName = model;
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: finalPrompt }] }],
                    generationConfig: {
                        responseMimeType: "application/json",
                        maxOutputTokens: 8192
                    }
                })
            });

            if (!response.ok) throw new Error(`Rewrite failed (${response.statusText}). Check API Key.`);

            const data = await response.json();
            const result = JSON.parse(data.candidates[0].content.parts[0].text);

            setRewrittenScript(result.rewritten_script);
        } catch (error) {
            console.error(error);
            alert('Failed: ' + error.message);
        } finally {
            setIsRewriting(false);
        }
    };

    const handleRewrite = () => {
        const apiKey = localStorage.getItem('GEMINI_API_KEY');
        if (!apiKey) {
            setShowKeyPopup(true);
            return;
        }
        executeRewrite(apiKey);
    };

    const saveKeyAndContinue = () => {
        if (tempKey) {
            localStorage.setItem('GEMINI_API_KEY', tempKey);
            setShowKeyPopup(false);
            executeRewrite(tempKey);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(rewrittenScript);
        alert('Copied to clipboard!');
    };

    return (
        <div className="bg-gray-900/80 rounded-xl border border-blue-500/30 overflow-hidden mt-8 shadow-2xl backdrop-blur-sm">
            {/* Header / Toolbar */}
            <div className="bg-gray-800/90 p-5 border-b border-gray-700 space-y-4">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg border border-blue-500/30">
                            <window.Icon name="sparkles" className="text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                                Creative Studio
                            </h3>
                            <div className="flex items-center gap-2">
                                <p className="text-xs text-gray-500">AI-powered Script Editor</p>
                                {/* Model Selector Badge */}
                                <select
                                    className="bg-gray-900 border border-gray-700 text-[10px] text-gray-300 rounded px-1 py-0.5 focus:outline-none focus:border-blue-500"
                                    value={model}
                                    onChange={(e) => setModel(e.target.value)}
                                >
                                    <option value="gemini-2.0-flash-exp">Gemini 3.0 (Fast & Smart)</option>
                                    <option value="gemini-1.5-pro">Gemini 2.5 (High Precision)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="flex-1 md:flex-none flex items-center gap-2 bg-gray-900/50 px-3 py-2 rounded-lg border border-gray-700/50">
                            <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Similarity</span>
                            <input
                                type="range"
                                min="0" max="100"
                                value={similarity}
                                onChange={(e) => setSimilarity(e.target.value)}
                                className="w-24 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                            <span className="text-blue-400 font-mono font-bold text-sm w-9 text-right">{similarity}%</span>
                        </div>

                        <button
                            onClick={handleRewrite}
                            disabled={isRewriting}
                            className={`
                                relative group overflow-hidden px-5 py-2.5 rounded-lg font-semibold text-white shadow-lg transition-all
                                ${isRewriting ? 'bg-gray-700 cursor-wait' : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 active:scale-95'}
                            `}
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                {isRewriting ? (
                                    <>
                                        <window.Icon name="loader" className="animate-spin" size={18} />
                                        <span>Rewriting...</span>
                                    </>
                                ) : (
                                    <>
                                        <window.Icon name="sparkles" size={18} />
                                        <span>Rewrite</span>
                                    </>
                                )}
                            </span>
                            {!isRewriting && <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>}
                        </button>

                        {rewrittenScript && (
                            <button
                                onClick={handleCopy}
                                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2.5 rounded-lg font-semibold transition-all active:scale-95 border border-gray-600"
                            >
                                <window.Icon name="copy" size={18} />
                                <span className="hidden sm:inline">Copy Script</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Custom Prompt Input */}
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <window.Icon name="edit" size={14} className="text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                    </div>
                    <input
                        type="text"
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        placeholder="Mặc định: hãy viết lại với độ khác 15%, nhân xưng là ông..."
                        className="w-full bg-gray-900/50 border border-gray-700 rounded-lg py-2.5 pl-9 pr-4 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                    />
                </div>
            </div>

            {/* Split View */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-700 h-[600px]">
                {/* Original Column */}
                <div className="flex flex-col bg-gray-900/30 overflow-hidden">
                    <div className="p-3 bg-gray-800/50 border-b border-gray-700/50 flex justify-between items-center shrink-0">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-gray-600"></span>
                            Original Script
                        </h4>
                        <span className="text-xs font-mono text-gray-500 bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
                            {originalWordCount} words
                        </span>
                    </div>
                    <div className="flex-1 p-6 overflow-y-auto custom-scrollbar"
                        ref={originalRef}
                        onScroll={() => handleScroll(originalRef, rewrittenRef)}
                    >
                        <div className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap select-text">
                            {originalScript}
                        </div>
                    </div>
                </div>

                {/* Rewritten Column */}
                <div className="flex flex-col bg-gray-900/50 overflow-hidden">
                    <div className="p-3 bg-gray-800/50 border-b border-gray-700/50 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${rewrittenScript ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-gray-600'}`}></span>
                                Rewritten Script
                            </h4>
                            {rewrittenScript && <span className="text-[10px] text-green-400 bg-green-900/20 px-1.5 py-0.5 rounded border border-green-900/30 flex items-center gap-1">
                                <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></span> Saved
                            </span>}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-gray-500 bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
                                {rewrittenWordCount} words
                            </span>
                            {rewrittenScript && (
                                <button onClick={handleCopy} className="text-gray-400 hover:text-white transition-colors p-1" title="Copy">
                                    <window.Icon name="copy" size={14} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 relative group">
                        {rewrittenScript ? (
                            <textarea
                                className="w-full h-full bg-transparent p-6 text-gray-200 text-sm leading-relaxed focus:outline-none resize-none custom-scrollbar font-sans"
                                value={rewrittenScript}
                                onChange={(e) => setRewrittenScript(e.target.value)}
                                spellCheck="false"
                                ref={rewrittenRef}
                                onScroll={() => handleScroll(rewrittenRef, originalRef)}
                            />
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600 p-8 text-center space-y-4">
                                <div className="w-16 h-16 rounded-full bg-gray-800/50 flex items-center justify-center border border-gray-700/50 group-hover:border-blue-500/30 transition-colors">
                                    <window.Icon name="sparkles" size={24} className="opacity-20 group-hover:opacity-50 transition-opacity" />
                                </div>
                                <p className="text-sm italic">
                                    Ready to create? Adjust settings above and click <span className="text-blue-400 font-semibold">Rewrite Script</span>
                                </p>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Video Generation Section */}
            {rewrittenScript && (
                <div className="p-8 border-t border-gray-700/50 bg-gray-800/40 animate-fade-in-up">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                        <div className="flex-1 text-center lg:text-left">
                            <h4 className="text-lg font-bold text-white mb-2 flex items-center justify-center lg:justify-start gap-3">
                                <span className="p-2 bg-indigo-500/20 rounded-lg">🎥</span>
                                Next Step: Video Production
                            </h4>
                            <p className="text-sm text-gray-400 max-w-2xl">
                                Your script is polished and ready for the world. You can now use <span className="text-indigo-400 font-semibold">HeyGen</span> AI to generate a video with a realistic avatar speaking this script.
                            </p>
                        </div>
                        <div className="shrink-0 w-full lg:w-auto">
                            <button className="w-full lg:w-auto relative group overflow-hidden flex items-center justify-center gap-4 bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-900/40 active:scale-95 border border-indigo-400/20">
                                <span className="text-2xl filter grayscale group-hover:grayscale-0 transition-all transform group-hover:scale-110 duration-300">🎥</span>
                                <div className="flex flex-col items-start px-1 text-left">
                                    <span className="text-[10px] opacity-80 font-normal uppercase tracking-wider">Generate with</span>
                                    <span className="text-lg">HeyGen AI Video</span>
                                </div>
                                <div className="bg-white/10 px-2 py-1 rounded-md text-[9px] border border-white/20 uppercase tracking-widest h-fit">
                                    Soon
                                </div>
                                <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Key Popup Modal */}
            {showKeyPopup && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] animate-fade-in backdrop-blur-sm p-4">
                    <div className="bg-gray-800 border border-gray-700 p-6 rounded-xl w-full max-w-md shadow-2xl scale-100 transform transition-all ring-1 ring-white/10">
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
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 mb-4 outline-none transition-all"
                            value={tempKey}
                            onChange={(e) => setTempKey(e.target.value)}
                        />

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowKeyPopup(false)}
                                className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveKeyAndContinue}
                                disabled={!tempKey}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20"
                            >
                                Save & Continue
                            </button>
                        </div>

                        <p className="mt-4 text-center text-xs text-gray-500 hover:text-gray-400 transition-colors">
                            <a href="https://aistudio.google.com/app/apikey" target="_blank" className="inline-flex items-center gap-1 hover:underline">
                                Get a free key here <window.Icon name="externalLink" size={10} />
                            </a>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

window.CreativeStudio = CreativeStudio;
