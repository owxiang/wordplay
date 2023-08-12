import boto3
import random
import logging
from datetime import datetime, timedelta
import json

logger = logging.getLogger()
logger.setLevel(logging.INFO)

ses = boto3.client('ses')
dynamodb = boto3.resource('dynamodb')

try:
    table = dynamodb.Table('wordplayotp')
except dynamodb.meta.client.exceptions.ResourceNotFoundException:
    logger.error("Table 'wordplayotp' does not exist")
    exit(1)
except dynamodb.meta.client.exceptions.ClientError as e:
    logger.error(f"Error accessing table 'wordplayotp': {str(e)}")
    exit(1)


def lambda_handler(event=None, context=None):
    logger.info(f"Received event: {json.dumps(event)}")

    to_email = event['queryStringParameters']['email']
    otp = event['queryStringParameters']['otp']
    to_email = 'xiangweiong@gmail.com'

    if otp == 'none':
        logger.info(f"Generating OTP for email: {to_email}")
        generated_otp = send_otp(to_email)
        add_otp_to_dynamodb(to_email, generated_otp, context)
        return {
            "statusCode": 200,
            "body": json.dumps({
                "message": "OTP sent successfully"
            })
        }

    if otp:
        return verify_otp(to_email, otp)


def verify_otp(to_email, otp):
    logger.info(f"Verifying OTP for email: {to_email}")

    response = table.scan(
        FilterExpression='email = :emailValue AND otp = :otpValue',
        ExpressionAttributeValues={
            ':emailValue': to_email,
            ':otpValue': otp
        }
    )

    if response['Count'] > 0:
        logger.info(f"OTP verified for email: {to_email}")
        item = response['Items'][0]
        if 'ttl' in item and item['ttl'] < int(datetime.now().timestamp()):
            logger.warning("OTP has expired.")
            return {
                "statusCode": 401,
                "body": json.dumps({
                    "message": "OTP expired"
                })
            }

        table.delete_item(
            Key={
                'id': item['id']
            }
        )
        logger.info("Item deleted successfully from DynamoDB.")
        return {
            "statusCode": 200,
            "body": json.dumps({
                "message": "Authenticated"
            })
        }
    else:
        logger.warning("Invalid OTP or it does not exist for the email.")
        return {
            "statusCode": 401,
            "body": json.dumps({
                "message": "Unauthorized"
            })
        }


def send_otp(to_email):
    logger.info(f"Sending OTP to email: {to_email}")
    otp = f"{random.randint(0, 999999):06}"
    from_email = 'xiangweiong@gmail.com'
    subject = 'Your WordPlay OTP'
    body = """
Hello,

Thank you for using WordPlay!

Your One-Time Password (OTP) is:
{otp}

Please enter this OTP to proceed. Remember, it will expire in 3 minutes.

Kind Regards,
WordPlay Team
    """.format(otp=otp)

    response = ses.send_email(
        Source=from_email,
        Destination={'ToAddresses': [to_email]},
        Message={
            'Subject': {'Data': subject},
            'Body': {'Text': {'Data': body}}
        }
    )
    return otp


def add_otp_to_dynamodb(to_email, otp, context):
    logger.info(f"Adding OTP to DynamoDB for email: {to_email}")
    table_name = 'wordplayotp'
    table = dynamodb.Table(table_name)

    expiration_time = int((datetime.now() + timedelta(minutes=3)).timestamp())
    item = {
        'id': context.aws_request_id,  # AWS auto-generated UUID
        'email': to_email,
        'otp': otp,
        'ttl': expiration_time
    }

    try:
        table.put_item(Item=item)
        logger.info("Item added successfully to DynamoDB.")
        return {
            'statusCode': 200,
            'body': json.dumps('Item added successfully')
        }
    except Exception as e:
        logger.error(f"Error adding item to DynamoDB: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps('Error adding item')
        }
