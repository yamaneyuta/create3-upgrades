FROM ubuntu:22.04

RUN apt update && \
    apt install git curl -y && \
    \
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install nodejs -y && \
    \
    LAZYGIT_VERSION=$(curl -s "https://api.github.com/repos/jesseduffield/lazygit/releases/latest" | grep -Po '"tag_name": "v\K[^"]*') && \
    curl -Lo lazygit.tar.gz "https://github.com/jesseduffield/lazygit/releases/latest/download/lazygit_${LAZYGIT_VERSION}_Linux_x86_64.tar.gz" && \
    tar xf lazygit.tar.gz lazygit && \
    install lazygit /usr/local/bin && \
    rm -rf lazygit* && \
    \
    apt clean && rm -rf /var/lib/apt/lists/*
