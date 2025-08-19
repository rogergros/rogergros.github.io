---
layout: post
title: "Image Gallery Demo - High Resolution Photos with Zoom"
date: 2024-12-20 12:00:00 +0000
categories: photos
featured_image: /assets/images/posts/tuscany_4.jpg
images:
  - url: /assets/images/posts/tuscany_1.jpg
    alt: "Beautiful landscape photography"
    caption: "A stunning mountain landscape at golden hour"
    orientation: horizontal
  - url: /assets/images/posts/tuscany_2.jpg
    alt: "Urban street photography"
    caption: "Street life captured in black and white"
    orientation: vertical
  - url: /assets/images/posts/tuscany_3.jpg
    alt: "Macro photography example"
    caption: "Close-up details of natural textures"
    orientation: horizontal
  - url: /assets/images/posts/tuscany_4.jpg
    alt: "Portrait photography"
    caption: "Professional portrait with natural lighting"
    orientation: vertical
  - url: /assets/images/posts/cinque_terre_1.jpg
    alt: "Portrait photography"
    caption: "Professional portrait with natural lighting"
    orientation: vertical
---

This post demonstrates the new adaptive image gallery functionality with high-resolution photos and zoom capabilities. The gallery automatically adjusts to different image orientations and creates a beautiful masonry-style layout.

## Features

- **Adaptive layout**: Automatically detects image orientations (horizontal, vertical, square)
- **Masonry grid**: Creates a Pinterest-style layout that adapts to any number of images
- **High-resolution images**: All images are stored in `/assets/images/posts/` for easy organization
- **Featured image**: The main image appears at the top of the post and in post summaries
- **Smart sizing**: Horizontal images span 2 columns, vertical images span 2 rows
- **Zoom functionality**: Click any image to zoom in and explore details
- **Mobile-friendly**: Pinch to zoom on touch devices, responsive layout
- **Image captions**: Optional captions that appear on hover

## How to Use

1. **Add a featured image**: Set `featured_image` in the front matter
2. **Add multiple images**: Use the `images` array with `url`, `alt`, and optional `caption`
3. **Automatic orientation detection**: The system automatically detects image orientations
4. **Manual orientation override**: Optionally set `orientation: horizontal|vertical|square|large` in front matter
5. **Organize files**: Place all images in `/assets/images/posts/` folder
6. **High resolution**: Use high-quality images (recommended: 1920px width or larger)

## Technical Details

The adaptive image system includes:
- **Masonry grid layout**: Automatically adjusts to image orientations and quantities
- **Smart sizing**: Horizontal images (2x1), vertical images (1x2), square images (1x1)
- **Responsive design**: Adapts to different screen sizes and orientations
- **Touch-friendly zoom**: Pinch gestures on mobile devices
- **Keyboard navigation**: Escape to close modal
- **Smooth animations**: Hover effects and transitions
- **Performance optimized**: Efficient layout calculations

Try clicking on the images below to experience the zoom functionality!
