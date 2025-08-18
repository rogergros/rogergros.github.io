// Image Zoom Functionality
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
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const modalCaption = document.querySelector('.modal-caption');
    const closeBtn = document.querySelector('.modal-close');
    
    // Variables for zoom functionality
    let currentScale = 1;
    let isDragging = false;
    let startX, startY, translateX = 0, translateY = 0;
    let lastDistance = 0;
    
    // Get all zoomable images
    const zoomableImages = document.querySelectorAll('[data-zoomable]');
    
    // Add click event to all zoomable images
    zoomableImages.forEach(img => {
        img.addEventListener('click', function() {
            openModal(this.src, this.alt);
        });
    });
    
    // Close modal when clicking the close button
    closeBtn.addEventListener('click', closeModal);
    
    // Close modal when clicking outside the image
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            closeModal();
        }
    });
    
    // Touch events for mobile zoom
    let touchStartX = 0;
    let touchStartY = 0;
    let initialPinchDistance = 0;
    
    modalImg.addEventListener('touchstart', handleTouchStart, { passive: false });
    modalImg.addEventListener('touchmove', handleTouchMove, { passive: false });
    modalImg.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    // Mouse events for desktop zoom
    modalImg.addEventListener('wheel', handleWheel, { passive: false });
    modalImg.addEventListener('mousedown', handleMouseDown);
    modalImg.addEventListener('mousemove', handleMouseMove);
    modalImg.addEventListener('mouseup', handleMouseUp);
    modalImg.addEventListener('mouseleave', handleMouseUp);
    
    function openModal(src, alt) {
        modal.style.display = 'block';
        modalImg.src = src;
        modalImg.alt = alt;
        
        // Reset zoom and position
        currentScale = 1;
        translateX = 0;
        translateY = 0;
        updateImageTransform();
        
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
    }
    
    function closeModal() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    function updateImageTransform() {
        modalImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentScale})`;
    }
    
    function handleTouchStart(e) {
        e.preventDefault();
        const touches = e.touches;
        
        if (touches.length === 1) {
            // Single touch - start dragging
            isDragging = true;
            touchStartX = touches[0].clientX - translateX;
            touchStartY = touches[0].clientY - translateY;
        } else if (touches.length === 2) {
            // Two touches - start pinch
            isDragging = false;
            initialPinchDistance = getDistance(touches[0], touches[1]);
        }
    }
    
    function handleTouchMove(e) {
        e.preventDefault();
        const touches = e.touches;
        
        if (touches.length === 1 && isDragging) {
            // Single touch - continue dragging
            translateX = touches[0].clientX - touchStartX;
            translateY = touches[0].clientY - touchStartY;
            updateImageTransform();
        } else if (touches.length === 2) {
            // Two touches - pinch to zoom
            const currentDistance = getDistance(touches[0], touches[1]);
            const scale = currentDistance / initialPinchDistance;
            
            // Limit zoom between 0.5x and 3x
            const newScale = Math.max(0.5, Math.min(3, currentScale * scale));
            currentScale = newScale;
            
            initialPinchDistance = currentDistance;
            updateImageTransform();
        }
    }
    
    function handleTouchEnd(e) {
        isDragging = false;
    }
    
    function handleWheel(e) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = Math.max(0.5, Math.min(3, currentScale * delta));
        currentScale = newScale;
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
        updateImageTransform();
    });
    
    // Add grab cursor to modal image
    modalImg.style.cursor = 'grab';
});
