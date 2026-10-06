.DEFAULT_GOAL := build
.PHONY: build install clean help

PREFIX ?= $(HOME)/.local

build:
	@swift build --configuration release

install: build
	@mkdir -p "$(PREFIX)/bin"
	@install -m 755 "$$(swift build --configuration release --show-bin-path)/glasur" "$(PREFIX)/bin/glasur"

clean:
	@swift package clean

help:
	@grep -E '^## ' $(MAKEFILE_LIST) | sed 's/^## /  /'
