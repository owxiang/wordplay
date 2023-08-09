## WordPlay

### Overview

[WordPlay](https://main.d36gsd7ijqrswq.amplifyapp.com/) is a web-based application designed to provide an easily accessible platform for acronyms and abbreviations.

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).



### Technologies used

- AWS Lambda
- AWS DynamoDB
- AWS SES
- AWS API Gateway
- AWS Systems Manager
- AWS Amplify

### Cloud Architecture

![wordplay drawio](https://github.com/owxiang/wordplay/assets/22820037/dddad36a-1511-49c9-ae4f-8ed9bf468dc4)

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
