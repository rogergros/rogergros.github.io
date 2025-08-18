#!/bin/bash

# Script to generate placeholder test images for the image gallery demo
# This creates simple colored rectangles with text for testing purposes

# Create the posts directory if it doesn't exist
mkdir -p assets/images/posts

# Function to create a placeholder image
create_placeholder() {
    local filename=$1
    local text=$2
    local color=$3
    local width=${4:-1920}
    local height=${5:-1080}
    
    # Create a simple SVG with the specified text and color
    cat > "assets/images/posts/${filename}.svg" << EOF
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${color}"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="48" fill="white" text-anchor="middle" dominant-baseline="middle">
    ${text}
  </text>
  <text x="50%" y="70%" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle">
    ${width}x${height} - High Resolution
  </text>
</svg>
EOF

    # Convert SVG to JPG using ImageMagick if available, otherwise keep SVG
    if command -v convert &> /dev/null; then
        convert "assets/images/posts/${filename}.svg" "assets/images/posts/${filename}.jpg"
        rm "assets/images/posts/${filename}.svg"
        echo "Created assets/images/posts/${filename}.jpg"
    else
        echo "Created assets/images/posts/${filename}.svg (ImageMagick not available for JPG conversion)"
    fi
}

echo "Generating test images for the image gallery demo..."

# Create featured image (landscape)
create_placeholder "demo-featured" "Featured Image" "#2c5aa0" 1920 1080

# Create gallery images
create_placeholder "demo-1" "Landscape Photography" "#4a7c59" 1920 1080
create_placeholder "demo-2" "Street Photography" "#2c2c2c" 1080 1920
create_placeholder "demo-3" "Macro Photography" "#8b4513" 1920 1080
create_placeholder "demo-4" "Portrait Photography" "#6a5acd" 1080 1920

echo "Test images generated successfully!"
echo ""
echo "You can now:"
echo "1. Run 'bundle exec jekyll serve' to test the site"
echo "2. Visit the demo post at: http://localhost:4000/2024/12/20/image-gallery-demo.html"
echo "3. Test the zoom functionality by clicking on images"
echo "4. Try pinch-to-zoom on mobile devices"
