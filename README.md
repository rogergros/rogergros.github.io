# Jekyll Site

A basic Jekyll site compatible with GitHub Pages.

## Development

### Using Makefile (Recommended)

For easy development, use the provided Makefile commands:

1. **Run the server**
   ```bash
   make run
   ```

2. **Run with live reload**
   ```bash
   make run-reload
   ```

3. **Clean up containers**
   ```bash
   make clean
   ```

The site will be available at `http://localhost:4000`

### Manual Docker Commands

If you prefer to run Docker commands directly:

1. **Build the Docker image**
   ```bash
   docker build -t gros-cat .
   ```

2. **Run the container**
   ```bash
   docker run -p 4000:4000 -v $(pwd):/app gros-cat
   ```

3. **Run with live reload**
   ```bash
   docker run -p 4000:4000 -p 35729:35729 -v $(pwd):/app gros-cat bundle exec jekyll serve --host 0.0.0.0 --port 4000 --livereload
   ```

**Note**: The `-v $(pwd):/app` flag mounts your current directory to the container, so changes to your files will be reflected in real-time.

## Project Structure

- `_config.yml` - Jekyll configuration
- `index.md` - Homepage
- `about.md` - About page
- `_posts/` - Blog posts directory
- `Gemfile` - Ruby dependencies

## Customization

1. Edit `_config.yml` to change site settings
2. Modify `index.md` for homepage content
3. Add new pages in the root directory
4. Create blog posts in `_posts/` directory (use the format: `YYYY-MM-DD-title.md`)

>  Hosted by [Github pages](https://pages.github.com "Websites for you and your projects.")
