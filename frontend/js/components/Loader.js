const Loader = () => {
    return (
        <div className="flex flex-col items-center justify-center p-8 space-y-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 animate-pulse">Analyzing video content...</p>
        </div>
    );
};

window.Loader = Loader;
