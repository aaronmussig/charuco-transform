export default defineNuxtPlugin((nuxtApp) => {
    const isReady = useState('cv-ready', () => false)

    // 1. Define the global Module object before the script loads
    window.Module = {
        onRuntimeInitialized: () => {
            isReady.value = true
            console.log('OpenCV.js is fully initialized')
        }
    }

    // 2. Create and inject the script tag
    const script = document.createElement('script')
    script.src = `/charuco-transform/lib/opencv-4.13.0.js`
    script.async = true
    script.type = 'text/javascript'

    // Handle basic loading errors
    script.onerror = () => {
        console.error('Failed to load OpenCV.js')
    }

    document.head.appendChild(script)

    // 3. Optional: Provide a helper to check status globally
    return {
        provide: {
            cvReady: isReady
        }
    }
})
