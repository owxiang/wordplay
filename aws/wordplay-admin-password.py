import json
import os
import boto3
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def lambda_handler(event, context):
    try:
        body = json.loads(event.get("body", "{}"))
        provided_password = body.get("password", "")
        logger.info("Received authentication request.")

        ssm = boto3.client('ssm')
        admin_pw = ssm.get_parameter(
            Name='wordplay-admin-password')['Parameter']['Value']

        if provided_password == admin_pw:
            logger.info("Authentication successful.")
            return {
                "statusCode": 200,
                "body": json.dumps({
                    "message": "Authenticated"
                })
            }
        else:
            logger.warning(
                "Authentication failed. Unauthorized access attempt.")
            return {
                "statusCode": 401,
                "body": json.dumps({
                    "message": "Unauthorized"
                })
            }
    except Exception as e:
        logger.error(
            f"An error occurred during the authentication process: {str(e)}")
        return {
            "statusCode": 500,
            "body": json.dumps({
                "message": "Internal Server Error"
            })
        }
