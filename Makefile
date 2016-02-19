.PHONY: all build dist

all: build

build: node_modules

dist: node_modules tools/build.conf.js
	mkdir -p dist && npm run build

version:
	./node_modules/.bin/json -E 'this.version="$(v)"' -f package.json -I
	./node_modules/.bin/json -E 'this.version="$(v)"' -f bower.json -I

# if package.json changes, install
node_modules: package.json
	npm install
	touch $@

test: build
	npm test

testp: build
	./node_modules/karma/bin/karma start --browsers=PhantomJS

testb: build
	./node_modules/karma/bin/karma start --browsers=Chrome

clean:
	rm -rf node_modules lib dist

package: dist

run: server

server: build
	npm start
	
lint: build
	npm run hint

lessc: build
	npm run lessc

env=dev
deploy: dist
	./node_modules/.bin/lfcdn -e $(env)

