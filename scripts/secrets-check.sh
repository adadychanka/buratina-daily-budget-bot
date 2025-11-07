#!/bin/bash
# Check if git-secrets is installed

if ! git secrets --list >/dev/null 2>&1; then
  echo "Error: git-secrets is not installed. Please install it first:"
  echo "git clone https://github.com/awslabs/git-secrets.git && cd git-secrets && sudo make install"
  exit 1
fi

