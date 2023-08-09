import boto3
import random
from datetime import datetime, timedelta
import json

dynamodb = boto3.resource('dynamodb')
ses = boto3.client('ses')


def lambda_handler(event=None, context=None):
    to_email = event['queryStringParameters']['email']
    otp = event['queryStringParameters']['otp']
    to_email = 'xiangweiong@gmail.com'

    # For OTP generation
    if otp == 'none':
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
    table_name = 'wordplayotp'
    table = dynamodb.Table(table_name)

    response = table.scan(
        FilterExpression='email = :emailValue AND otp = :otpValue',
        ExpressionAttributeValues={
            ':emailValue': to_email,
            ':otpValue': otp
        }
    )

    # If the response contains items, it means the OTP and email combo exists
    if response['Count'] > 0:
        item = response['Items'][0]
        if 'ttl' in item and item['ttl'] < int(datetime.now().timestamp()):
            return {
                "statusCode": 401,
                "body": json.dumps({
                    "message": "OTP expired"
                })
            }
        # Delete the OTP now that it's verified
        table.delete_item(
            Key={
                'id': item['id']
            }
        )

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


def send_otp(to_email):
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

    table_name = 'wordplayotp'
    table = dynamodb.Table(table_name)

    expiration_time = int((datetime.now() + timedelta(minutes=3)).timestamp())
    item = {
        'id': context.aws_request_id,  # aws auto generated uuid
        'email': to_email,
        'otp': otp,
        'ttl': expiration_time
    }

    try:
        table.put_item(Item=item)
        return {
            'statusCode': 200,
            'body': json.dumps('Item added successfully')
        }
    except Exception as e:
        print(str(e))
        return {
            'statusCode': 500,
            'body': json.dumps('Error adding item')
        }
