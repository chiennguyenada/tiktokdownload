const Loader = () => {
    // Keep Alive Hack: Play silent audio to prevent browser throttling background tab
    React.useEffect(() => {
        const audio = new Audio('https://raw.githubusercontent.com/anars/blank-audio/master/1-second-of-silence.mp3');
        audio.loop = true;
        audio.play().catch(e => console.log("Audio autoplay prevented:", e));

        return () => {
            audio.pause();
            audio.src = "";
        };
    }, []);

    return (
        <div className="flex flex-col items-center justify-center p-8 space-y-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 animate-pulse">Analyzing video content...</p>
            <p className="text-xs text-gray-500">(Keeping tab alive...)</p>
        </div>
    );
};

window.Loader = Loader;
