// Enhanced Image Gallery with iPhone Photos App-like Behavior
document.addEventListener('DOMContentLoaded', function() {
    // Auto-detect image orientations and adjust layout
    function adjustImageLayout() {
        const galleryItems = document.querySelectorAll('.gallery-item');
        
        galleryItems.forEach(item => {
            const img = item.querySelector('.gallery-image');
            if (img && img.complete) {
                const aspectRatio = img.naturalWidth / img.naturalHeight;
                let orientation = 'square';
                
                if (aspectRatio > 1.3) {
                    orientation = 'horizontal';
                } else if (aspectRatio < 0.8) {
                    orientation = 'vertical';
                }
                
                item.setAttribute('data-orientation', orientation);
                img.setAttribute('data-orientation', orientation);
            }
        });
    }
    
    // Run layout adjustment when images load
    const images = document.querySelectorAll('.gallery-image');
    images.forEach(img => {
        if (img.complete) {
            adjustImageLayout();
        } else {
            img.addEventListener('load', adjustImageLayout);
        }
    });
    
    // Run layout adjustment on window resize
    window.addEventListener('resize', adjustImageLayout);
    
    // Modal elements
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const modalCaption = document.querySelector('.modal-caption');
    const closeBtn = document.querySelector('.modal-close');
    
    // Gallery navigation
    let currentImageIndex = 0;
    let allImages = [];
    let currentScale = 1;
    let isDragging = false;
    let startX, startY, translateX = 0, translateY = 0;
    let lastDistance = 0;
    let initialScale = 1;
    
    // Touch/swipe variables
    let touchStartX = 0;
    let touchStartY = 0;
    let initialPinchDistance = 0;
    let isSwipeGesture = false;
    let swipeThreshold = 50;
    
    // Get all zoomable images and build navigation array
    function buildImageArray() {
        allImages = Array.from(document.querySelectorAll('[data-zoomable]'));
    }
    
    // Add click event to all zoomable images
    function initializeGallery() {
        buildImageArray();
        allImages.forEach((img, index) => {
            img.addEventListener('click', function() {
                currentImageIndex = index;
                openModal(this.src, this.alt, index);
            });
        });
    }
    
    // Initialize gallery
    initializeGallery();
    
    // Close modal when clicking the close button
    closeBtn.addEventListener('click', closeModal);
    
    // Close modal when clicking outside the image
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Enhanced keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (modal.style.display !== 'block') return;
        
        switch(e.key) {
            case 'Escape':
                closeModal();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                navigateImage(-1);
                break;
            case 'ArrowRight':
                e.preventDefault();
                navigateImage(1);
                break;
        }
    });
    
    // Touch events for mobile zoom and swipe
    modalImg.addEventListener('touchstart', handleTouchStart, { passive: false });
    modalImg.addEventListener('touchmove', handleTouchMove, { passive: false });
    modalImg.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    // Mouse events for desktop zoom
    modalImg.addEventListener('wheel', handleWheel, { passive: false });
    modalImg.addEventListener('mousedown', handleMouseDown);
    modalImg.addEventListener('mousemove', handleMouseMove);
    modalImg.addEventListener('mouseup', handleMouseUp);
    modalImg.addEventListener('mouseleave', handleMouseUp);
    
    function openModal(src, alt, index) {
        modal.style.display = 'block';
        modalImg.src = src;
        modalImg.alt = alt;
        currentImageIndex = index;
        
        // Reset zoom and position
        resetImageTransform();
        
        // Find and display caption if available
        const originalImg = document.querySelector(`[data-zoomable][src="${src}"]`);
        if (originalImg) {
            const caption = originalImg.closest('.gallery-item')?.querySelector('.image-caption');
            if (caption) {
                modalCaption.textContent = caption.textContent;
                modalCaption.style.display = 'block';
            } else {
                modalCaption.style.display = 'none';
            }
        }
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        // Add navigation indicators
        updateNavigationIndicators();
    }
    
    function closeModal() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        resetImageTransform();
    }
    
    function navigateImage(direction) {
        const newIndex = currentImageIndex + direction;
        
        // Don't allow navigation beyond bounds
        if (newIndex < 0 || newIndex >= allImages.length) {
            return;
        }
        
        navigateToImage(newIndex);
    }
    
    function navigateToImage(index) {
        if (index >= 0 && index < allImages.length) {
            const targetImg = allImages[index];
            currentImageIndex = index;
            openModal(targetImg.src, targetImg.alt, index);
        }
    }
    
    function updateNavigationIndicators() {
        // Navigation indicators are hidden - no need to add them
    }
    
    function resetImageTransform() {
        currentScale = 1;
        translateX = 0;
        translateY = 0;
        updateImageTransform();
    }
    
    function updateImageTransform() {
        modalImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentScale})`;
    }
    
    function updateImageTransformWithTransition() {
        modalImg.style.transition = 'transform 0.3s ease-out';
        modalImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentScale})`;
        
        // Remove transition after animation completes
        setTimeout(() => {
            modalImg.style.transition = '';
        }, 300);
    }
    
    function handleTouchStart(e) {
        e.preventDefault();
        const touches = e.touches;
        
        if (touches.length === 1) {
            // Single touch - start dragging or swipe detection
            isDragging = true;
            isSwipeGesture = false;
            touchStartX = touches[0].clientX;
            touchStartY = touches[0].clientY;
            startX = touches[0].clientX - translateX;
            startY = touches[0].clientY - translateY;
        } else if (touches.length === 2) {
            // Two touches - start pinch
            isDragging = false;
            isSwipeGesture = false;
            initialPinchDistance = getDistance(touches[0], touches[1]);
            initialScale = currentScale;
        }
    }
    
    function handleTouchMove(e) {
        e.preventDefault();
        const touches = e.touches;
        
        if (touches.length === 1 && isDragging) {
            const currentX = touches[0].clientX;
            const currentY = touches[0].clientY;
            const deltaX = currentX - touchStartX;
            const deltaY = currentY - touchStartY;
            
            // Determine if this is a swipe gesture (horizontal movement > vertical)
            if (!isSwipeGesture && Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > swipeThreshold) {
                isSwipeGesture = true;
                isDragging = false;
            }
            
            if (isSwipeGesture) {
                // Handle swipe navigation
                if (Math.abs(deltaX) > swipeThreshold) {
                    if (deltaX > 0) {
                        navigateImage(-1); // Swipe right = previous
                    } else {
                        navigateImage(1); // Swipe left = next
                    }
                    return;
                }
            } else {
                // Handle image dragging
                translateX = currentX - startX;
                translateY = currentY - startY;
                updateImageTransform();
            }
        } else if (touches.length === 2) {
            // Two touches - pinch to zoom
            const currentDistance = getDistance(touches[0], touches[1]);
            const scale = currentDistance / initialPinchDistance;
            
            // Limit zoom between 0.5x and 3x
            const newScale = Math.max(0.5, Math.min(3, initialScale * scale));
            currentScale = newScale;
            
            // If zoomed out below 1x, smoothly return to 1x
            if (currentScale < 1) {
                currentScale = 1;
                translateX = 0;
                translateY = 0;
                updateImageTransformWithTransition();
                return;
            }
            
            updateImageTransform();
        }
    }
    
    function handleTouchEnd(e) {
        isDragging = false;
        isSwipeGesture = false;
        
        // Check if image is smaller than the modal
        const imgRect = modalImg.getBoundingClientRect();
        const modalRect = modal.getBoundingClientRect();
        
        // If image is smaller than modal in both dimensions, smoothly return to center
        if (imgRect.width < modalRect.width && imgRect.height < modalRect.height) {
            translateX = 0;
            translateY = 0;
            updateImageTransformWithTransition();
            return;
        }
        
        // Otherwise, snap back to bounds if image is dragged too far
        let needsUpdate = false;
        
        // Horizontal bounds
        if (imgRect.left > modalRect.left + 50) {
            translateX -= (imgRect.left - modalRect.left - 50);
            needsUpdate = true;
        } else if (imgRect.right < modalRect.right - 50) {
            translateX += (modalRect.right - 50 - imgRect.right);
            needsUpdate = true;
        }
        
        // Vertical bounds
        if (imgRect.top > modalRect.top + 50) {
            translateY -= (imgRect.top - modalRect.top - 50);
            needsUpdate = true;
        } else if (imgRect.bottom < modalRect.bottom - 50) {
            translateY += (modalRect.bottom - 50 - imgRect.bottom);
            needsUpdate = true;
        }
        
        if (needsUpdate) {
            updateImageTransformWithTransition();
        }
    }
    
    function handleWheel(e) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = Math.max(0.5, Math.min(3, currentScale * delta));
        currentScale = newScale;
        
        // If zoomed out below 1x, smoothly return to 1x
        if (currentScale < 1) {
            currentScale = 1;
            translateX = 0;
            translateY = 0;
            updateImageTransformWithTransition();
            return;
        }
        
        updateImageTransform();
    }
    
    function handleMouseDown(e) {
        e.preventDefault();
        isDragging = true;
        startX = e.clientX - translateX;
        startY = e.clientY - translateY;
        modalImg.style.cursor = 'grabbing';
    }
    
    function handleMouseMove(e) {
        if (isDragging) {
            e.preventDefault();
            translateX = e.clientX - startX;
            translateY = e.clientY - startY;
            updateImageTransform();
        }
    }
    
    function handleMouseUp() {
        isDragging = false;
        modalImg.style.cursor = 'grab';
        
        // Check if image is smaller than the modal
        const imgRect = modalImg.getBoundingClientRect();
        const modalRect = modal.getBoundingClientRect();
        
        // If image is smaller than modal in both dimensions, smoothly return to center
        if (imgRect.width < modalRect.width && imgRect.height < modalRect.height) {
            translateX = 0;
            translateY = 0;
            updateImageTransformWithTransition();
        }
    }
    
    function getDistance(touch1, touch2) {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    // Double-click to reset zoom
    modalImg.addEventListener('dblclick', function() {
        currentScale = 1;
        translateX = 0;
        translateY = 0;
        updateImageTransformWithTransition();
    });
    
    // Add grab cursor to modal image
    modalImg.style.cursor = 'grab';
    
    // Handle dynamic content loading (for infinite scroll or AJAX)
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // Check if new images were added
                const newImages = Array.from(mutation.addedNodes).some(node => 
                    node.nodeType === 1 && node.querySelector('[data-zoomable]')
                );
                if (newImages) {
                    initializeGallery();
                }
            }
        });
    });
    
    // Start observing
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});
