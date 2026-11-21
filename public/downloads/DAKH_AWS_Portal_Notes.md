# AWS Cloud Foundations

**Online internship · Beginner · 4 weeks**

## Project brief

**Build a static website and publish it over HTTPS on AWS.** Choose a one-page portfolio, event landing page, or club website. Give it a title, at least two content sections, and a mobile-friendly layout. Add one working JavaScript feature, such as a theme toggle.

### How the pieces fit

- **GitHub** stores your source code and its change history.
- **Amazon S3** stores the files visitors will receive, such as `index.html`, CSS, JavaScript, and images.
- **Amazon CloudFront** delivers those files over HTTPS. It can keep copies near visitors for faster delivery.
- **Origin Access Control (OAC)** lets CloudFront make signed requests to your private S3 bucket. The bucket policy grants the designated distribution permission to read the files.

**Request path:** The visitor connects to CloudFront over HTTPS. CloudFront reads files from the private S3 bucket. GitHub is your source repository. You will upload files to S3 yourself in this project.

**Study order:** Watch one video each week, read the notes, and finish the lab. Use the starter website if you are new to HTML, CSS, and JavaScript.

### Before starting

- You need a laptop, a browser, a text editor, a GitHub account, and AWS lab access by Week 2. Ask your mentor about a lab account if you cannot set up your own.
- Before creating AWS resources, check your account's pricing and credits. If you manage the account, set up a [budget alert](https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-create.html). An alert tells you about costs and does not automatically stop them.
- Keep AWS passwords, access keys, and private information out of your code, screenshots, and submission. Use practice data on your public website.

**Final deliverables:** A working CloudFront HTTPS URL, a GitHub repository with a README, and a two-minute demo.


---

# Week 1 · Build the website

## Watch first

