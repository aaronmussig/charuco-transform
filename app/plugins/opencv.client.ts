interface OpenCVModule {
    onRuntimeInitialized?: () => void;

    [key: string]: any;
}

declare global {
    interface Window {
        Module: OpenCVModule;
        cv: any;
    }
}


export default defineNuxtPlugin((nuxtApp) => {
    const isReady = useState('cv-ready', () => false)
    const scriptId = 'opencv-js-script';

    // 1. Define the global Module object before the script loads
    window.Module = {
        onRuntimeInitialized: () => {
            isReady.value = true
            console.log('OpenCV.js is fully initialized')
        }
    }

    if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = '/charuco-transform/lib/opencv-4.13.0.js';
        script.async = true;
        script.type = 'text/javascript';

        script.onerror = () => {
            console.error('Failed to load OpenCV.js script file');
        };

        document.head.appendChild(script);
    } else {
        // If the script already exists and OpenCV is already loaded from a previous HMR cycle
        if (window.cv && window.cv.onRuntimeInitialized) {
            isReady.value = true;
        }
    }

    // Provide a helper to check status globally
    return {
        provide: {
            cvReady: isReady
        }
    }
})
