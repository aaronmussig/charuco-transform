export const useOpenCV = () => {
    const isReady = useState('cv-ready')

    const getCv = () => {
        if (import.meta.client && isReady.value) {
            return (window as any).cv
        }
        return null
    }

    return {
        isReady: readonly(isReady),
        cv: getCv
    }
}