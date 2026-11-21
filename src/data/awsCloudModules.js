export const AWS_CLOUD_PROJECTS = [
  {
    id: 'aws_proj_1',
    title: 'Static Website on AWS (Amazon S3 + CloudFront OAC)',
    description: 'Build a responsive personal portfolio or landing page with HTML/CSS/JS and publish it globally over HTTPS using private Amazon S3 and CloudFront Origin Access Control (OAC).'
  },
  {
    id: 'aws_proj_2',
    title: 'Event / Club Website with Global CDN Distribution',
    description: 'Design a mobile-friendly club/event showcase site with theme switcher, host files securely in S3 with Block Public Access enabled, and distribute with sub-second latency via CloudFront edge locations.'
  },
  {
    id: 'aws_proj_3',
    title: 'Production-Grade Cloud Web Architecture & Cache Invalidation',
    description: 'Deploy full CI/CD-ready static web architecture with GitHub source control, private object storage, customized HTTPS routing, and zero-downtime cache invalidation pipelines.'
  }
];

export const AWS_CLOUD_MODULES = [
  {
    id: 'aws_cloud_mod_1',
    week_number: 1,
    title: 'Week 1 · Build the Website & Version Control with GitHub',
    task_details: `Goal: Build a mobile-friendly static website (index.html, style.css, script.js) with a working JavaScript theme toggle, test it locally, and push your code to a new GitHub repository.

Task 1 – Project Setup:
• Create a project folder with index.html, style.css, script.js, and an assets/ folder for optional images.
• Include the mobile viewport tag in <head>, link style.css, and load script.js with the 'defer' attribute.

Task 2 – Website Customization:
• Use the provided starter code or build your own portfolio / event page.
• Add a descriptive heading, at least two distinct content sections, and a working dark/light theme switch button.
• Test the site locally in your browser and verify mobile responsiveness.

Task 3 – GitHub Repository:
• Create a new repository on GitHub (e.g., 'aws-cloud-portfolio').
• Upload your index.html, style.css, script.js, and assets.
• Write a clear README.md explaining project purpose and how to view it locally.

Submission:
1. GitHub repository URL
2. Screenshot of the website running locally in your browser.`,
    videos: [
      {
        title: 'HTML & CSS Full Course for Beginners — SuperSimpleDev',
        url: 'https://www.youtube.com/watch?v=G3e-cpL7ofc',
        duration: '45:00'
      },
      {
        title: 'GitHub Tutorial for Beginners: Create Repo & Upload Files',
        url: 'https://www.youtube.com/watch?v=RGOj5yH7evk',
        duration: '12:30'
      }
    ],
    resources: [
      {
        title: 'SuperSimpleDev HTML/CSS Course Repo',
        url: 'https://github.com/SuperSimpleDev/html-css-course'
      },
      {
        title: 'GitHub Skills: Introduction to GitHub',
        url: 'https://github.com/skills/introduction-to-github'
      }
    ],
    quiz_data: [
      {
        question: 'If a webpage uses client-side JavaScript for an interactive button, can it still be considered a static website?',
        options: [
          'No, because any JavaScript makes a website dynamically server-rendered',
          'Yes, because the files (HTML, CSS, JS) are pre-built and delivered as static files to the browser where JS executes',
          'Only if it runs on a PHP server',
          'Only if the database is embedded inside the HTML file'
        ],
        correct_option: 1,
        answer: 'Yes, because the files (HTML, CSS, JS) are pre-built and delivered as static files to the browser where JS executes'
      },
      {
        question: 'What is the purpose of the <meta name="viewport" content="width=device-width, initial-scale=1"> tag in HTML?',
        options: [
          'It connects the webpage to the AWS CloudFront CDN',
          'It tells mobile browsers to render the page to match the screen width and prevents desktop-zoom distortion',
          'It encrypts web traffic using SSL/TLS certificates',
          'It automatically converts HTML into PDF format'
        ],
        correct_option: 1,
        answer: 'It tells mobile browsers to render the page to match the screen width and prevents desktop-zoom distortion'
      },
      {
        question: 'Why is the "defer" attribute used in the <script src="./script.js" defer></script> tag?',
        options: [
          'It cancels the execution of the script on mobile devices',
          'It downloads the script in parallel and executes it only after HTML document parsing is complete',
          'It delays the upload to Amazon S3 by 5 minutes',
          'It makes the JavaScript code run on AWS Lambda servers'
        ],
        correct_option: 1,
        answer: 'It downloads the script in parallel and executes it only after HTML document parsing is complete'
      },
      {
        question: 'In Git and GitHub, what is a repository?',
        options: [
          'A web browser used to test HTML pages',
          'A storage space where your project code, documentation, and version commit history are tracked',
          'A physical AWS data center located in Virginia',
          'A paid software license for text editors'
        ],
        correct_option: 1,
        answer: 'A storage space where your project code, documentation, and version commit history are tracked'
      },
      {
        question: 'Where does JavaScript code execute in a static website hosted on AWS S3 & CloudFront?',
        options: [
          'Directly inside the AWS S3 storage hard drive',
          'Inside the visitor\'s client web browser engine (Client-side)',
          'On the AWS CloudFront origin server before sending the response',
          'In the GitHub commit log'
        ],
        correct_option: 1,
        answer: 'Inside the visitor\'s client web browser engine (Client-side)'
      }
    ]
  },
  {
    id: 'aws_cloud_mod_2',
    week_number: 2,
    title: 'Week 2 · Store the Files in Amazon S3 (Private Bucket)',
    task_details: `Goal: Create an Amazon S3 bucket, enforce security by keeping Block All Public Access enabled, upload website assets to the bucket root, and verify that direct public S3 URLs are denied.

Task 1 – S3 Bucket Creation:
• Log in to AWS Management Console and open Amazon S3.
• Choose 'Create bucket', General purpose, choose a globally unique name (e.g. 'dakh-student-portfolio-[yourname]').
• Select your designated AWS region (e.g., ap-south-1 or us-east-1).

Task 2 – Security & Access Controls:
• Keep 'Block ALL public access' checkbox ENABLED (Checked).
• Keep Object Ownership set to 'Bucket owner enforced' (ACLs disabled).
• Keep default SSE-S3 encryption enabled.

Task 3 – Upload Website Objects:
• Upload index.html, style.css, and script.js directly to the bucket root.
• Upload your assets/ folder preserving folder structure.
• Verify index.html is directly listed at the root level of the bucket.

Task 4 – Verification:
• Leave 'Static website hosting' DISABLED (CloudFront will read S3 as a private REST origin).
• Click index.html, copy its Object URL, and open it in a private/incognito browser window.
• Verify that you receive an HTTP 403 Access Denied (this confirms your bucket is properly secured!).

Submission:
1. Screenshot of the S3 bucket object list showing index.html, style.css, script.js.
2. Screenshot of the 'Block public access' tab showing 'On' (Blocked).`,
    videos: [
      {
        title: 'AWS S3 Full Tutorial for Beginners — Simply Byte (Tamil)',
        url: 'https://www.youtube.com/watch?v=uMKiY9oQ87Y',
        duration: '26:00'
      },
      {
        title: 'Uploading Objects to Amazon S3 & Security Permissions Explained',
        url: 'https://www.youtube.com/watch?v=e6w9LwZJFIA',
        duration: '14:20'
      }
    ],
    resources: [
      {
        title: 'AWS S3 Object Upload Documentation',
        url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/upload-objects.html'
      },
      {
        title: 'AWS S3 Block Public Access Guide',
        url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html'
      }
    ],
    quiz_data: [
      {
        question: 'In Amazon S3, what is an "Object" and what is an "Object Key"?',
        options: [
          'An object is an AWS bill and the key is your credit card number',
          'An object is a file (HTML, CSS, image) and its key is the unique path/name of that file inside the bucket (e.g. assets/logo.png)',
          'An object is a hardware computer and the key is the power button',
          'An object is an SSL certificate and the key is the domain name'
        ],
        correct_option: 1,
        answer: 'An object is a file (HTML, CSS, image) and its key is the unique path/name of that file inside the bucket (e.g. assets/logo.png)'
      },
      {
        question: 'Why should "Block All Public Access" remain enabled for your S3 bucket in this modern architecture?',
        options: [
          'To save storage costs on AWS',
          'Because best security practice mandates keeping the S3 bucket completely private while CloudFront delivers content securely via OAC',
          'Because public S3 buckets cannot store HTML files',
          'Because public access slows down local internet speed'
        ],
        correct_option: 1,
        answer: 'Because best security practice mandates keeping the S3 bucket completely private while CloudFront delivers content securely via OAC'
      },
      {
        question: 'When you test the direct S3 Object URL in your browser during Week 2, what response should you expect and why?',
        options: [
          '200 OK because S3 is always publicly accessible',
          '403 Access Denied because public access is blocked and visitors do not have IAM credentials to read the bucket directly',
          '500 Internal Server Error because the S3 server crashed',
          '404 Not Found because S3 deletes files after upload'
        ],
        correct_option: 1,
        answer: '403 Access Denied because public access is blocked and visitors do not have IAM credentials to read the bucket directly'
      },
      {
        question: 'Where must "index.html" be located inside the S3 bucket for CloudFront default root object routing to work properly?',
        options: [
          'Inside a nested subfolder named /temp/html/index.html',
          'At the root level of the S3 bucket (e.g. s3://your-bucket-name/index.html)',
          'Inside the AWS Billing console',
          'It does not need to be uploaded to S3'
        ],
        correct_option: 1,
        answer: 'At the root level of the S3 bucket (e.g. s3://your-bucket-name/index.html)'
      },
      {
        question: 'What type of S3 bucket encryption is recommended and enabled by default for this project?',
        options: [
          'SSE-S3 (Server-Side Encryption with Amazon S3 managed keys)',
          'No encryption at all',
          'Triple DES manual paper encryption',
          'Third-party external USB dongle encryption'
        ],
        correct_option: 0,
        answer: 'SSE-S3 (Server-Side Encryption with Amazon S3 managed keys)'
      }
    ]
  },
  {
    id: 'aws_cloud_mod_3',
    week_number: 3,
    title: 'Week 3 · Deploy with Amazon CloudFront & Origin Access Control (OAC)',
    task_details: `Goal: Configure Amazon CloudFront distribution, attach Origin Access Control (OAC) to sign requests to the private S3 bucket, apply the S3 bucket policy, enforce HTTPS redirection, and test the live CloudFront URL.

Task 1 – Create CloudFront Distribution:
• Open CloudFront Console -> 'Create distribution'.
• Origin Domain: Select your S3 bucket (regular S3 REST endpoint, NOT the website endpoint).
• Origin Access: Choose 'Origin Access Control (OAC)' and create an OAC profile with signed requests.

Task 2 – Apply S3 Bucket Policy:
• Copy the policy provided by CloudFront.
• Go to S3 -> your bucket -> Permissions -> Bucket Policy -> Paste & Save.
• Verify the policy grants 's3:GetObject' strictly to the CloudFront Service Principal (cloudfront.amazonaws.com) conditioned on your distribution ARN!

Task 3 – Distribution Configuration:
• Default Root Object: enter 'index.html' (without leading slash).
• Viewer Protocol Policy: set to 'Redirect HTTP to HTTPS'.
• Allowed HTTP Methods: GET, HEAD.

Task 4 – Live Deployment & Verification:
• Wait for distribution deployment status to show 'Enabled / Deployed'.
• Copy your distribution domain name: https://dXXXXXXXXX.cloudfront.net
• Open it in a private browser window: verify the homepage, styles, images, and theme toggle button!
• Re-test the direct S3 URL to confirm it remains 403 Forbidden, proving CloudFront OAC is the exclusive authorized gateway.

Submission:
1. Working CloudFront HTTPS link (https://...cloudfront.net)
2. Screenshot of the live website loaded via CloudFront.`,
    videos: [
      {
        title: 'Secure Static Website on S3 with CloudFront & OAC — Saurabh Bhargav',
        url: 'https://www.youtube.com/watch?v=up_vj1Koj-I',
        duration: '22:00'
      },
      {
        title: 'AWS CloudFront OAC & S3 Bucket Policy Explained',
        url: 'https://www.youtube.com/watch?v=f0U_R2b2hX4',
        duration: '18:15'
      }
    ],
    resources: [
      {
        title: 'AWS OAC Reference Repository (GitHub)',
        url: 'https://github.com/JSK8887/aws-s3-cloudfront-oac'
      },
      {
        title: 'AWS Builder Center: Host a Static Website on S3 + CloudFront',
        url: 'https://builder.aws.com/content/3KQFDm4Vx9uRHuTjCp77WSr5FOo/host-a-static-website-on-aws-with-amazon-s3-and-cloudfront'
      }
    ],
    quiz_data: [
      {
        question: 'What is Amazon CloudFront and what role does it serve in this architecture?',
        options: [
          'A database engine for storing SQL tables',
          'A Content Delivery Network (CDN) that caches website files at global Edge Locations and serves them securely over HTTPS',
          'An operating system for mobile phones',
          'A code editor like VS Code'
        ],
        correct_option: 1,
        answer: 'A Content Delivery Network (CDN) that caches website files at global Edge Locations and serves them securely over HTTPS'
      },
      {
        question: 'What is Origin Access Control (OAC)?',
        options: [
          'A password that visitors type when loading the website',
          'An AWS security feature that signs CloudFront requests to Amazon S3 so the private bucket only accepts requests from your designated CloudFront distribution',
          'A plugin for Google Chrome',
          'A physical cable connecting your laptop to AWS'
        ],
        correct_option: 1,
        answer: 'An AWS security feature that signs CloudFront requests to Amazon S3 so the private bucket only accepts requests from your designated CloudFront distribution'
      },
      {
        question: 'Why does CloudFront succeed in loading files when direct public S3 URLs return 403 Forbidden?',
        options: [
          'CloudFront hacks into the AWS servers',
          'The S3 bucket policy explicitly allows the CloudFront service principal to read objects when authenticated via OAC, while public access remains completely blocked',
          'CloudFront ignores S3 security policies',
          'CloudFront downloads the files to your personal computer'
        ],
        correct_option: 1,
        answer: 'The S3 bucket policy explicitly allows the CloudFront service principal to read objects when authenticated via OAC, while public access remains completely blocked'
      },
      {
        question: 'What happens if you do NOT set "index.html" as the Default Root Object in CloudFront?',
        options: [
          'The entire AWS account gets suspended',
          'Opening the bare root URL (https://...cloudfront.net/) will return a 403 or Access Denied because CloudFront does not know which file to deliver by default',
          'The website automatically translates into Spanish',
          'CloudFront deletes your GitHub repository'
        ],
        correct_option: 1,
        answer: 'Opening the bare root URL (https://...cloudfront.net/) will return a 403 or Access Denied because CloudFront does not know which file to deliver by default'
      },
      {
        question: 'Which Viewer Protocol Policy setting ensures visitors always communicate securely with your website?',
        options: [
          'Allow HTTP only',
          'Redirect HTTP to HTTPS',
          'Block all internet browsers',
          'Require FTP login'
        ],
        correct_option: 1,
        answer: 'Redirect HTTP to HTTPS'
      }
    ]
  },
  {
    id: 'aws_cloud_mod_4',
    week_number: 4,
    title: 'Week 4 · Update the Live Site, Invalidation & Final Submission',
    task_details: `Goal: Update your website content, commit changes to GitHub, re-upload to S3, perform a CloudFront Cache Invalidation, record a 2-minute project demo, and submit your deliverables.

Task 1 – Content Update:
• Make a visible change in index.html (e.g. update your portfolio bio, add a project link, or change the heading).
• Commit the change to your GitHub repo.
• Upload the updated index.html to your S3 bucket replacing the old file.

Task 2 – CloudFront Cache Invalidation:
• Open your live CloudFront URL. Notice that the old version may still display due to Edge Cache.
• Go to CloudFront Console -> your distribution -> 'Invalidations' tab -> 'Create invalidation'.
• Enter '/index.html' and '/' (and any changed asset paths). Click 'Create invalidation'.
• Once the invalidation finishes, refresh the live HTTPS link in a private window to verify the updated content is live!

Task 3 – Final Documentation & README:
• Update your GitHub README.md with:
  1. Website purpose and live HTTPS link.
  2. Architecture diagram / explanation (Browser -> CloudFront HTTPS -> OAC -> Private S3).
  3. Steps followed to deploy and verify updates.
  4. How OAC protects the S3 bucket.

Task 4 – Record 2-Minute Demo Video:
• Record a 2-minute video showing:
  1. The live website running smoothly on its CloudFront HTTPS URL.
  2. Testing the theme toggle button and mobile responsiveness.
  3. Quick walkthrough of the S3 bucket and CloudFront distribution.
  4. Keep account numbers and credentials off-screen.

Task 5 – Final Submission:
• Email your live HTTPS link, GitHub repository link, and demo video link to: dakhedusolutions@gmail.com
• Subject: AWS Cloud Foundations Project – [Your Full Name] – [Intern ID]

Post-Evaluation Clean-up:
• After your mentor evaluates your project, disable and delete the distribution and empty/delete the practice S3 bucket to prevent any unexpected charges.`,
    videos: [
      {
        title: 'Remove Cached Files from CloudFront — Official AWS Video',
        url: 'https://aws.amazon.com/video/watch/cbea0139b2c/',
        duration: '08:15'
      },
      {
        title: 'CloudFront Cache Invalidation & TTL Deep Dive Tutorial',
        url: 'https://www.youtube.com/watch?v=z3Z3H4X8M_g',
        duration: '12:45'
      }
    ],
    resources: [
      {
        title: 'CloudFront Invalidation Guide — Official AWS Docs',
        url: 'https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Invalidation.html'
      },
      {
        title: 'Troubleshooting CloudFront Distributions',
        url: 'https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/troubleshooting-distributions.html'
      }
    ],
    quiz_data: [
      {
        question: 'Why does CloudFront continue to serve an older version of your website even after you upload a new index.html to S3?',
        options: [
          'Because S3 rejects new files',
          'Because CloudFront caches files at edge locations based on TTL (Time-to-Live) to provide ultra-fast response times',
          'Because CloudFront only updates once a year',
          'Because GitHub blocks the update'
        ],
        correct_option: 1,
        answer: 'Because CloudFront caches files at edge locations based on TTL (Time-to-Live) to provide ultra-fast response times'
      },
      {
        question: 'What is a CloudFront "Cache Invalidation"?',
        options: [
          'A command that deletes the S3 bucket permanently',
          'A directive telling CloudFront edge servers to remove cached copies of specified files so the next visitor request fetches the fresh version from S3',
          'A tool used to format code syntax',
          'A billing invoice sent to the customer'
        ],
        correct_option: 1,
        answer: 'A directive telling CloudFront edge servers to remove cached copies of specified files so the next visitor request fetches the fresh version from S3'
      },
      {
        question: 'Which invalidation paths are recommended when updating the homepage of your static website?',
        options: [
          '/index.html and /',
          '/*.*.*.*',
          'C:\\Windows\\System32',
          '/delete-everything'
        ],
        correct_option: 0,
        answer: '/index.html and /'
      },
      {
        question: 'What is a best practice for managing cloud costs when doing hands-on student labs on AWS?',
        options: [
          'Leave all resources running indefinitely',
          'Set up an AWS Budget Alert and clean up/delete test resources (CloudFront distributions, S3 buckets) once evaluation is complete',
          'Share your root password publicly on GitHub',
          'Never use the AWS Free Tier'
        ],
        correct_option: 1,
        answer: 'Set up an AWS Budget Alert and clean up/delete test resources (CloudFront distributions, S3 buckets) once evaluation is complete'
      },
      {
        question: 'To complete the final internship submission, which email address should students send their deliverables to?',
        options: [
          'dakhedusolutions@gmail.com with Full Name and Intern ID',
          'support@amazon.com',
          'google@gmail.com',
          'admin@localhost:3000'
        ],
        correct_option: 0,
        answer: 'dakhedusolutions@gmail.com with Full Name and Intern ID'
      }
    ]
  }
];
