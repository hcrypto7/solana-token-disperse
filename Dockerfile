# Use the official Rust image as a base
FROM rust:1.77.2

# Install Solana CLI tools
RUN sh -c "$(curl -sSfL https://release.solana.com/v1.18.1/install)"

# Set PATH to include Solana binaries
ENV PATH="/root/.local/share/solana/install/active_release/bin:$PATH"


RUN npm install -g yarn

# Install Anchor CLI
RUN cargo install --git https://github.com/project-serum/anchor anchor-cli --locked



# Set the working directory in the container
WORKDIR /usr/src/anchor-program

# Copy the project files into the Docker image
COPY . .

# Build the project (this will also install Anchor dependencies)
RUN anchor build

# Expose the RPC port (optional, only if you need to communicate with a Solana node from within the container)
EXPOSE 8899

# Set the default command (optional, you might want to use the container interactively instead)
CMD ["anchor", "deploy"]
