import json
import os
import boto3


def lambda_handler(event, context):
    body = json.loads(event.get("body", "{}"))
    provided_password = body.get("password", "")

    ssm = boto3.client('ssm')
    admin_pw = ssm.get_parameter(
        Name='wordplay-admin-password')['Parameter']['Value']

    if provided_password == admin_pw:
        return {
            "statusCode": 200,
            "body": json.dumps({
                "message": "Authenticated"
            })
        }
    else:
        return {
            "statusCode": 401,
            "body": json.dumps({
                "message": "Unauthorized"
            })
        }
