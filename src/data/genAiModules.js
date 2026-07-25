export const GEN_AI_MODULES = [
  {
    id: 'gen_ai_mod_1',
    week_number: 1,
    title: 'Foundations — AI, ML, LLMs, Prompt Engineering & Responsible AI',
    task_details: `Goal: Understand what Generative AI is, how it relates to AI/ML/DL and LLMs, write effective prompts, and start thinking about responsible use.

Task 1 – Explore a Generative AI Tool: Choose one AI tool (ChatGPT, Gemini, Claude AI, or Copilot), create a free account if required, and explore the interface. Submission: Screenshot of the AI tool homepage + name of the tool selected.

Task 2 – Write Your First Prompt: Ask: "Explain Generative AI in simple words for a beginner." Then improve it: "Explain Generative AI in simple words with three real-life examples that a college student can understand." Compare both responses. Submission: Original prompt, improved prompt, screenshots of both responses.

Task 3 – Generate AI Content: Use your AI tool to generate ONE of: Professional Email, Motivational Quote, Short Story, LinkedIn Post, or Poem. Submission: Prompt used, generated output, screenshot.

Task 4 – Compare Two AI Tools: Ask two different AI assistants the same question: "What is Artificial Intelligence?" Compare on: Easy to Understand, Response Speed, Better Explanation, Overall Rating (/5). Submission: Completed comparison table.

Task 5 – Responsible AI Reflection: Write 100–150 words on "Why should Generative AI be used responsibly?" — include one benefit, one limitation, one ethical concern, and your opinion. Submission: PDF or Word document.`,
    videos: [
      { title: 'Generative AI Explained | Gen AI for Beginners 2026', url: 'https://www.youtube.com/watch?v=JPOFl8xs048', duration: '15:00' },
      { title: '(FREE) AI Full Course for Beginners | Artificial Intelligence Tutorial 2026', url: 'https://www.youtube.com/watch?v=OKm38gvxCNY', duration: '20:00' },
      { title: 'Machine Learning vs Deep Learning - Key Differences Explained', url: 'https://youtu.be/LxDBT2JmfLk', duration: '12:00' },
      { title: 'Large Language Models Explained | LLM Basics for Beginners', url: 'https://www.youtube.com/watch?v=gnZ_Yg8qBDs', duration: '18:00' },
      { title: 'Prompt Engineering Tutorial – Master ChatGPT and LLM Responses', url: 'https://www.youtube.com/watch?v=_ZvnD73m40o', duration: '22:00' }
    ],
    quiz_data: [
      {
        question: 'What is Generative AI?',
        options: ['A tool used only for creating websites', 'A type of Artificial Intelligence that creates new content such as text, images, audio, or code', 'A computer operating system', 'A cloud storage service'],
        correct_option: 1,
        answer: 'A type of Artificial Intelligence that creates new content such as text, images, audio, or code'
      },
      {
        question: 'Which of the following is a Large Language Model (LLM)?',
        options: ['ChatGPT', 'Microsoft Paint', 'VLC Media Player', 'Calculator'],
        correct_option: 0,
        answer: 'ChatGPT'
      },
      {
        question: 'Which company developed ChatGPT?',
        options: ['Google', 'Microsoft', 'OpenAI', 'IBM'],
        correct_option: 2,
        answer: 'OpenAI'
      },
      {
        question: 'What is Prompt Engineering?',
        options: ['Building computer hardware', 'Writing effective instructions for AI to generate better responses', 'Creating databases', 'Installing software'],
        correct_option: 1,
        answer: 'Writing effective instructions for AI to generate better responses'
      },
      {
        question: 'Which of the following is a Generative AI application?',
        options: ['Image Generation', 'Text Generation', 'Code Generation', 'All of the above'],
        correct_option: 3,
        answer: 'All of the above'
      },
      {
        question: 'Which AI tool is developed by Google?',
        options: ['Claude', 'Gemini', 'ChatGPT', 'Copilot'],
        correct_option: 1,
        answer: 'Gemini'
      },
      {
        question: 'Which statement best describes Machine Learning?',
        options: ['A subset of Artificial Intelligence where computers learn from data', 'A programming language', 'A web browser', 'A database system'],
        correct_option: 0,
        answer: 'A subset of Artificial Intelligence where computers learn from data'
      },
      {
        question: 'Why is Prompt Engineering important?',
        options: ['It increases internet speed', 'It helps AI understand user requirements more accurately', 'It reduces storage space', 'It installs software automatically'],
        correct_option: 1,
        answer: 'It helps AI understand user requirements more accurately'
      },
      {
        question: 'Which of the following is considered responsible AI usage?',
        options: ['Sharing false AI-generated information without checking', 'Verifying AI-generated content before using it', 'Copying AI content without review', 'Ignoring ethical considerations'],
        correct_option: 1,
        answer: 'Verifying AI-generated content before using it'
      },
      {
        question: 'Which of the following is a benefit of Generative AI?',
        options: ['Automates repetitive tasks and improves productivity', 'Eliminates the need for human thinking', 'Guarantees 100% accurate answers every time', 'Works without any user input'],
        correct_option: 0,
        answer: 'Automates repetitive tasks and improves productivity'
      }
    ]
  },
  {
    id: 'gen_ai_mod_2',
    week_number: 2,
    title: 'Advanced Prompting, Embeddings & Retrieval-Augmented Generation (RAG)',
    task_details: `Goal: Go beyond basic prompting, understand how AI "remembers" and retrieves information (embeddings, vector databases), and grasp how RAG makes AI answers more accurate and grounded.

Task 1 – Advanced Prompting Practice: Ask your AI tool a moderately complex question (e.g., "Plan a 3-day marketing campaign for a small bakery") first with a plain/zero-shot prompt, then again using a chain-of-thought prompt (e.g., "Think step by step: first identify the target audience, then..."). Submission: Both prompts, both responses, and 2–3 sentences on which was more useful and why.

Task 2 – Explain Embeddings & Vector Databases in Your Own Words: Watch the videos above, then write a short explanation (in your own words, not copy-pasted) of: what an embedding is, and why a vector database is needed for AI search. Submission: 100–150 word written explanation.

Task 3 – Simulate a RAG Workflow: Paste a short document (e.g., your college's official notice, a product manual, or a Wikipedia paragraph) into your AI tool and ask 3 questions that can ONLY be answered from that document. Notice how the AI grounds its answers in the text you provided. Submission: Document/source used, the 3 questions, and the AI's answers.

Task 4 – Build a "Document-Only" Assistant Prompt: Write a system-style prompt that instructs the AI to answer questions using ONLY the information you give it, and to say "I don't know" if the answer isn't in the provided text. Test it with one question that IS answerable and one that is NOT. Submission: The system prompt and both test results.

Task 5 – Reflection: Why RAG Matters: Write 100–150 words on: "Why is Retrieval-Augmented Generation useful for reducing AI hallucinations in real business use cases?" Submission: Written reflection.`,
    videos: [
      { title: 'Every Prompt Engineering Technique Explained in 8 Minutes', url: 'https://www.youtube.com/watch?v=fV6YNnt71lw', duration: '8:00' },
      { title: 'Mastering Prompt Engineering: From Basics to Advanced Techniques', url: 'https://www.youtube.com/playlist?list=PLLR99_kkBorr8UnOMe5ZOqAmpjLElU0ky', duration: '40:00' },
      { title: 'Embeddings & Vector Databases Explained', url: 'https://www.youtube.com/watch?v=rw1YfQQttfo', duration: '15:00' },
      { title: 'Vector Database Explained in under 3 Minutes', url: 'https://www.youtube.com/watch?v=juR4EQ7WsrQ', duration: '3:00' },
      { title: 'RAG Explained in 20 Minutes | Retrieval Augmented Generation', url: 'https://www.youtube.com/watch?v=RosLeHGBLoY', duration: '20:00' }
    ],
    quiz_data: [
      {
        question: 'What is "chain-of-thought" prompting?',
        options: ['Asking the AI to respond in one word', 'Asking the AI to reason step-by-step before giving a final answer', 'Chaining multiple unrelated AI tools together', 'A way to speed up AI responses'],
        correct_option: 1,
        answer: 'Asking the AI to reason step-by-step before giving a final answer'
      },
      {
        question: 'What is an "embedding" in the context of Generative AI?',
        options: ['A picture embedded in a document', 'A numerical representation of text (or other data) that captures its meaning', 'A type of computer chip', 'A way to encrypt passwords'],
        correct_option: 1,
        answer: 'A numerical representation of text (or other data) that captures its meaning'
      },
      {
        question: 'Why can\'t a traditional keyword search find documents that use different words but the same meaning?',
        options: ['Because it only understands the exact words typed, not the underlying meaning', 'Because it is too slow', 'Because it requires a GPU', 'Because it only works with images'],
        correct_option: 0,
        answer: 'Because it only understands the exact words typed, not the underlying meaning'
      },
      {
        question: 'What is a vector database mainly used for?',
        options: ['Storing and quickly retrieving embeddings based on similarity of meaning', 'Storing video files only', 'Replacing spreadsheets', 'Sending emails'],
        correct_option: 0,
        answer: 'Storing and quickly retrieving embeddings based on similarity of meaning'
      },
      {
        question: 'What does RAG (Retrieval-Augmented Generation) do?',
        options: ['Deletes old AI models', 'Retrieves relevant information from a data source and gives it to the AI before it generates an answer', 'Randomly generates answers', 'Trains a brand-new AI model from scratch'],
        correct_option: 1,
        answer: 'Retrieves relevant information from a data source and gives it to the AI before it generates an answer'
      },
      {
        question: 'What is a key benefit of using RAG in an AI application?',
        options: ['It makes the AI\'s answers more accurate and grounded in real, up-to-date information', 'It removes the need for any prompts', 'It makes the AI slower on purpose', 'It guarantees the AI never makes mistakes'],
        correct_option: 0,
        answer: 'It makes the AI\'s answers more accurate and grounded in real, up-to-date information'
      },
      {
        question: 'What is "few-shot prompting"?',
        options: ['Giving the AI a few examples of the desired input/output before asking your real question', 'Asking a question only once', 'Limiting the AI to a few words', 'Using a low-resolution image'],
        correct_option: 0,
        answer: 'Giving the AI a few examples of the desired input/output before asking your real question'
      },
      {
        question: 'In a "document-only" assistant prompt, what should the AI do if the answer isn\'t in the provided document?',
        options: ['Make up a plausible-sounding answer anyway', 'Say it doesn\'t know rather than guessing', 'Ignore the question', 'Shut down'],
        correct_option: 1,
        answer: 'Say it doesn\'t know rather than guessing'
      },
      {
        question: 'Why do LLMs sometimes "hallucinate" (produce incorrect information)?',
        options: ['Because they generate the most statistically likely next words, which isn\'t always factually correct', 'Because they are connected to the internet at all times', 'Because they refuse to answer difficult questions', 'Because they only work with images'],
        correct_option: 0,
        answer: 'Because they generate the most statistically likely next words, which isn\'t always factually correct'
      },
      {
        question: 'Which of these is an example of a vector database used in real-world Generative AI applications?',
        options: ['Pinecone or FAISS-style databases used to power semantic search', 'A regular spreadsheet', 'A printed catalog', 'A physical filing cabinet'],
        correct_option: 0,
        answer: 'Pinecone or FAISS-style databases used to power semantic search'
      }
    ]
  },
  {
    id: 'gen_ai_mod_3',
    week_number: 3,
    title: 'AI Agents, Custom Assistants & Multimodal Generative AI',
    task_details: `Goal: Understand how AI can take multi-step actions (agents), build a simple custom AI assistant without code, and explore multimodal Generative AI (image generation).

Task 1 – Build a No-Code Custom AI Assistant: Using ChatGPT's Custom GPT builder (or an equivalent free feature in Gemini/Copilot), create a small assistant with a defined name, purpose, and instructions (e.g., "Internship Buddy" that only answers questions about your internship program). Test it with 2–3 questions. Submission: Assistant name, instructions used, and screenshots of it responding.

Task 2 – Generate AI Images: Use a free AI image tool (e.g., Bing/Copilot Image Creator, Gemini, or another free tool) to generate an image. Start with a simple prompt, then refine it at least twice to improve the result. Submission: All 3 prompts used (simple → refined → final) and the corresponding generated images.

Task 3 – Design a Simple AI Agent Workflow (on paper): Pick a real task (e.g., "answering customer FAQs", "summarizing daily emails", "scheduling a meeting"). Sketch out, in plain language or a simple diagram, what an AI agent for this task would need: what triggers it, what tool(s) it would use, and what the final output would be. Submission: A short written or diagrammed workflow (5–8 steps).

Task 4 – Compare Two AI Image Generation Tools: Use two different AI image tools with the same prompt and compare them on: Image Quality, Ease of Use, Prompt Understanding, Overall Rating (/5). Submission: Completed comparison table.

Task 5 – Reflection: Agentic AI, Benefits and Risks: Write 100–150 words on: "What are the benefits and risks of letting an AI agent take actions on your behalf (e.g., sending emails, booking things) without a human checking every step?" Submission: Written reflection.`,
    videos: [
      { title: 'Langchain Tutorial For Beginners (2026 Guide) | AI Agents', url: 'https://www.youtube.com/watch?v=AOQyRiwydyo', duration: '25:00' },
      { title: 'Build Your Own AI Agent – Full Course', url: 'https://www.youtube.com/watch?v=MnG0ugK2JAI', duration: '35:00' },
      { title: 'How to Build a Custom GPT in ChatGPT [Beginner Tutorial]', url: 'https://www.youtube.com/watch?v=p6Z2d3T-fLM', duration: '12:00' },
      { title: 'How AI Image Generation Works', url: 'https://www.youtube.com/watch?v=Rke0V_VkF3c', duration: '18:00' },
      { title: 'AI Image Generation Made Easy', url: 'https://www.youtube.com/watch?v=qDtif1zxbkY', duration: '14:00' }
    ],
    quiz_data: [
      {
        question: 'What is an "AI agent"?',
        options: ['A human customer service representative', 'An AI system that can plan, use tools, and take multi-step actions to complete a task', 'A type of computer virus', 'A static image generator'],
        correct_option: 1,
        answer: 'An AI system that can plan, use tools, and take multi-step actions to complete a task'
      },
      {
        question: 'What is LangChain mainly used for?',
        options: ['Editing photos', 'A framework for connecting LLMs with data, tools, and other systems to build AI applications and agents', 'Compressing video files', 'Managing spreadsheets'],
        correct_option: 1,
        answer: 'A framework for connecting LLMs with data, tools, and other systems to build AI applications and agents'
      },
      {
        question: 'What does a "Custom GPT" (or custom assistant) let you do?',
        options: ['Create a specialized version of an AI assistant with its own name, instructions, and knowledge, without writing code', 'Build a computer from scratch', 'Replace your operating system', 'Design a computer chip'],
        correct_option: 0,
        answer: 'Create a specialized version of an AI assistant with its own name, instructions, and knowledge, without writing code'
      },
      {
        question: 'Which of these best describes how AI image generation models like DALL-E or Midjourney work?',
        options: ['They search the internet and copy an existing photo exactly', 'They translate a text description into an image using patterns learned from training data', 'They only work with pre-made templates', 'They require a human artist to draw the image first'],
        correct_option: 1,
        answer: 'They translate a text description into an image using patterns learned from training data'
      },
      {
        question: 'What does "multimodal" mean in Generative AI?',
        options: ['AI that can only process text', 'AI that can process and/or generate multiple types of content, such as text, images, and audio', 'AI that runs on multiple computers', 'AI that only works offline'],
        correct_option: 1,
        answer: 'AI that can process and/or generate multiple types of content, such as text, images, and audio'
      },
      {
        question: 'Why is refining an image-generation prompt (adding more detail) usually helpful?',
        options: ['It has no effect on the output', 'It helps the AI produce a result that is closer to what you actually envisioned', 'It slows down the AI on purpose', 'It removes the need for any prompt at all'],
        correct_option: 1,
        answer: 'It helps the AI produce a result that is closer to what you actually envisioned'
      },
      {
        question: 'What is one key risk of letting an AI agent take actions automatically without human review?',
        options: ['It could take an incorrect or unwanted action based on a misunderstanding', 'It will always be 100% correct', 'It removes all cybersecurity risks', 'It has no risks at all'],
        correct_option: 0,
        answer: 'It could take an incorrect or unwanted action based on a misunderstanding'
      },
      {
        question: 'In an AI agent workflow, what is a "tool"?',
        options: ['A hammer or screwdriver', 'A function or external system (e.g., a search engine, calculator, or database) that the AI can call to complete part of a task', 'A type of prompt', 'A programming language'],
        correct_option: 1,
        answer: 'A function or external system (e.g., a search engine, calculator, or database) that the AI can call to complete part of a task'
      },
      {
        question: 'Why might a business use a Custom GPT/assistant instead of the general ChatGPT interface?',
        options: ['To give the AI specific instructions, tone, and knowledge tailored to a particular use case', 'Because it is required by law', 'Because it removes the need for any prompting', 'Because it works without internet access'],
        correct_option: 0,
        answer: 'To give the AI specific instructions, tone, and knowledge tailored to a particular use case'
      },
      {
        question: 'What is a good practice when comparing two different AI tools for the same task?',
        options: ['Only test one tool and assume it\'s the best', 'Use the same prompt/input on both tools and compare results fairly', 'Change the prompt for each tool so they can\'t be compared', 'Avoid documenting the comparison'],
        correct_option: 1,
        answer: 'Use the same prompt/input on both tools and compare results fairly'
      }
    ]
  },
  {
    id: 'gen_ai_mod_4',
    week_number: 4,
    title: 'Fine-Tuning, Responsible & Safe AI, and Capstone Project',
    task_details: `Goal: Understand when and why models get fine-tuned (vs. prompting or RAG), go deeper on AI ethics, bias, and hallucination, and complete a capstone project that ties together everything learned.

Project for this week: Capstone Project (Intern's choice): Combine at least TWO features from Weeks 1–3 into one end-to-end Generative AI mini-project. Examples:
- A custom AI assistant (Week 3) that only answers from a specific document using a RAG-style prompt (Week 2)
- A prompt-engineered content generator (Week 1–2) paired with an AI image generator (Week 3) to produce a mini "social media kit"
- A simple AI agent workflow design (Week 3) combined with a responsible-AI checklist (Week 4) for a real task at Dakh Edu Solutions
No-code (prompt-based/Custom GPT) capstones are fully acceptable — coding is optional/stretch, not required.

Task 1 – Fine-Tuning vs. Prompting vs. RAG: Comparison Table: After watching the fine-tuning videos, create a simple table comparing Prompt Engineering, RAG, and Fine-Tuning on: What it changes, When to use it, Cost/effort, Example use case. Submission: Completed comparison table.

Task 2 – Responsible AI Audit: Take one AI-generated response from any earlier week's task. Review it for: possible bias, possible hallucination/fabricated facts, and anything that needed a human fact-check. Note what you found (or confirm nothing concerning was found). Submission: Short written audit (100–150 words).

Task 3 – Capstone Planning Doc: Before building, write a short plan: what problem your capstone solves, which 2+ features from Weeks 1–3 it combines, and which AI tool(s) you'll use. Submission: 1-paragraph plan.

Task 4 – Build & Submit the Capstone: Build your capstone (a working prompt/Custom GPT setup, or a small coded app if attempting the stretch option). Document the prompts used and what you changed after each iteration. Submission: Prompts/setup used, final output, and screenshots.

Task 5 – Demo & Reflect: Demo the capstone to the team (or record a short walkthrough). Write a short reflection: what worked, what you'd improve, and what you learned this internship. Submission: Demo notes/recording link + written reflection (100–150 words).`,
    videos: [
      { title: 'Fine Tuning LLM Explained Simply', url: 'https://www.youtube.com/watch?v=ezdIOLbUSWg', duration: '10:00' },
      { title: 'LLM Fine-Tuning Explained in 8 Minutes: The Only Complete Guide You Need', url: 'https://www.youtube.com/watch?v=wmCmrEijfQ0', duration: '8:00' },
      { title: 'AI Ethics, Bias, and Responsible Innovation | Kesha Williams', url: 'https://www.youtube.com/watch?v=ZPbxMzEfs2c', duration: '16:00' },
      { title: 'How to Create My Own Custom Chatbot Using OpenAI API (2026)', url: 'https://www.youtube.com/watch?v=n_OVdpfTHVc', duration: '22:00' }
    ],
    quiz_data: [
      {
        question: 'What is "fine-tuning" in the context of LLMs?',
        options: ['Adjusting your microphone settings', 'Further training a pre-trained model on specific data so it performs better on a specialized task', 'Turning the AI off and on again', 'Changing the color scheme of an app'],
        correct_option: 1,
        answer: 'Further training a pre-trained model on specific data so it performs better on a specialized task'
      },
      {
        question: 'When is it usually better to use RAG instead of fine-tuning?',
        options: ['When you need the AI to reference frequently changing or large external documents without retraining the model', 'When you never want the AI to use any external data', 'When you want to permanently change the model\'s core behavior', 'When cost and effort don\'t matter at all'],
        correct_option: 0,
        answer: 'When you need the AI to reference frequently changing or large external documents without retraining the model'
      },
      {
        question: 'What does LoRA (mentioned in fine-tuning discussions) generally help with?',
        options: ['Making fine-tuning more efficient by training small "adapter" layers instead of the entire model', 'Deleting a model completely', 'Generating images', 'Sending emails'],
        correct_option: 0,
        answer: 'Making fine-tuning more efficient by training small "adapter" layers instead of the entire model'
      },
      {
        question: 'What is "AI bias"?',
        options: ['A random computer glitch', 'Systematic unfair or skewed outputs that often reflect patterns in the training data or design choices', 'A type of hardware failure', 'A feature that speeds up AI responses'],
        correct_option: 1,
        answer: 'Systematic unfair or skewed outputs that often reflect patterns in the training data or design choices'
      },
      {
        question: 'What is a good habit for reviewing AI-generated content, per this week\'s ethics video?',
        options: ['Trust every output completely without checking', 'Critically review outputs for bias, accuracy, and fabricated information before using them', 'Never use AI outputs for anything', 'Only use AI outputs in secret'],
        correct_option: 1,
        answer: 'Critically review outputs for bias, accuracy, and fabricated information before using them'
      },
      {
        question: 'Why is documenting the prompts you used (and how you changed them) a good practice for a capstone project?',
        options: ['It\'s required by law', 'It shows the "vibe coding"/prompting process, not just the final result, which helps others learn and helps you debug', 'It slows down the project unnecessarily', 'It has no real purpose'],
        correct_option: 1,
        answer: 'It shows the "vibe coding"/prompting process, not just the final result, which helps others learn and helps you debug'
      },
      {
        question: 'Which of these is an example of a strong capstone project for this internship?',
        options: ['Copying a tutorial exactly with no changes', 'Combining at least two features learned across the weeks into one working mini-project', 'Avoiding the use of any AI tools', 'Submitting a blank document'],
        correct_option: 1,
        answer: 'Combining at least two features learned across the weeks into one working mini-project'
      },
      {
        question: 'What is the main purpose of a "Responsible AI Audit" task like the one this week?',
        options: ['To practice critically checking AI output for bias, hallucination, and accuracy before trusting it', 'To slow down your workflow for no reason', 'To prove AI is never useful', 'To replace human judgement entirely'],
        correct_option: 0,
        answer: 'To practice critically checking AI output for bias, hallucination, and accuracy before trusting it'
      },
      {
        question: 'Why is a good practice to explain what prompts were used and what changed after each iteration when demoing a project?',
        options: ['It hides the process from the audience', 'It helps the audience understand your reasoning and learn from your iteration process', 'It is meant to confuse the audience', 'It is unrelated to the demo'],
        correct_option: 1,
        answer: 'It helps the audience understand your reasoning and learn from your iteration process'
      },
      {
        question: 'What is a reasonable overall best practice for using Generative AI responsibly, based on everything covered in this 4-week program?',
        options: ['Use AI without ever verifying its outputs', 'Combine good prompting, awareness of AI\'s limitations (hallucination, bias), and human review to get reliable, useful results', 'Avoid using AI tools altogether', 'Assume AI-generated content requires no citation or review'],
        correct_option: 1,
        answer: 'Combine good prompting, awareness of AI\'s limitations (hallucination, bias), and human review to get reliable, useful results'
      }
    ]
  }
];
