import JSZip from 'jszip';

export const useProcessor = () => {

    // States
    const uploadedFiles = useState<File[]>('uploadedFiles', () => []);
    const processedFiles = useState('processedFiles', () => new Map<number, string>());

    // Computed
    const nUploadedFiles = computed(() => uploadedFiles.value.length);

    // Methods
    const resetUploadedFiles = () => {
        uploadedFiles.value = [];
        processedFiles.value.clear();
    }

    const downloadProcessedFilesAsZip = async () => {
        const zip = new JSZip();
        const folder = zip.folder("processed-images");

        if (folder == null) {
            console.error("Failed to create folder in ZIP");
            return;
        }

        // Create an array of promises to fetch all blobs in parallel
        const fetchPromises = Array.from(processedFiles.value.entries()).map(async ([index, blobUrl]) => {
            try {
                const response = await fetch(blobUrl);
                const blob = await response.blob();

                // Determine extension from blob type or default to png
                const extension = blob.type.split('/')[1] || 'png';
                folder.file(`image-${index}.${extension}`, blob);
            } catch (e) {
                console.error(`Failed to fetch blob for index ${index}`, e);
            }
        });

        await Promise.all(fetchPromises);

        // Generate the ZIP file
        const content = await zip.generateAsync({ type: "blob" });

        // Trigger download using a temporary link
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = "processed_images.zip";
        link.click();

        // Cleanup
        URL.revokeObjectURL(link.href);
        // processedFiles.value.forEach((fileUrl, index) => {
        //     const fileName = `processed_file_${index + 1}.png`; // or derive from original file name
        //     zip.file(fileName, fetch(fileUrl).then(res => res.blob()));
        // });
        // const content = await zip.generateAsync({ type: "blob" });
        // const downloadLink = document.createElement("a");
        // downloadLink.href = URL.createObjectURL(content);
        // downloadLink.download = "processed_files.zip";
        // document.body.appendChild(downloadLink);
        // downloadLink.click();
        // document.body.removeChild(downloadLink);
    }

    // Watchers
    watch(uploadedFiles, () => {
        processedFiles.value.clear();
    });


    return {
        // States
        uploadedFiles,
        processedFiles,
        // Computed
        nUploadedFiles,
        // Methods
        resetUploadedFiles,
        downloadProcessedFilesAsZip,
    }
}