- [HTML & CSS Full Course — SuperSimpleDev](https://www.youtube.com/watch?v=G3e-cpL7ofc). Watch **1:02–44:39** for HTML and CSS basics and **1:52:18–2:11:08** for page structure.
- [GitHub Docs: Upload files to a repository](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository). Follow the browser upload steps.

## Read and understand

HTML gives the page its structure, CSS controls its appearance, and JavaScript adds behaviour. A **static website** delivers existing files to the browser. JavaScript can still make it interactive after it loads. Your GitHub repository holds the project files and a history of the changes you make.

## Hands-on lab

1. Create a project folder with `index.html`, `style.css`, `script.js`, and `assets/` for optional images.
2. In the HTML head, add the mobile viewport tag and link to `./style.css`. Add a script tag pointing to `./script.js` with the `defer` attribute. Match the spelling and case of every filename.
3. Use the starter code in this guide. Change the heading and both sections to suit your topic. The button uses JavaScript to switch the page theme.
4. Open `index.html` in your browser. Verify the button and resize the window to a narrow mobile width. If something is missing, check the filename, path, and browser console.
5. Create a GitHub repository. Choose **Add file → Upload files**, select your project files, and commit them. Add a README explaining how to open the site locally.

**Submit:** GitHub repo link and a screenshot of your website running locally.

**Check your understanding:** If a page uses JavaScript for a button, can it still be a static site? Explain where that JavaScript runs.

### GitHub examples to learn from

- [SuperSimpleDev HTML/CSS source code](https://github.com/SuperSimpleDev/html-css-course). See how practice pages organise HTML, CSS, and assets.
- [GitHub Skills: Introduction to GitHub](https://github.com/skills/introduction-to-github). Practise commits and editing a README.
- [S3 + CloudFront OAC example repository](https://github.com/JSK8887/aws-s3-cloudfront-oac). Read the project overview and compare it with your architecture. Follow the AWS guide and Week 3 lab for your own deployment.

---

# Week 2 · Store the files in Amazon S3

## Watch first

- [AWS S3 Full Tutorial for Beginners — Simply Byte (Tamil)](https://www.youtube.com/watch?v=uMKiY9oQ87Y). Focus on bucket creation and file upload. Use the project settings below for access permissions.
- [Uploading objects — AWS S3 documentation](https://docs.aws.amazon.com/AmazonS3/latest/userguide/upload-objects.html).

## Read and understand

An S3 **bucket** is a container for files. A file stored in it is an **object**. Its **key** is its full name inside the bucket, such as `assets/logo.png`. This project's bucket stays private. In Week 3, CloudFront will get permission to read the objects it needs.

## Hands-on lab

1. Sign in to the AWS Console. Open **S3 → Create bucket**. Choose a general purpose bucket, a globally unique name, and a region you are allowed to use. Write down the bucket name and region.
2. Keep **Block all public access** enabled. Leave **Object Ownership** set to **Bucket owner enforced** so ACLs stay disabled. Keep default S3-managed encryption (SSE-S3) for this lab.
3. Open the bucket. Upload the contents of your project folder. Put `index.html`, `style.css`, and `script.js` at the bucket root and preserve any `assets/` paths. Upload the project files themselves, with `index.html` visible in the S3 object list.
4. Check that object keys match your HTML references exactly. For this setup, leave S3 static website hosting disabled. CloudFront will use the regular S3 bucket origin.
5. Open the `index.html` **Object URL** in a private browser window. An access-denied response is expected because visitors have no direct S3 access.

**Submit:** Screenshots of the S3 object list and the **Block all public access** setting. Hide account identifiers where practical.

**Check your understanding:** Why is direct S3 access denied even though your files uploaded correctly?

---

# Week 3 · Publish the site with CloudFront

## Watch first

- [Secure static website on S3 with CloudFront — Saurabh Bhargav](https://www.youtube.com/watch?v=up_vj1Koj-I). Start at 2:10 for the CloudFront setup, then watch the deployment test at 6:10.
- [AWS Builder Center step-by-step lab](https://builder.aws.com/content/3KQFDm4Vx9uRHuTjCp77WSr5FOo/host-a-static-website-on-aws-with-amazon-s3-and-cloudfront). Use this guide and the [AWS OAC documentation](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html) for the project settings.

## Read and understand

A **distribution** is the CloudFront configuration for delivering your site. The **origin** is where the original files are stored. OAC signs the requests CloudFront makes to S3. The S3 bucket policy authorizes those requests for your distribution. Both pieces must be configured for a private bucket.

## Hands-on lab

1. In **CloudFront → Create distribution**, select your regular S3 bucket as the origin. Choose or create an **Origin Access Control**, with requests signed.
2. Apply the CloudFront-provided S3 bucket policy if the console has not applied it. Verify it grants the CloudFront service principal `s3:GetObject` for your bucket's objects and restricts access to your distribution's ARN. Keep **Block all public access** enabled.
3. Set **Default root object** to `index.html` without a leading slash. Under the default behaviour, set **Viewer protocol policy** to **Redirect HTTP to HTTPS**.
4. Wait for the distribution changes to finish deploying. Open its `https://…cloudfront.net/` URL in a private browser window. Verify the homepage, CSS, images, and JavaScript.
5. Check that the direct S3 Object URL is still denied. If CloudFront shows 403, check the bucket policy, OAC, origin type, and `index.html` key before changing permissions. If `/index.html` works and `/` does not, check the default root object.

**Submit:** Working HTTPS URL and a screenshot of the site from the CloudFront address.

**Check your understanding:** Why can CloudFront read the files even though the direct S3 URL is denied?

---

# Week 4 · Update, test, and submit

## Review first

- [Remove Cached Files from CloudFront — official AWS video](https://aws.amazon.com/video/watch/cbea0139b2c/). Watch how to create an invalidation for a specific path.
- [CloudFront invalidation guide — AWS](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Invalidation.html) and [path examples](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/invalidation-specifying-objects.html).

## Read and understand

A **cache** is a saved copy of a file. CloudFront can continue to serve the saved copy after you replace a file in S3. An **invalidation** tells CloudFront to discard its cached copy so later requests can fetch the new version. You can also give changed assets new filenames, such as `style-v2.css`, and update your HTML to reference them.

## Hands-on lab

1. Change a visible website detail, such as the page heading. Commit the change on GitHub and upload the updated `index.html` to the same S3 key.
2. Open the CloudFront URL in a private window and check the heading. If CloudFront still serves the old version, open **CloudFront → your distribution → Invalidations → Create invalidation**. Include `/index.html` and `/` for this lab. Add exact paths for any changed assets if needed.
3. Wait for the invalidation to complete and verify the change at the live URL. Check the site on a mobile-width screen and verify the button still works.
4. Update the README with your website purpose, live URL, how to run it locally, deployment steps, and what you changed. Explain how OAC keeps S3 private and how you verified the update.
5. Record a **two-minute demo** showing the live site, the update, and the request path from CloudFront to private S3. Keep account credentials and secrets off-screen.

**Submit:** Email your live URL, GitHub repository, and demo link to **dakhedusolutions@gmail.com**. Include your full name and Intern ID. Verify that reviewers can open the links.

**After review:** When your mentor confirms the live link is no longer needed, disable and delete the distribution, remove the training bucket and its contents, and check Billing for remaining resources or charges.

---

# Starter website · Three files

Copy each block into a file with the exact name shown. Keep all three files in the same folder. Open `index.html` in your browser, click **Switch theme**, and replace the sample content before uploading to GitHub.

## index.html

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>My Cloud Portfolio</title>
  <link rel="stylesheet" href="./style.css">
  <script src="./script.js" defer></script>
</head>
<body>
  <main>
    <h1>My Cloud Portfolio</h1>
    <section><h2>About Me</h2><p>I am learning cloud hosting.</p></section>
    <section><h2>My Project</h2><p>I built this site for my AWS lab.</p></section>
    <button id="theme" type="button" aria-pressed="false">Switch theme</button>
  </main>
</body>
</html>
```

## style.css

```css
body { margin: 0; font: 1rem/1.6 system-ui, sans-serif; }
main { max-width: 42rem; margin: auto; padding: 1.5rem; }
button { padding: .5rem 1rem; font: inherit; cursor: pointer; }
.dark { background: #211831; color: #fff; }
```

## script.js

```js
const button = document.querySelector("#theme");
button.addEventListener("click", () => {
  const dark = document.body.classList.toggle("dark");
  button.setAttribute("aria-pressed", String(dark));
});
```

**Try it:** Change the page heading and resize the browser. The button should still switch themes, and the page should fit a mobile screen without horizontal scrolling.

---

# Final checks and submission

## If something goes wrong

- **CloudFront shows 403:** Confirm `index.html` is at the bucket root. Check the regular S3 origin, attached OAC, and the bucket policy where the source ARN matches your distribution. Keep the bucket private.
- **CloudFront opens /index.html but / fails:** Set the default root object to `index.html` without a leading slash.
- **The site loads without CSS or images:** In browser DevTools, open Network and find the failed file. Compare its requested path and letter case with the S3 object key.
- **GitHub has your changes, but the site does not:** Upload the changed files to S3. Check the CloudFront URL once the update or invalidation is complete.

## What to put in README.md

- Name of your website and what it does.
- Live CloudFront URL and how to open your project locally.
- Services used and how a browser request travels from CloudFront to private S3.
- Steps you used to publish the site and what you changed after the first deployment.
- A short note showing how you tested HTTPS, private S3 access, and the latest update.

## What your mentor will check

1. Your live URL opens over HTTPS and the website works at mobile width.
2. Your S3 files are served through CloudFront and direct public S3 access is denied.
3. You can show a visible update on the live site and explain how you published it.
4. The GitHub repository and two-minute demo are accessible and describe your own work.

**Submit:** Send your full name, Intern ID, live website link, GitHub repo link, and demo link to **dakhedusolutions@gmail.com**. Use the subject **AWS Cloud Foundations Project – Your Name**.

**Reference:** [Troubleshoot CloudFront distributions — AWS](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/troubleshooting-distributions.html).
