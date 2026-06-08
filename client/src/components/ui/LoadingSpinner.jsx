import Lottie from "lottie-react";
import dancing from "../../assets/dancing.json";

const Loader = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-black">
            <div className="w-52">
                <Lottie animationData={dancing} loop />
            </div>
            <p className="text-lg mt-3 animate-pulse text-gray-600 dark:text-gray-300">
                Loading your courses...
            </p>
        </div>
    );
};

export default Loader;