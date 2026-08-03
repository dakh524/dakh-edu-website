export const FULL_STACK_MODULES = [
  {
    id: 'fs_mod_1',
    week_number: 1,
    title: 'HTML & Semantic Web Basics',
    task_details: `Task 1: Build a Personal Portfolio Website with Home, About, Skills, Projects, and Contact sections using semantic HTML.

Task 2: Create a Multi-Page College Event Website with navigation, tables, forms, images, videos, and hyperlinks.`,
    videos: [
      { title: 'Week 1 - Day 1', url: 'https://youtu.be/i40T3A2DSms', duration: 'Unknown' },
      { title: 'Week 1 - Day 2', url: 'https://youtu.be/LCxffRN5Aa0', duration: 'Unknown' },
      { title: 'Week 1 - Day 3', url: 'https://youtu.be/ZQfqupyZoaI', duration: 'Unknown' },
      { title: 'Week 1 - Day 4', url: 'https://youtu.be/OZbPtfcLX-0', duration: 'Unknown' },
      { title: 'Week 1 - Day 5', url: 'https://youtu.be/Z0oZzAL4Zkk', duration: 'Unknown' }
    ],
    quiz_data: [
      {
        question: 'Which HTML tag is used to define a navigation link section?',
        options: ['<nav>', '<section>', '<header>', '<link>'],
        correct_option: 0,
        answer: '<nav>'
      },
      {
        question: 'What is the correct HTML element for inserting a line break?',
        options: ['<break>', '<lb>', '<br>', '<hr>'],
        correct_option: 2,
        answer: '<br>'
      },
      {
        question: 'Which element is semantic and indicates that its content is self-contained and could be distributed independently?',
        options: ['<div>', '<article>', '<section>', '<span>'],
        correct_option: 1,
        answer: '<article>'
      },
      {
        question: 'How can you open a link in a new tab/browser window?',
        options: ['<a href="url" target="new">', '<a href="url" target="_blank">', '<a href="url" new>', '<a href="url" tab="new">'],
        correct_option: 1,
        answer: '<a href="url" target="_blank">'
      },
      {
        question: 'Which tag is used to define an HTML table?',
        options: ['<table>', '<tbl>', '<grid>', '<tabular>'],
        correct_option: 0,
        answer: '<table>'
      },
      {
        question: 'What is the correct HTML for creating a hyperlink?',
        options: ['<a url="http://example.com">Example</a>', '<a>http://example.com</a>', '<a href="http://example.com">Example</a>', '<link src="http://example.com">Example</link>'],
        correct_option: 2,
        answer: '<a href="http://example.com">Example</a>'
      },
      {
        question: 'Which of the following is NOT a semantic HTML element?',
        options: ['<header>', '<footer>', '<div>', '<main>'],
        correct_option: 2,
        answer: '<div>'
      },
      {
        question: 'What is the purpose of the <form> element in HTML?',
        options: ['To draw shapes on a webpage', 'To create a database', 'To collect user input', 'To style text'],
        correct_option: 2,
        answer: 'To collect user input'
      },
      {
        question: 'Which attribute is used to provide an alternate text for an image?',
        options: ['title', 'alt', 'src', 'longdesc'],
        correct_option: 1,
        answer: 'alt'
      },
      {
        question: 'In HTML tables, what does the <tr> tag define?',
        options: ['Table row', 'Table record', 'Table cell', 'Table header'],
        correct_option: 0,
        answer: 'Table row'
      }
    ]
  },
  {
    id: 'fs_mod_2',
    week_number: 2,
    title: 'CSS Styling & Responsive Design',
    task_details: `Task 1: Convert your portfolio into a fully responsive website using Flexbox, Grid, and Media Queries.

Task 2: Design a modern landing page for a startup/business with responsive layouts, animations, and hover effects.`,
    videos: [
      { title: 'Week 2 - Day 1', url: 'https://youtu.be/Oso-UnPRu3Y', duration: 'Unknown' },
      { title: 'Week 2 - Day 2', url: 'https://youtu.be/is8s-092lBA', duration: 'Unknown' },
      { title: 'Week 2 - Day 3', url: 'https://youtu.be/SNLh1nATqJM', duration: 'Unknown' },
      { title: 'Week 2 - Day 4', url: 'https://youtu.be/7WJnDApa51A', duration: 'Unknown' },
      { title: 'Week 2 - Day 5', url: 'https://youtu.be/weiEatkc3A4', duration: 'Unknown' }
    ],
    quiz_data: [
      {
        question: 'What does CSS stand for?',
        options: ['Cascading Style Sheets', 'Computer Style Sheets', 'Creative Style Sheets', 'Colorful Style Sheets'],
        correct_option: 0,
        answer: 'Cascading Style Sheets'
      },
      {
        question: 'Which property is used to change the background color?',
        options: ['color', 'bgcolor', 'background-color', 'bg-color'],
        correct_option: 2,
        answer: 'background-color'
      },
      {
        question: 'How do you center an element using Flexbox?',
        options: ['display: flex; align-items: center; justify-content: center;', 'display: block; margin: auto;', 'text-align: center;', 'float: center;'],
        correct_option: 0,
        answer: 'display: flex; align-items: center; justify-content: center;'
      },
      {
        question: 'Which CSS property controls the text size?',
        options: ['text-style', 'font-size', 'text-size', 'font-style'],
        correct_option: 1,
        answer: 'font-size'
      },
      {
        question: 'What is the purpose of media queries in CSS?',
        options: ['To play audio and video', 'To apply different styles based on device characteristics like screen width', 'To query a database from CSS', 'To print documents'],
        correct_option: 1,
        answer: 'To apply different styles based on device characteristics like screen width'
      },
      {
        question: 'In CSS Grid, which property is used to specify the number and size of columns?',
        options: ['grid-template-rows', 'grid-columns', 'grid-template-columns', 'column-count'],
        correct_option: 2,
        answer: 'grid-template-columns'
      },
      {
        question: 'Which CSS pseudo-class is used to apply styles when a user points at an element?',
        options: [':hover', ':focus', ':active', ':visited'],
        correct_option: 0,
        answer: ':hover'
      },
      {
        question: 'What is the correct syntax for a CSS animation?',
        options: ['@animate', '@keyframes', 'animation-name', 'transition'],
        correct_option: 1,
        answer: '@keyframes'
      },
      {
        question: 'Which property is used to create space around elements, outside of any defined borders?',
        options: ['padding', 'spacing', 'margin', 'border-spacing'],
        correct_option: 2,
        answer: 'margin'
      },
      {
        question: 'How do you select an element with id "demo" in CSS?',
        options: ['.demo', '#demo', '*demo', 'demo'],
        correct_option: 1,
        answer: '#demo'
      }
    ]
  },
  {
    id: 'fs_mod_3',
    week_number: 3,
    title: 'JavaScript Fundamentals & DOM Manipulation',
    task_details: `Task 1: Develop a To-Do List Application with Add, Edit, Delete, Search, and Local Storage functionality.

Task 2: Build a Weather Application that fetches live weather data using a public API.`,
    videos: [
      { title: 'Week 3 - Day 1', url: 'https://youtu.be/-ZGGJ2Y28lI', duration: 'Unknown' },
      { title: 'Week 3 - Day 2 & 3', url: 'https://youtu.be/HI1rog-qTRM', duration: 'Unknown' },
      { title: 'Week 3 - Day 4', url: 'https://youtu.be/vTDqhsDnWKQ', duration: 'Unknown' },
      { title: 'Week 3 - Day 5', url: 'https://youtu.be/U5mqLAqubiw', duration: 'Unknown' }
    ],
    quiz_data: [
      {
        question: 'Inside which HTML element do we put the JavaScript?',
        options: ['<scripting>', '<javascript>', '<js>', '<script>'],
        correct_option: 3,
        answer: '<script>'
      },
      {
        question: 'How do you write "Hello World" in an alert box?',
        options: ['msg("Hello World");', 'alert("Hello World");', 'msgBox("Hello World");', 'console.log("Hello World");'],
        correct_option: 1,
        answer: 'alert("Hello World");'
      },
      {
        question: 'How do you create a function in JavaScript?',
        options: ['function:myFunction()', 'function = myFunction()', 'function myFunction()', 'create myFunction()'],
        correct_option: 2,
        answer: 'function myFunction()'
      },
      {
        question: 'How to write an IF statement in JavaScript?',
        options: ['if i == 5 then', 'if i = 5 then', 'if (i == 5)', 'if i = 5'],
        correct_option: 2,
        answer: 'if (i == 5)'
      },
      {
        question: 'Which method is used to parse a JSON string into a JavaScript object?',
        options: ['JSON.parse()', 'JSON.stringify()', 'JSON.toObject()', 'JSON.read()'],
        correct_option: 0,
        answer: 'JSON.parse()'
      },
      {
        question: 'What is the purpose of the fetch() API?',
        options: ['To retrieve data from a server or API', 'To fetch local files', 'To search the DOM', 'To fetch images exclusively'],
        correct_option: 0,
        answer: 'To retrieve data from a server or API'
      },
      {
        question: 'Which object provides a mechanism for storing key-value pairs in the browser that persist across sessions?',
        options: ['sessionStorage', 'documentStorage', 'localStorage', 'browserStorage'],
        correct_option: 2,
        answer: 'localStorage'
      },
      {
        question: 'What does DOM stand for?',
        options: ['Document Object Model', 'Data Object Model', 'Document Oriented Model', 'Dynamic Object Management'],
        correct_option: 0,
        answer: 'Document Object Model'
      },
      {
        question: 'How do you add an element to the end of an array in JavaScript?',
        options: ['array.add()', 'array.push()', 'array.append()', 'array.insert()'],
        correct_option: 1,
        answer: 'array.push()'
      },
      {
        question: 'Which keyword is used to declare a block-scoped variable that can be reassigned?',
        options: ['var', 'const', 'let', 'set'],
        correct_option: 2,
        answer: 'let'
      }
    ]
  },
  {
    id: 'fs_mod_4',
    week_number: 4,
    title: 'React Basics & State Management',
    task_details: `Task 1: Convert the To-Do List into a React application using functional components, Hooks, and React Router.

Task 2: Develop an Expense Tracker in React with state management and local storage.`,
    videos: [
      { title: 'Week 4 Tutorial', url: 'https://youtu.be/0LWv-CSrAmo', duration: 'Unknown' }
    ],
    quiz_data: [
      {
        question: 'What is React?',
        options: ['A backend framework', 'A JavaScript library for building user interfaces', 'A database management system', 'A CSS framework'],
        correct_option: 1,
        answer: 'A JavaScript library for building user interfaces'
      },
      {
        question: 'What is JSX?',
        options: ['A type of JavaScript extension that allows writing HTML in React', 'A new programming language', 'A database query language', 'A styling method in React'],
        correct_option: 0,
        answer: 'A type of JavaScript extension that allows writing HTML in React'
      },
      {
        question: 'Which hook is used to manage state in a functional component?',
        options: ['useEffect', 'useState', 'useContext', 'useReducer'],
        correct_option: 1,
        answer: 'useState'
      },
      {
        question: 'How do you pass data from a parent component to a child component?',
        options: ['Using state', 'Using props', 'Using contexts', 'Using refs'],
        correct_option: 1,
        answer: 'Using props'
      },
      {
        question: 'Which hook is used to perform side effects in a functional component?',
        options: ['useState', 'useEffect', 'useMemo', 'useCallback'],
        correct_option: 1,
        answer: 'useEffect'
      },
      {
        question: 'What is React Router used for?',
        options: ['To manage global state', 'To connect to a database', 'To enable navigation among views/components in a React application', 'To route API requests'],
        correct_option: 2,
        answer: 'To enable navigation among views/components in a React application'
      },
      {
        question: 'What happens when the state of a React component changes?',
        options: ['The component re-renders', 'The page reloads', 'Nothing happens', 'The application crashes'],
        correct_option: 0,
        answer: 'The component re-renders'
      },
      {
        question: 'Why is it important to use a "key" prop in React lists?',
        options: ['To apply CSS styles', 'To help React identify which items have changed, been added, or been removed', 'To encrypt data', 'To link to other pages'],
        correct_option: 1,
        answer: 'To help React identify which items have changed, been added, or been removed'
      },
      {
        question: 'What does the useState hook return?',
        options: ['The current state value and a function to update it', 'Only the current state value', 'Only a function to update the state', 'An HTML element'],
        correct_option: 0,
        answer: 'The current state value and a function to update it'
      },
      {
        question: 'How can you prevent default form submission behavior in React?',
        options: ['event.stopPropagation()', 'event.preventDefault()', 'return false', 'event.stop()'],
        correct_option: 1,
        answer: 'event.preventDefault()'
      }
    ]
  },
  {
    id: 'fs_mod_5',
    week_number: 5,
    title: 'Backend with Node.js, Express & MongoDB + Deployment',
    task_details: `Task 1: Build REST APIs using Node.js, Express.js, and MongoDB with complete CRUD operations for your selected project.

Task 2: Deploy your full-stack application, upload the source code to GitHub, and submit the GitHub repository, live project link, and a 3–5 minute demo video.

FINAL CAPSTONE PROJECTS (Choose ONE):
1. Photography Portfolio & Booking Website (User Auth, Gallery, Booking Form, Admin Panel)
2. E-Commerce Website (User Auth, Catalog, Cart/Checkout, Order History, Admin Dashboard)
3. Barber Shop Management System (User Auth, Services, Appointments, Admin Dashboard)

Final Submission Requirements:
✅ GitHub Repository
✅ Live Project Deployment
✅ Project Documentation (README)
✅ 3–5 Minute Project Demo Video
✅ Presentation explaining the project workflow and features`,
    videos: [
      { title: 'Week 5 Tutorial', url: 'https://youtu.be/SGgjd0hPv6s', duration: 'Unknown' }
    ],
    quiz_data: [
      {
        question: 'What is Node.js?',
        options: ['A frontend framework', 'A JavaScript runtime built on Chrome\'s V8 JavaScript engine', 'A relational database', 'A styling library'],
        correct_option: 1,
        answer: 'A JavaScript runtime built on Chrome\'s V8 JavaScript engine'
      },
      {
        question: 'What is Express.js?',
        options: ['A database', 'A fast, unopinionated, minimalist web framework for Node.js', 'A frontend library', 'An operating system'],
        correct_option: 1,
        answer: 'A fast, unopinionated, minimalist web framework for Node.js'
      },
      {
        question: 'What type of database is MongoDB?',
        options: ['Relational (SQL)', 'NoSQL Document Database', 'Graph Database', 'Key-Value Store'],
        correct_option: 1,
        answer: 'NoSQL Document Database'
      },
      {
        question: 'What does CRUD stand for?',
        options: ['Create, Read, Update, Delete', 'Copy, Read, Upload, Download', 'Create, Retrieve, Upload, Delete', 'Compute, Read, Update, Deploy'],
        correct_option: 0,
        answer: 'Create, Read, Update, Delete'
      },
      {
        question: 'Which HTTP method is typically used to create a new resource in a REST API?',
        options: ['GET', 'POST', 'PUT', 'DELETE'],
        correct_option: 1,
        answer: 'POST'
      },
      {
        question: 'What is Mongoose?',
        options: ['An animal', 'An Object Data Modeling (ODM) library for MongoDB and Node.js', 'A frontend component', 'A deployment platform'],
        correct_option: 1,
        answer: 'An Object Data Modeling (ODM) library for MongoDB and Node.js'
      },
      {
        question: 'Which HTTP method is used to retrieve data from a server?',
        options: ['POST', 'GET', 'PUT', 'DELETE'],
        correct_option: 1,
        answer: 'GET'
      },
      {
        question: 'What is the purpose of Git in software development?',
        options: ['To host websites', 'To manage databases', 'Version control and tracking changes in source code', 'To style HTML pages'],
        correct_option: 2,
        answer: 'Version control and tracking changes in source code'
      },
      {
        question: 'What is a REST API?',
        options: ['An API that uses Representational State Transfer architecture constraints', 'A database', 'A frontend component', 'A type of operating system'],
        correct_option: 0,
        answer: 'An API that uses Representational State Transfer architecture constraints'
      },
      {
        question: 'Why is a `.env` file used in Node.js applications?',
        options: ['To write CSS styles', 'To store environment variables like database URIs and secret keys securely', 'To define HTML structure', 'To write database queries'],
        correct_option: 1,
        answer: 'To store environment variables like database URIs and secret keys securely'
      }
    ]
  }
];
