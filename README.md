# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.


Building OpenCV.js with docker:
https://docs.opencv.org/4.13.0/d4/da1/tutorial_js_setup.html

```bash
cd ~/git
git clone https://github.com/opencv/opencv.git

# edit as required
./config/opencv_js.config.py

# create symlink to git repo
cd ~/git/opencv/platforms/js
ln -s ~/git/charuco-transform/config/opencv_js.config.py opencv_js.config.py

# changes made:

# build
cd ~/git/opencv
docker run --rm -v $(pwd):/src -u $(id -u):$(id -g) emscripten/emsdk:2.0.10 emcmake python3 ./platforms/js/build_js.py build_js

# move the file
mv ~/git/opencv/build_js/bin/opencv.js ~/git/charuco-transform/public/lib/opencv-custom-4.13.0.js

# manually remove this from the end of the file and make it `return cv`
return cv.ready
```
