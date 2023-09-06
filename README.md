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

## Not Getting Started

There is no local-only setup.

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

## Future Work

- Feature
  - :white_check_mark: Pending status export
  - :white_check_mark: Duplicate checker
  - :white_check_mark: Batch Import
  - Contributor leaderboard
  - Able to select reject reason + notify user on approval status
- Code
  - Refactor
    - Unbundle code into seperate state hooks, effect hooks, event handlers and render logic files
  - Use Global Secondary Index
    - To achieve simple Query operation to retrieve all items with the specific status, which will be much faster and cost-efficient compared to the Scan operation
  - IaC
- Others
  - SES Production Access
    - Currently I'm only able to send and receive OTP using my personal email
