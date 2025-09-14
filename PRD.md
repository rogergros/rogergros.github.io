# Product Requirements Document: Roger Gros Personal Blog

A simple personal Jekyll-powered blog featuring content on management, photography and personal topics with a focus on clean design, responsive layout and enhanced image viewing experiences and hosted free on Github pages (https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll/creating-a-github-pages-site-with-jekyll).

## Goal
- Provide a platform for sharing insights on management, photography and personal experiences
- Deliver an exceptional, minimal and clean reading experience across all devices
- Made the reading totally compatible with reader modes
- Showcase photography work with professional and clean gallery features
- Maintain fast loading times and SEO optimization

## Success Metrics
- Page load time < 3 seconds
- Mobile-responsive design (100% mobile compatibility)
- Image gallery engagement (zoom/navigation usage)
- SEO score > 90 (Lighthouse)
- Clean, minimalistic and modern experience

## Target Audience

**Primary:** Technology professionals, photography enthusiasts and friends
**Secondary:** General readers interested in leadership, photography or people wanting to know mroe about me

## Features

### Content Management
- **Blog Posts:** Markdown-based posts with YAML frontmatter
- **Categories:** Management, Personal and Photos with dedicated feeds
- **Blogposts listing:** 10 posts on the main page and a page with all the archive (All posts or specific categories)
- **SEO:** Meta tags, structured data, RSS feeds

### Design & UX
- **Dark Theme:** Clean, minimalistic and professional dark color scheme with green accents (#a8d5ba)
- **Responsive Design:** Mobile-first approach with breakpoints at 480px, 768px, 1200px
- **Typography:** Clean, readable font stack with proper hierarchy
- **Navigation:** Intuitive category-based navigation

### Photography Features
- **Image Galleries:** Masonry layout with responsive columns
- **Zoom Modal:** iPhone Photos-like zoom and pan functionality
- **Touch Gestures:** Pinch-to-zoom, swipe navigation on mobile
- **Captions:** Support for image descriptions and metadata

### Performance
- **Static Generation:** Jekyll-based for fast loading
- **Image Optimization:** Responsive images with proper aspect ratios
- **Minimal JavaScript:** Vanilla JS for core interactions
- **CSS Optimization:** SCSS with variables and mixins

## User Stories

### Content Creator (You)
- "I want to write posts in Markdown with simple frontmatter"
- "I need different post types for management, personal and photography content"
- "I want to easily add image galleries to photography posts"

### Readers
- "I want to browse posts by category to find relevant content"
- "I need a fast, mobile-friendly reading experience"
- "I want to view and zoom into photography images easily"

### Mobile Users
- "I want smooth touch interactions for image viewing"
- "I need readable text and proper navigation on small screens"
- "I want fast loading times on slower connections"

## Future Considerations

### Phase 2 Enhancements
- [ ] Search functionality
- [ ] Social sharing buttons
- [ ] Related posts suggestions

### Phase 4 Interaction
- [ ] Analytics dashboard
- [ ] Comment system integration


### Technical Debt
- [ ] Image optimization pipeline
- [ ] Progressive Web App features
- [ ] Enhanced accessibility audit
- [ ] Performance monitoring

## Constraints

### Technical
- Must be GitHub Pages compatible
- No server-side processing requirements
- Minimal JavaScript for performance
- Progressive enhancement approach


## Quality Standards

### Performance
- Lighthouse score > 90
- First Contentful Paint < 1.5s
- Largest Contentful Paint < 2.5s

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Color contrast ratios > 4.5:1

### Browser Support
- Chrome/Safari/Firefox (latest 2 versions)
- Mobile Safari/Chrome (iOS 12+, Android 8+)
- Progressive enhancement for older browsers
