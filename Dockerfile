FROM ruby:3.2

# Install build dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*
# Use the official Ruby image as base
FROM ruby:3.2

# Set working directory
WORKDIR /app

# Copy Gemfile and Gemfile.lock
COPY Gemfile Gemfile.lock ./

# Install gems
RUN bundle install

# Copy the rest of the application
COPY . .

# Expose port 4000
EXPOSE 4000

# Default command (can be overridden)
CMD ["jekyll", "serve", "--host", "0.0.0.0", "--port", "4000"]
