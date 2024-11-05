export const isValidURL = (url) => {
    // Add protocol if missing
    let processedUrl = url.trim();
    if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
        processedUrl = 'https://' + processedUrl;
    }

    // Basic pattern for URLs
    const urlPattern = /^(?:https?:\/\/)?(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&//=]*)$/;

    // First check with regex pattern
    if (!urlPattern.test(processedUrl)) {
        return false;
    }

    // Then try URL constructor for additional validation
    try {
        new URL(processedUrl);
        return true;
    } catch (error) {
        return false;
    }
};