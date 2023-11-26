function wrapImages() {
    const images = document.querySelectorAll('img');

    for (const image of images) {
        wrapImage(image);
    }
}

function wrapImage(image) {
    if (image.parentNode === undefined) {
        return;
    }

    // Image only website
    if (image.parentNode.tagName.toLowerCase() === 'body' && image.parentNode.childNodes.length === 1) {
        return;
    }

    // Image is already wrapped
    if (image.parentNode.tagName.toLowerCase() === 'a') {
        return;
    }

    // Check if the image is already wrapped multiple layers above
    // Assume the parent is the same size as the image
    let currentParent = image.parentNode;
    while (true) {
        // Reached the top
        if (currentParent === undefined) {
            break;
        }

        // Different size than the image
        if (currentParent?.clientWidth !== image.clientWidth || currentParent?.clientHeight !== image.clientHeight) {
            break;
        }

        // Found a link that wraps the image
        if (currentParent.tagName.toLowerCase() === 'a') {
            return;
        }

        currentParent = currentParent.parentNode;
    }

    // Save original styles
    const computedStyle = window.getComputedStyle(image);
    const style = {};
    for (const key of Array.from(computedStyle)) {
        style[key] = computedStyle.getPropertyValue(key);
    }

    const wrapper = document.createElement('a');
    wrapper.href = image.src;

    image.parentNode.insertBefore(wrapper, image);
    wrapper.appendChild(image);

    // Apply styles
    for (const [key, value] of Object.entries(style)) {
        image.style.setProperty(key, value);
    }
    image.style.setProperty('cursor', 'pointer');
}

function handleMutations(mutations) {
    for (const mutation of mutations) {
        if (mutation.type !== 'childList') continue;

        for (const node of mutation.addedNodes) {
            if (node.tagName?.toLowerCase() === 'img') {
                node.addEventListener('load', () => {
                    wrapImage(node);
                });
            }
        }
    }
}

wrapImages();

// Subscribe to newly added images
const observer = new MutationObserver(handleMutations);
observer.observe(document.body, { childList: true, subtree: true });