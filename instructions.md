What to build
Build a web application that allows healthcare professionals to input patient symptoms and receive AI-generated insights and recommendations based on those symptoms.

HealthTrack is a fictional healthcare startup aimed at improving patient diagnosis through AI. The primary user is a healthcare professional who needs to quickly analyze patient symptoms to provide better care. A good submission demonstrates clean code structure, effective handling of edge cases, meaningful commit messages, and thorough documentation of the design and trade-offs made.
Requirements
Must: Implement a form where healthcare professionals can input patient symptoms.
How it's checked: Given the form is filled with symptoms, when submitted, the application should display a summary of the input symptoms.
Must: Integrate a large language model (LLM) to analyze the symptoms and provide a list of potential conditions.
How it's checked: When symptoms are submitted, the application should return at least three potential conditions based on the input.
Should: Provide a feature that allows users to save and retrieve previous symptom analyses.
How it's checked: The application should allow users to view a list of previously analyzed symptoms and their corresponding conditions.
Must: Implement data validation to ensure that the symptoms inputted are in a valid format.
How it's checked: If invalid symptoms are submitted, the application should display an error message indicating the issue.
Should: Create a caching layer for frequently queried symptoms to improve response time.
How it's checked: The application should respond faster for symptoms that have been previously analyzed.
Must: Document the architecture of the application and the trade-offs made, particularly regarding the caching strategy.
How it's checked: The README file should include a section on architecture and trade-offs, explaining the caching strategy used.
Could: Implement role-based access control to restrict certain features to authorized users only.
How it's checked: Unauthorized users should not be able to access the feature for saving symptom analyses.
Deliverables
Public GitHub repository with the application code
Short narrated video demo of the application
Your code with the full source and a README — a public GitHub repository or a .zip upload
A screen-share demo video (max 8 min, 200 MB): share the screen running your app and walk through how it meets each requirement, then briefly (about 1-2 minutes) walk through the code that does the main work and explain why you built it that way, with your webcam on so we can see you present your own work
A README with setup/run steps and the key decisions you made
A README "AI usage" section: name the AI tools you used, which parts of the work they touched, and what you verified or changed afterwards
AI policy
AI tools may be used. Disclose your AI usage in the README: which tools, which parts of the work they touched, and what you verified or changed.

How you're scored
Requirement coverage	26%
Technical explanation	18%
Code quality & architecture	16%
Code walkthrough	10%
Testing	9%
Security & correctness	7%
Documentation & README	5%
Git hygiene	5%
UX & polish	4%