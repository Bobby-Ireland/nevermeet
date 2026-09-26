# Put NEVERMEET on GitHub, then online

This folder contains the editable website. The live ChatGPT-hosted copy remains separate and unchanged.

## 1. Extract the download

Unzip `NEVERMEET-GitHub-ready.zip` on your computer and open the `nevermeet` folder. You should see `package.json`, `README.md`, `app`, `public` and other files.

Upload the contents of this folder, not the ZIP file and not an extra outer folder. `package.json` must be at the top level of the GitHub repository.

## 2. Create your GitHub repository

1. Sign in at https://github.com and open https://github.com/new.
2. Name the repository `nevermeet`.
3. Select **Private** while developing. The website can later be public while this source repository stays private.
4. Leave the options to add a README, .gitignore and licence unchecked; the required project files are already supplied.
5. Select **Create repository**.

## 3. Upload the files

1. On the empty repository page, choose **uploading an existing file**. For a repository that already has files, use **Add file → Upload files**.
2. Drag the contents of the extracted `nevermeet` folder into the upload area, including its folders.
3. Include the hidden files and folders: `.github`, `.gitignore`, `.gitattributes`, `.nvmrc` and `.node-version`. On a Mac, press Command+Shift+Period in Finder to show them; on Windows, enable **View → Show → Hidden items**.
4. Enter a message such as `Add NEVERMEET website` and select **Commit changes**.
5. Check that `app`, `public`, `package.json` and `pnpm-lock.yaml` appear at the repository's top level. Open **Actions** to see the automatic **Check website** build.

Use a desktop browser for folder uploads. If hidden folders are awkward to upload, GitHub Desktop is an alternative: create a local repository, copy this folder's contents into it, commit, then publish it privately to GitHub.

Never upload `node_modules`, `.next`, `out`, local `.env` files or access tokens. They are excluded from this download. The `.gitignore` protects future Git commits; browser uploads still require you to select the intended files.

## 4. Publish with Cloudflare Pages

1. Sign in to Cloudflare and open **Workers & Pages → Create application → Pages → Import an existing Git repository**.
2. Connect GitHub and give Cloudflare access to the `nevermeet` repository.
3. Select it and apply these build settings:

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Framework preset | Next.js (Static HTML Export) |
| Build command | `pnpm build` |
| Build output directory | `out` |
| Root directory | Leave empty |
| `NODE_VERSION` environment variable | `24` |
| `PNPM_VERSION` environment variable | `11.25.0` |

4. Save and deploy. Cloudflare installs the dependencies and builds the site.
5. Open the `pages.dev` address returned by Cloudflare. This separate website has no ChatGPT login requirement. Test a swipe, a match, a message and the mobile layout.

The environment values above choose build tools; they are not secrets. NEVERMEET does not need any API keys or database settings. The built-in app has no sign-in. Repository privacy and website visibility are separate settings.

## 5. Make later updates

Edit the files in GitHub or on your computer and commit them to `main`. Your GitHub checks run again, and Cloudflare automatically rebuilds the connected website. You can add a custom domain through the Pages project's **Custom domains** settings later.

## If something goes wrong

- **No `package.json` found:** the project is inside an extra folder. Move its contents to the repository root or set that folder as Cloudflare's root directory.
- **Package manager mismatch:** use pnpm 11.25.0 and keep `pnpm-lock.yaml` with `package.json`. Do not mix an npm lockfile into this project.
- **No website after GitHub upload:** connect the repository to hosting in step 4; source storage does not publish a site automatically.
- **Images broken under `/nevermeet/`:** this package targets the domain root. Use Cloudflare Pages or a custom domain; GitHub Pages subdirectory hosting needs a separate path configuration.

## Official guides

- GitHub uploads: https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository
- Cloudflare Pages with a Next.js static export: https://developers.cloudflare.com/pages/framework-guides/nextjs/deploy-a-static-nextjs-site/
- Next.js static exports: https://nextjs.org/docs/app/guides/static-exports
