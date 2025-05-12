# Serverless Chat Room (React + Node.js)

A fully serverless web application for real-time chatting, built with modern cloud technologies and deployed via AWS Amplify Hosting.

🔗 **Live Demo**: [https://staging.d1xsb7yotrm5oo.amplifyapp.com/](https://staging.d1xsb7yotrm5oo.amplifyapp.com/)

---

## 🚀 Features

- **Frontend**: Built with **React**, styled using **Bootstrap**, and integrated with **AWS Amplify UI** components for authentication and UI flows
- **Authentication**: Secure user registration/login via **AWS Cognito**, managed through Amplify
- **Backend**: Implemented using **Node.js AWS Lambda**, exposing RESTful `/messages` API via **API Gateway** with **Cognito Authorizer**
- **Database**: Stores messages in **Amazon DynamoDB** for fast, scalable NoSQL persistence
- **Hosting**: Deployed using **AWS Amplify Hosting** with CI/CD from GitHub repo
- **Storage**: Uses **Amazon S3** for file storage (not static website hosting)
- **Live Chatroom UI**: Polling-enabled dynamic UI to reflect new messages in real time

---

## 🛠️ Architecture

```text
React (Amplify UI, Bootstrap)
          |
          ▼
   AWS Amplify Hosting
          |
          ▼
AWS API Gateway → Lambda (Node.js) → DynamoDB
          ▲
          |
     AWS Cognito (Auth)


**##** 📦 **Tech Stack**
Frontend: React, Bootstrap, AWS Amplify

Backend: Node.js, AWS Lambda, API Gateway

Authentication: AWS Cognito

Database: Amazon DynamoDB

Storage: Amazon S3

Hosting: AWS Amplify Hosting
