const MOUSE_BUTTON = {
    LEFT: 0,
    MIDDLE: 1,
    RIGHT: 2,
    BACK: 3,
    FORWARD: 4
};

// Keep checking the parent elements until the size is different.
// However, e.g. a 5x5 image can be inside of a 6x6 button, which is realistically still part of the same shit.
const PARENT_SIZE_THRESHOLD_PERCENT = 5;

function shouldImageBeClickable(image: HTMLImageElement): boolean {
    if (image.parentElement == null) {
        return false;
    }

    // Image only website
    if (image.parentElement instanceof HTMLBodyElement && image.parentElement.childNodes.length === 1) {
        return false;
    }

    // Image is already pointing to a link
    if (image.parentElement instanceof HTMLAnchorElement) {
        return false;
    }

    // Button probably has an action?
    if (image.parentElement instanceof HTMLButtonElement) {
        return false;
    }

    // Check if the image is already pointing to a link multiple layers above
    // Assume the parent is the same size as the image
    let currentParent: HTMLElement | null = image.parentElement;
    while (true) {
        // Reached the top
        if (currentParent == null) {
            break;
        }

        // Different size than the image
        if (Math.abs(currentParent.clientWidth - image.clientWidth) > currentParent.clientWidth * PARENT_SIZE_THRESHOLD_PERCENT ||
            Math.abs(currentParent.clientHeight - image.clientHeight) > currentParent.clientWidth * PARENT_SIZE_THRESHOLD_PERCENT) {
            break;
        }

        // Found anchor -> do not change
        if (currentParent instanceof HTMLAnchorElement) {
            return false;
        }

        if (currentParent instanceof HTMLButtonElement) {
            return false;
        }

        currentParent = currentParent.parentElement;
    }

    return true;
}

function updateImages() {
    const images = document.querySelectorAll('img');

    for (const image of images) {
        updateImage(image);
    }
}

function updateImage(image: HTMLImageElement) {
    if (!shouldImageBeClickable(image)) {
        return;
    }

    image.onclick = (event: MouseEvent) => {
        window.open(image.src, '_self');
    };

    image.onmousedown = (event: MouseEvent) => {
        if (event.button === MOUSE_BUTTON.MIDDLE) {
            event.preventDefault();
        }
    };

    image.onauxclick = (event: MouseEvent) => {
        if (event.button === MOUSE_BUTTON.MIDDLE) {
            window.open(image.src);
        }
    };

    image.style.cursor = 'pointer';
}

function handleMutations(mutations: MutationRecord[]) {
    for (const mutation of mutations) {
        if (mutation.type !== 'childList') continue;

        for (const node of mutation.addedNodes) {
            if (node instanceof HTMLImageElement) {
                node.addEventListener('load', () => {
                    updateImage(node);
                });
            }
        }
    }
}

updateImages();

// Subscribe to newly added images
const observer: MutationObserver = new MutationObserver(handleMutations);
observer.observe(document.body, { childList: true, subtree: true });