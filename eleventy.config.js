import fs from 'fs';
import path from 'path';

import cssnano from 'cssnano';
import postcss from 'postcss';
import tailwindcss from '@tailwindcss/postcss';
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function (eleventyConfig) {
  //compile tailwind before eleventy processes the files
  eleventyConfig.on('eleventy.before', async () => {
    const tailwindInputPath = path.resolve('./src/_includes/styles/index.css');

    const tailwindOutputPath = './dist/assets/styles/index.css';

    const cssContent = fs.readFileSync(tailwindInputPath, 'utf8');

    const outputDir = path.dirname(tailwindOutputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const result = await processor.process(cssContent, {
      from: tailwindInputPath,
      to: tailwindOutputPath,
    });

    fs.writeFileSync(tailwindOutputPath, result.css);
  });

  eleventyConfig.addFilter("inlinecss", function(filePath) {
    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch (e) {
      console.error("Could not find CSS file for inlining:", e);
      return "";
    }
  });

  eleventyConfig.addShortcode("icon", function(name) {
    const filePath = path.join(__dirname, `./src/_includes/icons/${name}.svg`);
    const content = fs.readFileSync(filePath, "utf8");
    // Return the SVG content directly into the HTML
    return content;
  });

  const processor = postcss([
    //compile tailwind
    tailwindcss(),

    //minify tailwind css
    cssnano({
      preset: 'default',
    }),
  ]);

    eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
        // 1. Add multiple widths (e.g., 600 for mobile/small, 1200 for desktop)
        widths: [600, 1200, "auto"],

        // 2. Map these to formats (WebP is great for performance)
        formats: ["webp", "auto"],

        // 3. This is the magic part for PageSpeed
        htmlOptions: {
            imgAttributes: {
                loading: "lazy",
                decoding: "async",
            },
        },

        // Default sizes attribute (crucial for responsive images)
        defaultAttributes: {
            sizes: "(max-width: 1200px) 100vw, 1200px",
        }
    });

  // passthrough images and docs
  eleventyConfig.addPassthroughCopy("src/assets/images");
  eleventyConfig.addPassthroughCopy("src/documents");

  return {
    dir: { input: 'src', output: 'dist' },
  };
}
