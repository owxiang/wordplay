## WordPlay Project

### Overview

WordPlay is a web-based application designed for Abbreviation and Acyonm pairing.

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

### Technologies Used

1. AWS Lambda: Serverless functions are utilized to handle backend operations such as generating OTPs and communicating with other AWS services like DynamoDB and SES.
2. Amazon DynamoDB: A NoSQL database service where OTPs and associated data are stored.
3. Amazon SES (Simple Email Service): Used to send OTPs to user email addresses.
4. Amazon API Gateway: Manages and handles HTTP requests to AWS Lambda functions, providing a scalable solution to manage API calls.
5. React: Frontend development framework used for building the UI of the application.
6. CORS Configuration: To handle and allow cross-origin requests from the frontend to the backend.

## Getting Started

First, run the development server:

```
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
