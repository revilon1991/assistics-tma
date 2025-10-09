.DEFAULT_GOAL := help

.NOTPARALLEL: deploy-dev

.PHONY: help build deploy-dev upload

deploy-dev: build upload

help:
	@printf "Available goals:\n"
	@printf "  build             — Build project\n"
	@printf "  deploy-dev        — Deploy main branch to dev server\n"

upload:
	scp -r dist deployer@18.198.250.222:/www/assistant-tma/

build:
	npm run build
