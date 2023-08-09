# WordPlay

## Overview

[WordPlay](https://main.d36gsd7ijqrswq.amplifyapp.com/) is a web-based application developed to provide an easily accessible platform for acronyms and abbreviations.

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Technologies used

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

![wordplay drawio](https://github.com/owxiang/wordplay/assets/22820037/12b554f8-9ddc-4f64-9328-a2d40ea1b17f)

## Getting Started

Clone the repo

```
https://github.com/owxiang/wordplay.git
```

## Configurations

**Local Environment variables**

Create a `.env.local` file at the root of project (if you don't already have one).

Add API Gateway Invoke URL to this file:

`NEXT_PUBLIC_API_URL = API-GATEWAY-INVOKE-URL `

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

- SES Production Access
  - Currnetly I am only able to send and receive OTP with my personal email.
- Duplication checker
- Export
