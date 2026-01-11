const AnalysisResult = ({ data }) => {
    if (!data) return null;

    const { verdict, claims, summary } = data;

    return (
        <div className="w-full max-w-3xl mx-auto space-y-6 animate-fade-in-up">
            {/* Summary */}
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold mb-3 text-white">Summary</h3>
                <p className="text-gray-300 leading-relaxed">{summary}</p>
            </div>

            {/* Audio Script */}
            {data.transcript && (
                <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <span className="text-2xl">🗣️</span> Audio script
                    </h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                        {data.transcript.map((item, idx) => (
                            <div key={idx} className="flex gap-4 text-sm hover:bg-gray-800/50 p-2 rounded transition-colors">
                                <span className="font-mono text-blue-400 font-bold min-w-[3rem]">{item.time}</span>
                                <p className="text-gray-300">{item.content}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

window.AnalysisResult = AnalysisResult;
