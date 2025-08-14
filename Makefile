# Jekyll Development Makefile

.PHONY: run run-reload build clean

# Build the Docker image
build:
	docker build -t gros-cat .

# Run the Jekyll server
run: build
	docker run -p 4000:4000 -v $(PWD):/app gros-cat

# Run the Jekyll server with live reload
run-reload: build
	docker run -p 4000:4000 -p 35729:35729 -v $(PWD):/app gros-cat bundle exec jekyll serve --host 0.0.0.0 --port 4000 --livereload

# Clean up Docker containers and images
clean:
	docker stop $$(docker ps -q --filter ancestor=gros-cat) 2>/dev/null || true
	docker rm $$(docker ps -aq --filter ancestor=gros-cat) 2>/dev/null || true
