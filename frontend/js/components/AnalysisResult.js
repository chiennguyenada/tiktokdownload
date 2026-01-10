const AnalysisResult = ({ data }) => {
    if (!data) return null;

    const { verdict, claims, summary } = data;

    const getVerdictColor = (v) => {
        const lower = v?.toLowerCase() || '';
        if (lower.includes('fact') || lower.includes('true')) return 'text-green-400 border-green-400 bg-green-400/10';
        if (lower.includes('fiction') || lower.includes('false') || lower.includes('fake')) return 'text-red-400 border-red-400 bg-red-400/10';
        return 'text-yellow-400 border-yellow-400 bg-yellow-400/10';
    };

    return (
        <div className="w-full max-w-3xl mx-auto space-y-6 animate-fade-in-up">
            {/* Verdict Header */}
            <div className={`p-6 rounded-xl border ${getVerdictColor(verdict)} flex items-center justify-between`}>
                <div>
                    <h2 className="text-sm uppercase tracking-wider opacity-75">Overall Verdict</h2>
                    <p className="text-3xl font-bold">{verdict}</p>
                </div>
                {verdict.toLowerCase().includes('fact') ? <window.Icon name="check" size={40} /> :
                    verdict.toLowerCase().includes('fiction') ? <window.Icon name="x" size={40} /> :
                        <window.Icon name="alert" size={40} />}
            </div>

            {/* Summary */}
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold mb-3 text-white">Summary</h3>
                <p className="text-gray-300 leading-relaxed">{summary}</p>
            </div>

            {/* Claims List */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white px-2">Detailed Claims</h3>
                {claims.map((claim, idx) => (
                    <div key={idx} className="bg-gray-800 p-5 rounded-xl border border-gray-700 hover:border-blue-500/50 transition-colors">
                        <div className="flex items-start gap-4">
                            <div className="mt-1">
                                {claim.status?.toLowerCase().includes('true') ? <window.Icon name="check" className="text-green-400" /> :
                                    claim.status?.toLowerCase().includes('false') ? <window.Icon name="x" className="text-red-400" /> :
                                        <window.Icon name="alert" className="text-yellow-400" />}
                            </div>
                            <div>
                                <h4 className="font-medium text-white text-lg mb-2">{claim.claim}</h4>
                                <p className="text-sm text-gray-400 bg-gray-900/50 p-3 rounded-lg">
                                    <span className="font-semibold text-blue-400 block mb-1">Verification:</span>
                                    {claim.verification}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

window.AnalysisResult = AnalysisResult;
