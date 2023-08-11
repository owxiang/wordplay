# WordPlay

## Overview

[WordPlay](https://main.d36gsd7ijqrswq.amplifyapp.com/) is a web-based application developed to provide an easily accessible platform for acronyms and abbreviations.

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Technologies

- AWS Lambda
  - See codes [here](https://github.com/owxiang/wordplay/tree/main/aws).
- AWS DynamoDB
- AWS Simple Email Service
- AWS API Gateway
- AWS Systems Manager
- AWS Amplify
- Next.js
- Python

## Cloud Architecture

![wordplay drawio](https://github.com/owxiang/wordplay/assets/22820037/50af6a64-56b5-4172-8c70-930c1926d32b)

## Getting Started

Clone the repo

```
git clone https://github.com/owxiang/wordplay.git
```

## Configurations

**Local Environment variables**

Create a `.env.local` file at the root of project.

Add API Gateway Invoke URL to this file:

`NEXT_PUBLIC_API_URL = API-GATEWAY-INVOKE-URL`

**Amplify Environment variables**

Click on "Environment variables" to manage environment variables.

Click on the "Edit" button, and then "Add environment variable". Input the name and value for environment variable for API Gateway Invoke URL:

Name: `NEXT_PUBLIC_API_URL`

Value: `API-GATEWAY-INVOKE-URL`

## Run the app

```
npm run dev
```

## Future Work

- Refactor -
  - Break code into seperate state hooks, effect hooks, event handlers and render logic files.
- SES Production Access
  - Currently I'm only able to send and receive OTP using my personal email.
- Duplicate checker
- Batch import
- IaC
