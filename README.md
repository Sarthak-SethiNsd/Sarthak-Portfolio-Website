# Neon Portfolio

A production-ready, content-driven personal portfolio and project archive built with Next.js, TypeScript, Tailwind CSS, and Framer Motion. Its visual language is inspired by futuristic dashboard interfaces: deep navy surfaces, cyan and magenta highlights, rounded panels, subtle glow, and a responsive sidebar.

The site is intentionally designed so routine content updates happen in JSON files, not React components.

## What is included

- Four primary sections: About, Education & Certifications, Projects, and Competitive Programming
- Live Competitive Programming dashboard integrating profile data, ratings, solved counts, and contest statistics from Codeforces, LeetCode, and CodeChef
- A Projects section that is ready to showcase future AI and software projects
- Automatically discovered project folders and version files
- Dated project history support with features, stack, lessons, and improvements
- Local MP4, YouTube, Vimeo, and generic external video support
- Certificate issuer, completion date, credential URL, image, and PDF support
- Friendly fallback states for missing media, links, and unpublished projects
- Responsive navigation, keyboard-friendly controls, and reduced-motion support
- Static generation for fast Vercel deployments

## Tech stack

- Next.js App Router
- React and TypeScript
- Tailwind CSS
- Framer Motion
- Lucide icons
- JSON and local filesystem content

## Folder structure

```text
.
|-- data/
|   |-- certificates/certificates.json
|   |-- details/about.json
|   |-- projects/
|   `-- templates/
|       |-- certificate.json
|       `-- project/
|           |-- project.json
|           `-- v1.json
|-- public/
|   |-- certificates/
|   |-- images/
|   `-- projects/
|-- src/
|   |-- app/
|   |-- components/
|   `-- lib/
|-- LICENSE
|-- next.config.ts
`-- package.json
```

## Run locally

### Requirements

Install Node.js 20.9 or newer and Git. Then open a terminal in this folder.

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`. Stop the server with `Ctrl+C`.

Before publishing a change, run:

```powershell
npm run lint
npm run build
```

## Content editing basics

JSON is strict: use double quotes, keep commas between items, and do not add a comma after the final item. The `_instructions` fields are safe documentation; the website ignores them.

Media files go in `public/`, while their descriptions and paths go in `data/`. For example, `public/images/me.jpg` is referenced as `/images/me.jpg`.

### Update About information and social links

Edit `data/details/about.json`. Change the name, headline, image, education summary, skill list, introduction, goals, note, and social URLs. Put your portrait in `public/images/` and update `profileImage`.

### Add a certificate

1. Put its image or PDF in `public/certificates/`.
2. Open `data/certificates/certificates.json`.
3. Copy the example from `data/templates/certificate.json` into the `certificates` array.
4. Give it a unique `id` and use a date in `YYYY-MM-DD` format.
5. Set `mediaType` to `image` or `pdf`.
6. Set `mediaPath` to a path such as `/certificates/my-certificate.pdf`.

Leave `credentialUrl` or `mediaPath` empty when unavailable; the page will remain usable.

### Add a project

1. Copy `data/templates/project/` into `data/projects/`.
2. Rename the new folder using lowercase letters and hyphens, for example `tourism-ai`.
3. Edit its `project.json`; its `slug` must match the folder name.
4. Add the cover image under `public/projects/tourism-ai/`.
5. Update `coverImage` to `/projects/tourism-ai/cover.jpg`.
6. Restart the development server after creating a new folder.

The project is automatically included in the project gallery and static route list. Until projects are added, the Projects page displays a clean coming-soon message.

### Add a project version

1. Copy an existing version file or `data/templates/project/v1.json`.
2. Place it inside the project folder.
3. Name it with the next number, such as `v3.json`.
4. Set `version` to the same number and add its release date.

Version files matching `v1.json`, `v2.json`, and so on are discovered automatically and displayed newest first.

### Replace the latest demo video

Only the video declared in `project.json` is shown.

For a local MP4:

```json
"latestDemoVideo": {
  "type": "local",
  "src": "/projects/my-project/videos/latest-demo.mp4",
  "title": "My latest demo"
}
```

Put the file at `public/projects/my-project/videos/latest-demo.mp4`.

For YouTube or Vimeo:

```json
"latestDemoVideo": {
  "type": "external",
  "src": "https://www.youtube.com/watch?v=VIDEO_ID",
  "title": "My latest demo"
}
```

YouTube and Vimeo are embedded. Other external URLs open safely in a new browser tab. An empty `src` produces the friendly "No demo video available yet" state.

## Screenshots

Add final screenshots to `public/screenshots/` and place them here after personalizing the site:

```markdown
![About page](public/screenshots/about.png)
![Projects page](public/screenshots/projects.png)
```

## Push to GitHub

Create an empty repository on GitHub without a generated README, license, or `.gitignore`. Replace the example URL below with your repository URL.

```powershell
git init
git add .
git commit -m "Initial portfolio release"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

For later updates:

```powershell
git add .
git commit -m "Update portfolio content"
git push
```

## Deploy to Vercel

### Dashboard method

1. Push the repository to GitHub.
2. Sign in at `vercel.com` using GitHub.
3. Choose **Add New -> Project**.
4. Import the portfolio repository.
5. Confirm **Framework Preset: Next.js**.
6. Leave the root directory as `./` and keep the default build settings.
7. Select **Deploy**.
8. After deployment, open **Settings -> Domains** to add a custom domain if desired.

Every later push to `main` creates a fresh production deployment automatically.

### Command-line method

```powershell
npm install -g vercel
vercel login
vercel
vercel --prod
```

Answer the setup questions, accept the detected Next.js settings, and keep the project root as the current folder.

## Files you will edit most often

- `data/details/about.json` - identity, About copy, skills, and social links
- `data/details/competitive-programming.json` - competitive programming handles and enabled state
- `data/certificates/certificates.json` - skills and credentials
- `data/projects/*/project.json` - project cards, overview, latest video, GitHub, and roadmap
- `data/projects/*/v*.json` - dated version histories
- `public/images/` - portrait and general imagery
- `public/certificates/` - certificate previews and PDFs
- `public/projects/` - project covers, screenshots, and local demos

## JSON file reference

- `data/details/about.json`: all About-page text, profile image, and social links
- `data/details/competitive-programming.json`: platform handles and enablement state for competitive programming integrations
- `data/certificates/certificates.json`: categorized skill lists and every certificate record
- `data/templates/project/project.json`: copy-ready project metadata template
- `data/templates/project/v1.json`: copy-ready version template
- `data/templates/certificate.json`: copy-ready certificate object

## Limitations and recommended improvements

- Repository content changes require a Git commit and Vercel redeployment; there is no browser-based CMS.
- JSON validation currently fails gracefully at runtime but does not show field-level editor messages. JSON Schema or Zod validation would improve authoring feedback.
- Generic external video hosts cannot be embedded reliably; only YouTube and Vimeo receive automatic embeds.
- Very large local MP4 files can make the repository and deployment heavy. Use a video CDN or YouTube/Vimeo for production demos.
- Certificate PDFs show an open-file action rather than an inline first-page thumbnail.
- Replace placeholder links, identity details, and demo media before publishing.
- Future additions could include a CMS, analytics, automated image optimization checks, testing, an RSS build log, and project filtering.

## Deployment note

This project reads JSON from the repository during Next.js rendering and static generation. New projects and versions require no React code, but the development server may need a restart after new folders are created. Vercel rebuilds automatically after a GitHub push.

## License

Released under the MIT License. Replace the copyright owner in `LICENSE` before publishing.
