function wrapImages() {
    const images = document.querySelectorAll('img');

    for (const image of images) {
        wrapImage(image);
    }
}

function wrapImage(image: HTMLImageElement) {
    if (image.parentElement == null) {
        return;
    }

    // Image only website
    if (image.parentElement instanceof HTMLBodyElement && image.parentElement.childNodes.length === 1) {
        return;
    }

    // Image is already wrapped
    if (image.parentElement instanceof HTMLAnchorElement) {
        return;
    }

    // Check if the image is already wrapped multiple layers above
    // Assume the parent is the same size as the image
    let currentParent: HTMLElement | null = image.parentElement;
    while (true) {
        // Reached the top
        if (currentParent == null) {
            break;
        }

        // Different size than the image
        if (currentParent.clientWidth !== image.clientWidth || currentParent.clientHeight !== image.clientHeight) {
            break;
        }

        // Found a link that wraps the image
        if (currentParent instanceof HTMLAnchorElement) {
            return;
        }

        currentParent = currentParent.parentElement;
    }

    // Save original styles
    const computedStyle = window.getComputedStyle(image);
    const style: { [key: string]: string } = {};
    for (const key of Array.from(computedStyle)) {
        style[key] = computedStyle.getPropertyValue(key);
    }

    const wrapper = document.createElement('a');
    wrapper.href = image.src;

    image.parentElement.insertBefore(wrapper, image);
    wrapper.appendChild(image);

    // Apply styles
    for (const key of Object.keys(style)) {
        image.style.setProperty(key, style[key]);
    }
    image.style.setProperty('cursor', 'pointer');
}

function handleMutations(mutations: MutationRecord[]) {
    for (const mutation of mutations) {
        if (mutation.type !== 'childList') continue;

        for (const node of mutation.addedNodes) {
            if (node instanceof HTMLImageElement) {
                node.addEventListener('load', () => {
                    wrapImage(node);
                });
            }
        }
    }
}

wrapImages();

// Subscribe to newly added images
const observer: MutationObserver = new MutationObserver(handleMutations);
observer.observe(document.body, { childList: true, subtree: true });